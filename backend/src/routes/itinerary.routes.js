import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import {
  getItinerary, addDay, updateDay, deleteDay, addItem, updateItem, deleteItem,
} from '../controllers/itinerary.controller.js';

const router = Router({ mergeParams: true });
router.use(requireAuth);

router.get('/', getItinerary);
router.post('/days', addDay);
router.patch('/days/:dayId', updateDay);
router.delete('/days/:dayId', deleteDay);
router.post('/days/:dayId/items', addItem);
router.patch('/items/:itemId', updateItem);
router.delete('/items/:itemId', deleteItem);

export default router;
