import api from './axios.js';

export const getItinerary = (tripId) =>
  api.get(`/trips/${tripId}/itinerary`).then((r) => r.data.days);

export const addDay = (tripId, data) =>
  api.post(`/trips/${tripId}/itinerary/days`, data).then((r) => r.data.day);

export const deleteDay = (tripId, dayId) =>
  api.delete(`/trips/${tripId}/itinerary/days/${dayId}`);

export const addItem = (tripId, dayId, data) =>
  api.post(`/trips/${tripId}/itinerary/days/${dayId}/items`, data).then((r) => r.data.item);

export const updateItem = (tripId, itemId, data) =>
  api.patch(`/trips/${tripId}/itinerary/items/${itemId}`, data).then((r) => r.data.item);

export const deleteItem = (tripId, itemId) =>
  api.delete(`/trips/${tripId}/itinerary/items/${itemId}`);
