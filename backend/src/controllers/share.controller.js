import { pool } from '../db/pool.js';
import { asyncHandler } from '../utils/asyncHandler.js';

// GET /api/share/:token — public, unauthenticated.
// Returns trip info + itinerary + checklist. Expenses/budget deliberately
// excluded for privacy; remove that restriction if you want to share them too.
export const getSharedTrip = asyncHandler(async (req, res) => {
  const tripResult = await pool.query(
    'SELECT id, title, destination, start_date, end_date, cover_image FROM trips WHERE share_token = $1 AND share_enabled = true',
    [req.params.token]
  );
  if (tripResult.rowCount === 0) {
    return res.status(404).json({ error: 'This share link is invalid or has been disabled' });
  }
  const trip = tripResult.rows[0];

  const days = await pool.query(
    'SELECT * FROM itinerary_days WHERE trip_id = $1 ORDER BY day_number ASC',
    [trip.id]
  );
  const items = await pool.query(
    `SELECT i.* FROM itinerary_items i
     JOIN itinerary_days d ON d.id = i.day_id
     WHERE d.trip_id = $1 ORDER BY i.order_index ASC`,
    [trip.id]
  );
  const todos = await pool.query(
    'SELECT id, text, category, is_done FROM todos WHERE trip_id = $1 ORDER BY order_index ASC',
    [trip.id]
  );

  const itemsByDay = {};
  for (const item of items.rows) (itemsByDay[item.day_id] ||= []).push(item);

  res.json({
    trip,
    days: days.rows.map((d) => ({ ...d, items: itemsByDay[d.id] || [] })),
    todos: todos.rows,
  });
});
