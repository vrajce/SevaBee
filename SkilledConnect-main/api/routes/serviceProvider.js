import express from 'express';
import { body } from 'express-validator';
import multer from 'multer';
import { auth, checkRole } from '../middleware/auth.js';
import {
  register,
  updateProfile,
  getProfile,
  search,
  getById,
  updateAvailability,
} from '../controllers/serviceProviderController.js';

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

// Register as service provider
router.post(
  '/register',
  auth,
  [
    body('businessName').trim().notEmpty().withMessage('Business name is required'),
    body('category').isIn(['plumbing', 'electrical', 'carpentry', 'mehendi', 'printing', 'tailoring', 'other'])
      .withMessage('Invalid category'),
    body('description').trim().notEmpty().withMessage('Description is required'),
    body('experience').isInt({ min: 0 }).withMessage('Experience must be a positive number'),
    body('services').isArray().withMessage('Services must be an array'),
  ],
  register
);

// Update profile
router.put(
  '/profile',
  auth,
  checkRole(['provider']),
  upload.fields([{ name: 'portfolio', maxCount: 5 }]),
  updateProfile
);

// Get own profile
router.get('/profile', auth, checkRole(['provider']), getProfile);

// Search providers
router.get('/search', search);

// Get provider by ID
router.get('/:id', getById);

// Update availability
router.put(
  '/availability',
  auth,
  checkRole(['provider']),
  [
    body('workingDays').isArray().withMessage('Working days must be an array'),
    body('workingHours.start').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
      .withMessage('Invalid start time format (HH:mm)'),
    body('workingHours.end').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
      .withMessage('Invalid end time format (HH:mm)'),
  ],
  updateAvailability
);

export default router; 