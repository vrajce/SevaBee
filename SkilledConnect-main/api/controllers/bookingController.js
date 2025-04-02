import { validationResult } from 'express-validator';
import Booking from '../models/Booking.js';
import ServiceProvider from '../models/ServiceProvider.js';
import stripe from '../config/stripe.js';
import { io } from '../server.js';

// Create booking
export const createBooking = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { providerId, service, scheduledDate, scheduledTime, location } = req.body;
    const userId = req.user.userId;

    // Check if provider exists and is available
    const provider = await ServiceProvider.findById(providerId);
    if (!provider) {
      return res.status(404).json({ message: 'Service provider not found' });
    }

    if (!provider.isAvailable) {
      return res.status(400).json({ message: 'Service provider is not available' });
    }

    // Create booking
    const booking = await Booking.create({
      userId,
      providerId,
      service,
      scheduledDate,
      scheduledTime,
      location,
      status: 'pending',
    });

    // Notify provider
    io.to(providerId.toString()).emit('newBooking', {
      booking,
      type: 'NEW_BOOKING',
    });

    res.status(201).json({
      message: 'Booking created successfully',
      booking,
    });
  } catch (error) {
    console.error('Error in createBooking:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get user bookings
export const getUserBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ userId: req.user.userId })
      .populate('providerId', 'businessName category rating')
      .sort({ scheduledDate: -1 });

    res.json({ bookings });
  } catch (error) {
    console.error('Error in getUserBookings:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get provider bookings
export const getProviderBookings = async (req, res) => {
  try {
    const provider = await ServiceProvider.findOne({ userId: req.user.userId });
    if (!provider) {
      return res.status(404).json({ message: 'Service provider not found' });
    }

    const bookings = await Booking.find({ providerId: provider._id })
      .populate('userId', 'name phone')
      .sort({ scheduledDate: -1 });

    res.json({ bookings });
  } catch (error) {
    console.error('Error in getProviderBookings:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Update booking status
export const updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const { id } = req.params;

    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Check if user is authorized
    const provider = await ServiceProvider.findOne({ userId: req.user.userId });
    if (!provider || provider._id.toString() !== booking.providerId.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    booking.status = status;
    await booking.save();

    // Notify user
    io.to(booking.userId.toString()).emit('bookingUpdate', {
      booking,
      type: 'BOOKING_STATUS_UPDATE',
    });

    res.json({
      message: 'Booking status updated successfully',
      booking,
    });
  } catch (error) {
    console.error('Error in updateBookingStatus:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Process payment
export const processPayment = async (req, res) => {
  try {
    const { bookingId, paymentMethodId } = req.body;

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: booking.service.price * 100, // Convert to cents
      currency: 'inr',
      payment_method: paymentMethodId,
      confirm: true,
    });

    // Update booking payment status
    booking.payment = {
      amount: booking.service.price,
      status: 'completed',
      transactionId: paymentIntent.id,
    };
    await booking.save();

    res.json({
      message: 'Payment processed successfully',
      booking,
    });
  } catch (error) {
    console.error('Error in processPayment:', error);
    res.status(500).json({ message: 'Payment processing failed' });
  }
}; 