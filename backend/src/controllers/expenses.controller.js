import { pool } from '../db/pool.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { getOwnedTripOrFail } from './trips.controller.js';

export const listExpenses = asyncHandler(async (req, res) => {
  await getOwnedTripOrFail(req.params.tripId, req.userId);
  const result = await pool.query(
    'SELECT * FROM expenses WHERE trip_id = $1 ORDER BY spent_on DESC, created_at DESC',
    [req.params.tripId]
  );
  res.json({ expenses: result.rows });
});

// Aggregated data shaped for Recharts: totals by category + running total by date.
export const getExpenseSummary = asyncHandler(async (req, res) => {
  const trip = await getOwnedTripOrFail(req.params.tripId, req.userId);

  const byCategory = await pool.query(
    `SELECT category, SUM(amount)::float AS total
     FROM expenses WHERE trip_id = $1
     GROUP BY category ORDER BY total DESC`,
    [req.params.tripId]
  );

  const byDate = await pool.query(
    `SELECT spent_on AS date, SUM(amount)::float AS total
     FROM expenses WHERE trip_id = $1
     GROUP BY spent_on ORDER BY spent_on ASC`,
    [req.params.tripId]
  );

  const totalSpent = byCategory.rows.reduce((sum, r) => sum + r.total, 0);

  res.json({
    currency: trip.currency,
    total_budget: Number(trip.total_budget),
    total_spent: totalSpent,
    remaining: Number(trip.total_budget) - totalSpent,
    by_category: byCategory.rows,
    by_date: byDate.rows,
  });
});

export const createExpense = asyncHandler(async (req, res) => {
  await getOwnedTripOrFail(req.params.tripId, req.userId);
  const { category, description, amount, currency, spent_on } = req.body;
  if (amount === undefined || amount === null) return res.status(400).json({ error: 'amount is required' });

  const result = await pool.query(
    `INSERT INTO expenses (trip_id, category, description, amount, currency, spent_on)
     VALUES ($1, COALESCE($2,'other'), $3, $4, COALESCE($5,'USD'), COALESCE($6, CURRENT_DATE))
     RETURNING *`,
    [req.params.tripId, category, description || null, amount, currency, spent_on]
  );
  res.status(201).json({ expense: result.rows[0] });
});

export const updateExpense = asyncHandler(async (req, res) => {
  await getOwnedTripOrFail(req.params.tripId, req.userId);
  const fields = ['category', 'description', 'amount', 'currency', 'spent_on'];
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

  values.push(req.params.expenseId, req.params.tripId);
  const result = await pool.query(
    `UPDATE expenses SET ${updates.join(', ')} WHERE id = $${i++} AND trip_id = $${i} RETURNING *`,
    values
  );
  if (result.rowCount === 0) return res.status(404).json({ error: 'Expense not found' });
  res.json({ expense: result.rows[0] });
});

export const deleteExpense = asyncHandler(async (req, res) => {
  await getOwnedTripOrFail(req.params.tripId, req.userId);
  await pool.query('DELETE FROM expenses WHERE id = $1 AND trip_id = $2', [req.params.expenseId, req.params.tripId]);
  res.status(204).send();
});
