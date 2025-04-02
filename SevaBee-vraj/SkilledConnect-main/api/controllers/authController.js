import twilio from 'twilio';
import jwt from 'jsonwebtoken';
import { validationResult } from 'express-validator';
import User from '../models/User.js';
import OTP from '../models/OTP.js';
import dotenv from 'dotenv';

dotenv.config();

const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

// Generate OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send OTP via Twilio
const sendOTP = async (phone, otp) => {
  try {
    await twilioClient.messages.create({
      body: `Your SkilledConnect verification code is: ${otp}`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phone
    });
    return true;
  } catch (error) {
    console.error('Error sending OTP:', error);
    return false;
  }
};

// Request OTP
export const requestOTP = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { phone } = req.body;
    const otp = generateOTP();

    // Save OTP to database
    await OTP.findOneAndDelete({ phone }); // Delete any existing OTP
    await OTP.create({ phone, otp });

    // Send OTP via SMS
    const sent = await sendOTP(phone, otp);
    if (!sent) {
      return res.status(500).json({ message: 'Failed to send OTP' });
    }

    res.status(200).json({ message: 'OTP sent successfully' });
  } catch (error) {
    console.error('Error in requestOTP:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Verify OTP and Register/Login User
export const verifyOTP = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { phone, otp, name } = req.body;

    // Verify OTP
    const otpRecord = await OTP.findOne({ phone, otp });
    if (!otpRecord) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    // Delete used OTP
    await OTP.deleteOne({ phone });

    // Find or create user
    let user = await User.findOne({ phone });
    if (!user) {
      if (!name) {
        return res.status(400).json({ message: 'Name is required for new users' });
      }
      user = await User.create({
        phone,
        name,
        isVerified: true
      });
    } else {
      user.isVerified = true;
      await user.save();
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(200).json({
      message: 'Authentication successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        phone: user.phone,
        role: user.role,
        isVerified: user.isVerified
      }
    });
  } catch (error) {
    console.error('Error in verifyOTP:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get User Profile
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({
      user: {
        id: user._id,
        name: user.name,
        phone: user.phone,
        email: user.email,
        role: user.role,
        address: user.address,
        isVerified: user.isVerified
      }
    });
  } catch (error) {
    console.error('Error in getProfile:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}; 