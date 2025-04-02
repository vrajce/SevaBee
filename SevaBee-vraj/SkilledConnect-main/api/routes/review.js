import express from 'express';
import { body } from 'express-validator';
import { auth } from '../middleware/auth.js';
import {
  createReview,
  getProviderReviews,
  getUserReviews,
} from '../controllers/reviewController.js';

const router = express.Router();

// Create review
router.post(
  '/',
  auth,
  [
    body('bookingId').isMongoId().withMessage('Invalid booking ID'),
    body('score').isInt({ min: 1, max: 5 }).withMessage('Score must be between 1 and 5'),
    body('review').trim().isLength({ min: 10 }).withMessage('Review must be at least 10 characters'),
  ],
  createReview
);

// Get provider reviews
router.get('/provider/:providerId', getProviderReviews);

// Get user reviews
router.get('/user', auth, getUserReviews);

export default router; 