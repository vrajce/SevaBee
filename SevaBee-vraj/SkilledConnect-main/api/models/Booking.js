import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  providerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ServiceProvider',
    required: true,
  },
  service: {
    name: String,
    price: Number,
    duration: Number,
  },
  scheduledDate: {
    type: Date,
    required: true,
  },
  scheduledTime: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'in-progress', 'completed', 'cancelled'],
    default: 'pending',
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point',
    },
    coordinates: {
      type: [Number],
      default: [0, 0],
    },
    address: {
      street: String,
      city: String,
      state: String,
      pincode: String,
    },
  },
  payment: {
    amount: Number,
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'refunded'],
      default: 'pending',
    },
    transactionId: String,
  },
  rating: {
    score: {
      type: Number,
      min: 1,
      max: 5,
    },
    review: String,
    createdAt: Date,
  },
  notes: String,
  cancelReason: String,
}, { timestamps: true });

bookingSchema.index({ location: '2dsphere' });

export default mongoose.model('Booking', bookingSchema); 