import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'senderType',
      required: true,
    },
    senderType: {
      type: String,
      enum: ['User', 'ServiceProvider'],
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    read: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const chatSchema = new mongoose.Schema(
  {
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
    messages: [messageSchema],
    lastMessage: {
      type: Date,
      default: Date.now,
    },
    userUnread: {
      type: Number,
      default: 0,
    },
    providerUnread: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for faster queries
chatSchema.index({ user: 1, lastMessage: -1 });
chatSchema.index({ provider: 1, lastMessage: -1 });
chatSchema.index({ user: 1, provider: 1 }, { unique: true });

const Chat = mongoose.model('Chat', chatSchema);

export default Chat; 