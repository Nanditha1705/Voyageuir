import { pool } from '../db/pool.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { getOwnedTripOrFail } from './trips.controller.js';

export const listTodos = asyncHandler(async (req, res) => {
  await getOwnedTripOrFail(req.params.tripId, req.userId);
  const result = await pool.query(
    'SELECT * FROM todos WHERE trip_id = $1 ORDER BY order_index ASC, created_at ASC',
    [req.params.tripId]
  );
  res.json({ todos: result.rows });
});

export const createTodo = asyncHandler(async (req, res) => {
  await getOwnedTripOrFail(req.params.tripId, req.userId);
  const { text, category, order_index } = req.body;
  if (!text) return res.status(400).json({ error: 'text is required' });

  const result = await pool.query(
    `INSERT INTO todos (trip_id, text, category, order_index)
     VALUES ($1,$2,COALESCE($3,'general'),COALESCE($4,0)) RETURNING *`,
    [req.params.tripId, text, category, order_index]
  );
  res.status(201).json({ todo: result.rows[0] });
});

export const updateTodo = asyncHandler(async (req, res) => {
  await getOwnedTripOrFail(req.params.tripId, req.userId);
  const { text, category, is_done, order_index } = req.body;
  const result = await pool.query(
    `UPDATE todos SET
       text = COALESCE($1, text),
       category = COALESCE($2, category),
       is_done = COALESCE($3, is_done),
       order_index = COALESCE($4, order_index)
     WHERE id = $5 AND trip_id = $6 RETURNING *`,
    [text, category, is_done, order_index, req.params.todoId, req.params.tripId]
  );
  if (result.rowCount === 0) return res.status(404).json({ error: 'Todo not found' });
  res.json({ todo: result.rows[0] });
});

export const deleteTodo = asyncHandler(async (req, res) => {
  await getOwnedTripOrFail(req.params.tripId, req.userId);
  await pool.query('DELETE FROM todos WHERE id = $1 AND trip_id = $2', [req.params.todoId, req.params.tripId]);
  res.status(204).send();
});
