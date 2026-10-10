import api from './axios.js';

export const listExpenses = (tripId) => api.get(`/trips/${tripId}/expenses`).then((r) => r.data.expenses);
export const getExpenseSummary = (tripId) => api.get(`/trips/${tripId}/expenses/summary`).then((r) => r.data);
export const createExpense = (tripId, data) => api.post(`/trips/${tripId}/expenses`, data).then((r) => r.data.expense);
export const deleteExpense = (tripId, expenseId) => api.delete(`/trips/${tripId}/expenses/${expenseId}`);
