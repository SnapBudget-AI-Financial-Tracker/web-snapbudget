// backend/src/routes/savingGoalRoutes.js
import express from 'express';
import {
  getSavingGoals,
  createSavingGoal,
  updateSavingGoal,
  addToSavingGoal,
  deleteSavingGoal,
} from '../controllers/savingGoalController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();
router.use(authMiddleware);

router.get('/',           getSavingGoals);
router.post('/',          createSavingGoal);
router.put('/:id',        updateSavingGoal);
router.post('/:id/add',   addToSavingGoal);
router.delete('/:id',     deleteSavingGoal);

export default router;