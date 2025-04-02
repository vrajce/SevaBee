import express from 'express';
import {
  getChatList,
  getChatMessages,
  createChat,
  sendMessage,
} from '../controllers/chatController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Get user's chat list
router.get('/list', protect, getChatList);

// Get chat messages
router.get('/:chatId', protect, getChatMessages);

// Create or get chat
router.post('/create', protect, createChat);

// Send message
router.post('/message', protect, sendMessage);

export default router; 