import mongoose from 'mongoose';

const serviceProviderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  businessName: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
    enum: ['plumbing', 'electrical', 'carpentry', 'mehendi', 'printing', 'tailoring', 'other'],
  },
  description: {
    type: String,
    required: true,
  },
  experience: {
    type: Number,
    required: true,
  },
  services: [{
    name: String,
    description: String,
    price: Number,
    duration: Number, // in minutes
  }],
  portfolio: [{
    title: String,
    description: String,
    imageUrl: String,
  }],
  availability: {
    workingDays: [{
      type: String,
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    }],
    workingHours: {
      start: String,
      end: String,
    },
  },
  rating: {
    type: Number,
    default: 0,
  },
  totalRatings: {
    type: Number,
    default: 0,
  },
  isAvailable: {
    type: Boolean,
    default: true,
  },
  documents: [{
    type: String,
    documentUrl: String,
    verified: {
      type: Boolean,
      default: false,
    },
  }],
}, { timestamps: true });

export default mongoose.model('ServiceProvider', serviceProviderSchema); 