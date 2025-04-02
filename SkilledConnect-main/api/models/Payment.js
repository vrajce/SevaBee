import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema(
  {
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    provider: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ServiceProvider',
      required: true,
    },
    orderId: {
      type: String,
      required: true,
      unique: true,
    },
    paymentId: {
      type: String,
      sparse: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: 'INR',
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed'],
      default: 'pending',
    },
    paidAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
paymentSchema.index({ user: 1, createdAt: -1 });
paymentSchema.index({ provider: 1, status: 1, paidAt: -1 });
paymentSchema.index({ orderId: 1 }, { unique: true });

const Payment = mongoose.model('Payment', paymentSchema);

export default Payment; 