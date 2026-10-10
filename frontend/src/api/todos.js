import api from './axios.js';

export const listTodos = (tripId) => api.get(`/trips/${tripId}/todos`).then((r) => r.data.todos);
export const createTodo = (tripId, data) => api.post(`/trips/${tripId}/todos`, data).then((r) => r.data.todo);
export const updateTodo = (tripId, todoId, data) =>
  api.patch(`/trips/${tripId}/todos/${todoId}`, data).then((r) => r.data.todo);
export const deleteTodo = (tripId, todoId) => api.delete(`/trips/${tripId}/todos/${todoId}`);
