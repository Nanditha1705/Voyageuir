import { Router } from 'express';
import { getSharedTrip } from '../controllers/share.controller.js';

const router = Router();
router.get('/:token', getSharedTrip); // deliberately NOT behind requireAuth

export default router;
