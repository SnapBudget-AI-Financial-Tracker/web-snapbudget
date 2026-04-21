import express from 'express';
import multer from 'multer';
import { uploadAvatar, updateProfile, updateBudget, getBudgetSettings } from '../controllers/userController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB max file size
});

router.post('/avatar', authMiddleware, upload.single('avatar'), uploadAvatar);
router.put('/profile', authMiddleware, updateProfile);
router.put('/budget', authMiddleware, updateBudget);
router.get('/budget', authMiddleware, getBudgetSettings);

export default router;
