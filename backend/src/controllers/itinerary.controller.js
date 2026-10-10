import { pool } from '../db/pool.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { getOwnedTripOrFail } from './trips.controller.js';

// Full itinerary for a trip: days, each with its ordered items.
export const getItinerary = asyncHandler(async (req, res) => {
  await getOwnedTripOrFail(req.params.tripId, req.userId);

  const days = await pool.query(
    'SELECT * FROM itinerary_days WHERE trip_id = $1 ORDER BY day_number ASC',
    [req.params.tripId]
  );
  const items = await pool.query(
    `SELECT i.* FROM itinerary_items i
     JOIN itinerary_days d ON d.id = i.day_id
     WHERE d.trip_id = $1
     ORDER BY i.order_index ASC`,
    [req.params.tripId]
  );

  const itemsByDay = {};
  for (const item of items.rows) {
    (itemsByDay[item.day_id] ||= []).push(item);
  }

  const result = days.rows.map((d) => ({ ...d, items: itemsByDay[d.id] || [] }));
  res.json({ days: result });
});

export const addDay = asyncHandler(async (req, res) => {
  await getOwnedTripOrFail(req.params.tripId, req.userId);
  const { day_number, date, notes } = req.body;
  if (!day_number) return res.status(400).json({ error: 'day_number is required' });

  const result = await pool.query(
    `INSERT INTO itinerary_days (trip_id, day_number, date, notes)
     VALUES ($1,$2,$3,$4) RETURNING *`,
    [req.params.tripId, day_number, date || null, notes || null]
  );
  res.status(201).json({ day: result.rows[0] });
});

export const updateDay = asyncHandler(async (req, res) => {
  await getOwnedTripOrFail(req.params.tripId, req.userId);
  const { date, notes } = req.body;
  const result = await pool.query(
    `UPDATE itinerary_days SET date = COALESCE($1, date), notes = COALESCE($2, notes)
     WHERE id = $3 AND trip_id = $4 RETURNING *`,
    [date, notes, req.params.dayId, req.params.tripId]
  );
  if (result.rowCount === 0) return res.status(404).json({ error: 'Day not found' });
  res.json({ day: result.rows[0] });
});

export const deleteDay = asyncHandler(async (req, res) => {
  await getOwnedTripOrFail(req.params.tripId, req.userId);
  await pool.query('DELETE FROM itinerary_days WHERE id = $1 AND trip_id = $2', [req.params.dayId, req.params.tripId]);
  res.status(204).send();
});

export const addItem = asyncHandler(async (req, res) => {
  await getOwnedTripOrFail(req.params.tripId, req.userId);
  const { time, title, location_name, lat, lng, notes, order_index } = req.body;
  if (!title) return res.status(400).json({ error: 'title is required' });

  const result = await pool.query(
    `INSERT INTO itinerary_items (day_id, time, title, location_name, lat, lng, notes, order_index)
     VALUES ($1,$2,$3,$4,$5,$6,$7,COALESCE($8,0)) RETURNING *`,
    [req.params.dayId, time || null, title, location_name || null, lat ?? null, lng ?? null, notes || null, order_index]
  );
  res.status(201).json({ item: result.rows[0] });
});

export const updateItem = asyncHandler(async (req, res) => {
  await getOwnedTripOrFail(req.params.tripId, req.userId);
  const fields = ['time', 'title', 'location_name', 'lat', 'lng', 'notes', 'order_index'];
  const updates = [];
  const values = [];
  let i = 1;
  for (const f of fields) {
    if (f in req.body) {
      updates.push(`${f} = $${i++}`);
      values.push(req.body[f]);
    }
  }
  if (updates.length === 0) return res.status(400).json({ error: 'No fields to update' });

  values.push(req.params.itemId);
  const result = await pool.query(
    `UPDATE itinerary_items SET ${updates.join(', ')} WHERE id = $${i} RETURNING *`,
    values
  );
  if (result.rowCount === 0) return res.status(404).json({ error: 'Item not found' });
  res.json({ item: result.rows[0] });
});

export const deleteItem = asyncHandler(async (req, res) => {
  await getOwnedTripOrFail(req.params.tripId, req.userId);
  await pool.query('DELETE FROM itinerary_items WHERE id = $1', [req.params.itemId]);
  res.status(204).send();
});
