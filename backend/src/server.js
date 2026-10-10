import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import authRoutes from './routes/auth.routes.js';
import tripsRoutes from './routes/trips.routes.js';
import itineraryRoutes from './routes/itinerary.routes.js';
import todosRoutes from './routes/todos.routes.js';
import expensesRoutes from './routes/expenses.routes.js';
import shareRoutes from './routes/share.routes.js';
import { notFound, errorHandler } from './middleware/errorHandler.js';

dotenv.config();

const app = express();

app.use(cors({ origin: process.env.CORS_ORIGIN || 'http://localhost:5173' }));
app.use(express.json());

app.get('/api/health', (req, res) => res.json({ ok: true }));

app.use('/api/auth', authRoutes);
app.use('/api/trips', tripsRoutes);
// Nested resources under a trip
app.use('/api/trips/:tripId/itinerary', itineraryRoutes);
app.use('/api/trips/:tripId/todos', todosRoutes);
app.use('/api/trips/:tripId/expenses', expensesRoutes);
// Public read-only share link
app.use('/api/share', shareRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`API listening on http://localhost:${PORT}`));
