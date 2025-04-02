import Razorpay from 'razorpay';
import crypto from 'crypto';
import Payment from '../models/Payment.js';
import Booking from '../models/Booking.js';
import { createNotification } from './notificationController.js';

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Create payment order
export const createPaymentOrder = async (req, res) => {
  try {
    const { bookingId } = req.body;
    const booking = await Booking.findById(bookingId)
      .populate('provider', 'businessName')
      .populate('user', 'name email');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    const options = {
      amount: booking.totalAmount * 100, // Razorpay expects amount in paise
      currency: 'INR',
      receipt: bookingId,
      payment_capture: 1,
    };

    const order = await razorpay.orders.create(options);

    const payment = new Payment({
      booking: bookingId,
      user: req.user._id,
      provider: booking.provider._id,
      orderId: order.id,
      amount: booking.totalAmount,
    });

    await payment.save();

    res.json({
      orderId: order.id,
      amount: booking.totalAmount,
      currency: 'INR',
      provider: booking.provider.businessName,
    });
  } catch (error) {
    console.error('Payment order creation error:', error);
    res.status(500).json({ message: 'Error creating payment order' });
  }
};

// Verify payment
export const verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body;

    const sign = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(sign)
      .digest('hex');

    if (razorpay_signature !== expectedSign) {
      return res.status(400).json({ message: 'Invalid payment signature' });
    }

    const payment = await Payment.findOne({ orderId: razorpay_order_id });
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    payment.status = 'completed';
    payment.paymentId = razorpay_payment_id;
    payment.paidAt = new Date();
    await payment.save();

    const booking = await Booking.findById(payment.booking);
    booking.paymentStatus = 'paid';
    booking.status = 'confirmed';
    await booking.save();

    // Create notifications
    await createNotification({
      user: payment.user,
      type: 'payment_success',
      title: 'Payment Successful',
      message: `Your payment of ₹${payment.amount} has been processed successfully.`,
      data: { bookingId: payment.booking },
    });

    await createNotification({
      user: payment.provider,
      type: 'new_payment',
      title: 'New Payment Received',
      message: `You have received a payment of ₹${payment.amount} for booking #${payment.booking}.`,
      data: { bookingId: payment.booking },
    });

    res.json({ message: 'Payment verified successfully' });
  } catch (error) {
    console.error('Payment verification error:', error);
    res.status(500).json({ message: 'Error verifying payment' });
  }
};

// Get payment history
export const getPaymentHistory = async (req, res) => {
  try {
    const payments = await Payment.find({ user: req.user._id })
      .populate('booking', 'date startTime duration')
      .populate('provider', 'businessName')
      .sort({ createdAt: -1 });

    res.json(payments);
  } catch (error) {
    console.error('Payment history error:', error);
    res.status(500).json({ message: 'Error fetching payment history' });
  }
};

// Get provider earnings
export const getProviderEarnings = async (req, res) => {
  try {
    const payments = await Payment.find({
      provider: req.user._id,
      status: 'completed',
    })
      .populate('booking', 'date startTime duration')
      .populate('user', 'name')
      .sort({ paidAt: -1 });

    const totalEarnings = payments.reduce((sum, payment) => sum + payment.amount, 0);
    const monthlyEarnings = payments
      .filter(
        (payment) =>
          payment.paidAt.getMonth() === new Date().getMonth() &&
          payment.paidAt.getFullYear() === new Date().getFullYear()
      )
      .reduce((sum, payment) => sum + payment.amount, 0);

    res.json({
      payments,
      totalEarnings,
      monthlyEarnings,
    });
  } catch (error) {
    console.error('Provider earnings error:', error);
    res.status(500).json({ message: 'Error fetching provider earnings' });
  }
}; 