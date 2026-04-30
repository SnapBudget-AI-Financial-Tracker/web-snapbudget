// backend/src/routes/gamificationRoutes.js
import express from 'express';
import { getGamification } from '../controllers/gamificationController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();
router.use(authMiddleware);
router.get('/', getGamification);

export default router;