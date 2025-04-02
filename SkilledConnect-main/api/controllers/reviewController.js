import { validationResult } from 'express-validator';
import Booking from '../models/Booking.js';
import ServiceProvider from '../models/ServiceProvider.js';
import { io } from '../server.js';

// Create review
export const createReview = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { bookingId, score, review } = req.body;
    const userId = req.user.userId;

    // Check if booking exists and is completed
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.userId.toString() !== userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (booking.status !== 'completed') {
      return res.status(400).json({ message: 'Can only review completed bookings' });
    }

    if (booking.rating) {
      return res.status(400).json({ message: 'Booking already reviewed' });
    }

    // Add review to booking
    booking.rating = {
      score,
      review,
      createdAt: new Date(),
    };
    await booking.save();

    // Update service provider rating
    const provider = await ServiceProvider.findById(booking.providerId);
    const totalScore = provider.rating * provider.totalRatings + score;
    provider.totalRatings += 1;
    provider.rating = totalScore / provider.totalRatings;
    await provider.save();

    // Notify provider
    io.to(provider._id.toString()).emit('newReview', {
      booking,
      type: 'NEW_REVIEW',
    });

    res.status(201).json({
      message: 'Review submitted successfully',
      booking,
    });
  } catch (error) {
    console.error('Error in createReview:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get provider reviews
export const getProviderReviews = async (req, res) => {
  try {
    const { providerId } = req.params;

    const reviews = await Booking.find({
      providerId,
      'rating.score': { $exists: true },
    })
      .populate('userId', 'name')
      .select('rating service scheduledDate')
      .sort({ 'rating.createdAt': -1 });

    res.json({ reviews });
  } catch (error) {
    console.error('Error in getProviderReviews:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get user reviews
export const getUserReviews = async (req, res) => {
  try {
    const reviews = await Booking.find({
      userId: req.user.userId,
      'rating.score': { $exists: true },
    })
      .populate('providerId', 'businessName category')
      .select('rating service scheduledDate')
      .sort({ 'rating.createdAt': -1 });

    res.json({ reviews });
  } catch (error) {
    console.error('Error in getUserReviews:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}; 