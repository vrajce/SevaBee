import express from 'express';
import { body } from 'express-validator';
import { auth, checkRole } from '../middleware/auth.js';
import {
  createBooking,
  getUserBookings,
  getProviderBookings,
  updateBookingStatus,
  processPayment,
} from '../controllers/bookingController.js';

const router = express.Router();

// Create booking
router.post(
  '/',
  auth,
  [
    body('providerId').isMongoId().withMessage('Invalid provider ID'),
    body('service.name').trim().notEmpty().withMessage('Service name is required'),
    body('service.price').isNumeric().withMessage('Service price must be a number'),
    body('scheduledDate').isISO8601().withMessage('Invalid date format'),
    body('scheduledTime').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
      .withMessage('Invalid time format (HH:mm)'),
    body('location.coordinates').isArray().withMessage('Location coordinates must be an array'),
    body('location.address').isObject().withMessage('Location address must be an object'),
  ],
  createBooking
);

// Get user bookings
router.get('/user', auth, getUserBookings);

// Get provider bookings
router.get('/provider', auth, checkRole(['provider']), getProviderBookings);

// Update booking status
router.put(
  '/:id/status',
  auth,
  checkRole(['provider']),
  [
    body('status')
      .isIn(['pending', 'confirmed', 'in-progress', 'completed', 'cancelled'])
      .withMessage('Invalid status'),
  ],
  updateBookingStatus
);

// Process payment
router.post(
  '/payment',
  auth,
  [
    body('bookingId').isMongoId().withMessage('Invalid booking ID'),
    body('paymentMethodId').notEmpty().withMessage('Payment method ID is required'),
  ],
  processPayment
);

export default router; 