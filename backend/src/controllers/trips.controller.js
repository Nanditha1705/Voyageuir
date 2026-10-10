import { pool } from '../db/pool.js';
import { asyncHandler } from '../utils/asyncHandler.js';

// Shared helper: throws a 404 if the trip doesn't exist, 403 if it isn't owned by userId.
// Reused by itinerary/todos/expenses controllers to enforce per-trip ownership.
export async function getOwnedTripOrFail(tripId, userId) {
  const result = await pool.query('SELECT * FROM trips WHERE id = $1', [tripId]);
  if (result.rowCount === 0) {
    const err = new Error('Trip not found');
    err.status = 404;
    throw err;
  }
  const trip = result.rows[0];
  if (trip.user_id !== userId) {
    const err = new Error('You do not have access to this trip');
    err.status = 403;
    throw err;
  }
  return trip;
}

export const listTrips = asyncHandler(async (req, res) => {
  const result = await pool.query(
    'SELECT * FROM trips WHERE user_id = $1 ORDER BY start_date NULLS LAST, created_at DESC',
    [req.userId]
  );
  res.json({ trips: result.rows });
});

export const getTrip = asyncHandler(async (req, res) => {
  const trip = await getOwnedTripOrFail(req.params.tripId, req.userId);
  res.json({ trip });
});

export const createTrip = asyncHandler(async (req, res) => {
  const { title, destination, start_date, end_date, currency, total_budget, cover_image } = req.body;
  if (!title) return res.status(400).json({ error: 'title is required' });

  const result = await pool.query(
    `INSERT INTO trips (user_id, title, destination, start_date, end_date, currency, total_budget, cover_image)
     VALUES ($1,$2,$3,$4,$5,COALESCE($6,'USD'),COALESCE($7,0),$8)
     RETURNING *`,
    [req.userId, title, destination || null, start_date || null, end_date || null, currency, total_budget, cover_image || null]
  );
  res.status(201).json({ trip: result.rows[0] });
});

export const updateTrip = asyncHandler(async (req, res) => {
  await getOwnedTripOrFail(req.params.tripId, req.userId);
  const fields = ['title', 'destination', 'start_date', 'end_date', 'currency', 'total_budget', 'cover_image'];
  const updates = [];
  const values = [];
  let i = 1;

  for (const field of fields) {
    if (field in req.body) {
      updates.push(`${field} = $${i++}`);
      values.push(req.body[field]);
    }
  }
  if (updates.length === 0) return res.status(400).json({ error: 'No fields to update' });

  values.push(req.params.tripId);
  const result = await pool.query(
    `UPDATE trips SET ${updates.join(', ')} WHERE id = $${i} RETURNING *`,
    values
  );
  res.json({ trip: result.rows[0] });
});

export const deleteTrip = asyncHandler(async (req, res) => {
  await getOwnedTripOrFail(req.params.tripId, req.userId);
  await pool.query('DELETE FROM trips WHERE id = $1', [req.params.tripId]);
  res.status(204).send();
});

// Toggle / regenerate the public share link
export const updateShareSettings = asyncHandler(async (req, res) => {
  await getOwnedTripOrFail(req.params.tripId, req.userId);
  const { share_enabled, regenerate } = req.body;

  const sets = [];
  const values = [];
  let i = 1;

  if (typeof share_enabled === 'boolean') {
    sets.push(`share_enabled = $${i++}`);
    values.push(share_enabled);
  }
  if (regenerate) {
    sets.push(`share_token = uuid_generate_v4()`);
  }
  if (sets.length === 0) return res.status(400).json({ error: 'Nothing to update' });

  values.push(req.params.tripId);
  const result = await pool.query(
    `UPDATE trips SET ${sets.join(', ')} WHERE id = $${i} RETURNING id, share_token, share_enabled`,
    values
  );
  res.json({ trip: result.rows[0] });
});
