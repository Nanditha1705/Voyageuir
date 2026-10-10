import { useEffect, useState } from 'react';
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from 'recharts';
import * as expensesApi from '../api/expenses.js';

const COLORS = ['#2563eb', '#16a34a', '#f59e0b', '#dc2626', '#7c3aed', '#0891b2', '#db2777'];

export default function BudgetTracker({ tripId }) {
  const [expenses, setExpenses] = useState([]);
  const [summary, setSummary] = useState(null);
  const [form, setForm] = useState({ category: 'other', description: '', amount: '', spent_on: '' });
  const [loading, setLoading] = useState(true);

  const load = () =>
    Promise.all([expensesApi.listExpenses(tripId), expensesApi.getExpenseSummary(tripId)]).then(
      ([exp, sum]) => { setExpenses(exp); setSummary(sum); }
    ).finally(() => setLoading(false));

  useEffect(() => { load(); }, [tripId]);

  const addExpense = async (e) => {
    e.preventDefault();
    if (!form.amount) return;
    await expensesApi.createExpense(tripId, { ...form, amount: Number(form.amount) });
    setForm({ category: 'other', description: '', amount: '', spent_on: '' });
    load();
  };

  const remove = async (id) => {
    await expensesApi.deleteExpense(tripId, id);
    load();
  };

  if (loading) return <p>Loading budget…</p>;

  const overBudget = summary.remaining < 0;

  return (
    <div>
      <div className="grid">
        <div className="card">
          <h4>Budget overview</h4>
          <p>Total budget: <strong>{summary.total_budget.toFixed(2)} {summary.currency}</strong></p>
          <p>Total spent: <strong>{summary.total_spent.toFixed(2)} {summary.currency}</strong></p>
          <p style={{ color: overBudget ? '#dc2626' : '#16a34a' }}>
            {overBudget ? 'Over budget by' : 'Remaining'}: <strong>{Math.abs(summary.remaining).toFixed(2)} {summary.currency}</strong>
          </p>
        </div>

        <div className="card">
          <h4>Spend by category</h4>
          {summary.by_category.length === 0 ? (
            <p style={{ color: '#6b7280' }}>No expenses logged yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={summary.by_category} dataKey="total" nameKey="category" outerRadius={80} label>
                  {summary.by_category.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => `${v.toFixed(2)} ${summary.currency}`} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {summary.by_date.length > 0 && (
        <div className="card">
          <h4>Spend over time</h4>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={summary.by_date}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tickFormatter={(d) => d.slice(5)} />
              <YAxis />
              <Tooltip formatter={(v) => `${v.toFixed(2)} ${summary.currency}`} />
              <Bar dataKey="total" fill="#2563eb" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="card">
        <h4>Log an expense</h4>
        <form onSubmit={addExpense} className="row">
          <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} style={{ padding: 8 }}>
            <option value="flights">Flights</option>
            <option value="lodging">Lodging</option>
            <option value="food">Food</option>
            <option value="activities">Activities</option>
            <option value="transport">Transport</option>
            <option value="other">Other</option>
          </select>
          <input placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} style={{ flex: 1, padding: 8 }} />
          <input type="number" min="0" step="0.01" placeholder="Amount" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} style={{ width: 120, padding: 8 }} required />
          <input type="date" value={form.spent_on} onChange={(e) => setForm({ ...form, spent_on: e.target.value })} style={{ padding: 8 }} />
          <button className="btn" type="submit">Add</button>
        </form>
      </div>

      <div className="card">
        <h4>All expenses</h4>
        {expenses.length === 0 ? (
          <p style={{ color: '#6b7280' }}>None yet.</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <tbody>
              {expenses.map((exp) => (
                <tr key={exp.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                  <td style={{ padding: 6, textTransform: 'capitalize' }}>{exp.category}</td>
                  <td style={{ padding: 6 }}>{exp.description || '—'}</td>
                  <td style={{ padding: 6 }}>{exp.spent_on?.slice(0, 10)}</td>
                  <td style={{ padding: 6, fontWeight: 600 }}>{Number(exp.amount).toFixed(2)} {exp.currency}</td>
                  <td style={{ padding: 6 }}>
                    <button className="btn danger" style={{ padding: '2px 8px', fontSize: 12 }} onClick={() => remove(exp.id)}>✕</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
