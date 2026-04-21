import express from 'express';
import multer from 'multer';
import {
  createTransaction,
  getTransactions,
  getTransactionById,
  updateTransaction,
  deleteTransaction,
  scanStruk,
  getDashboard,
} from '../controllers/transactionController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// All transaction routes require authentication
router.use(authMiddleware);

// AI-powered routes
router.post('/scan-struk', upload.single('file'), scanStruk);
router.get('/dashboard', getDashboard);

// Standard CRUD routes
router.post('/', createTransaction);
router.get('/', getTransactions);
router.get('/:id', getTransactionById);
router.put('/:id', updateTransaction);
router.delete('/:id', deleteTransaction);

export default router;
