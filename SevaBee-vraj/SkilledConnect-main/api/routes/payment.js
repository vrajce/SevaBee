import express from 'express';
import {
  createPaymentOrder,
  verifyPayment,
  getPaymentHistory,
  getProviderEarnings,
} from '../controllers/paymentController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Create payment order
router.post('/create-order', protect, createPaymentOrder);

// Verify payment
router.post('/verify', protect, verifyPayment);

// Get payment history
router.get('/history', protect, getPaymentHistory);

// Get provider earnings
router.get('/earnings', protect, getProviderEarnings);

export default router; 