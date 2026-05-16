// backend/src/controllers/gamificationController.js
import prisma from '../config/prisma.js';
import { getGamificationData } from '../services/gamificationService.js';

export const getGamification = async (req, res) => {
  try {
    const userId = req.user.id;
    const data   = await getGamificationData(userId);
    res.json(data);
  } catch (error) {
    if (process.env.NODE_ENV !== 'test') {
      console.error('Gamification error:', error);
    }
    res.status(500).json({ message: 'Gagal mengambil data gamifikasi' });
  }
};