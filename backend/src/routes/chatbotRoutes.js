// backend/src/routes/chatbotRoutes.js
import express from 'express';
import { chat } from '../controllers/chatbotController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();
router.use(authMiddleware);
router.post('/chat', chat);

export default router;