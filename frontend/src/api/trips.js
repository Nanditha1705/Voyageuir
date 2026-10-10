import api from './axios.js';

export const listTrips = () => api.get('/trips').then((r) => r.data.trips);
export const getTrip = (tripId) => api.get(`/trips/${tripId}`).then((r) => r.data.trip);
export const createTrip = (data) => api.post('/trips', data).then((r) => r.data.trip);
export const updateTrip = (tripId, data) => api.patch(`/trips/${tripId}`, data).then((r) => r.data.trip);
export const deleteTrip = (tripId) => api.delete(`/trips/${tripId}`);
export const updateShareSettings = (tripId, data) =>
  api.patch(`/trips/${tripId}/share`, data).then((r) => r.data.trip);
export const getSharedTrip = (token) => api.get(`/share/${token}`).then((r) => r.data);
