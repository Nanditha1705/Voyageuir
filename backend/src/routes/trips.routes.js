import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import {
  listTrips, getTrip, createTrip, updateTrip, deleteTrip, updateShareSettings,
} from '../controllers/trips.controller.js';

const router = Router();
router.use(requireAuth);

router.get('/', listTrips);
router.post('/', createTrip);
router.get('/:tripId', getTrip);
router.patch('/:tripId', updateTrip);
router.delete('/:tripId', deleteTrip);
router.patch('/:tripId/share', updateShareSettings);

export default router;
