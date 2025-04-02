import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  phone: {
    type: String,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: false,
  },
  role: {
    type: String,
    enum: ['user', 'provider', 'admin'],
    default: 'user',
  },
  address: {
    street: String,
    city: String,
    state: String,
    pincode: String,
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
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
}, { timestamps: true });

userSchema.index({ location: '2dsphere' });

export default mongoose.model('User', userSchema); 