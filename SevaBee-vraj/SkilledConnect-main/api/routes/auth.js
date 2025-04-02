import express from 'express';
import { body } from 'express-validator';
import { requestOTP, verifyOTP, getProfile } from '../controllers/authController.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

// Request OTP
router.post('/request-otp',
  [
    body('phone')
      .matches(/^[0-9]{10}$/)
      .withMessage('Please enter a valid 10-digit phone number')
  ],
  requestOTP
);

// Verify OTP and Register/Login
router.post('/verify-otp',
  [
    body('phone')
      .matches(/^[0-9]{10}$/)
      .withMessage('Please enter a valid 10-digit phone number'),
    body('otp')
      .matches(/^[0-9]{6}$/)
      .withMessage('Please enter a valid 6-digit OTP'),
    body('name')
      .optional()
      .isLength({ min: 2 })
      .withMessage('Name must be at least 2 characters long')
  ],
  verifyOTP
);

// Get user profile
router.get('/profile', auth, getProfile);

export default router; 