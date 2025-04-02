import Chat from '../models/Chat.js';
import { createNotification } from './notificationController.js';

// Get user's chat list
export const getChatList = async (req, res) => {
  try {
    const isProvider = req.user.role === 'provider';
    const query = isProvider
      ? { provider: req.user._id }
      : { user: req.user._id };

    const chats = await Chat.find(query)
      .populate(isProvider ? 'user' : 'provider', 'name avatar businessName')
      .select('-messages')
      .sort({ lastMessage: -1 });

    res.json(chats);
  } catch (error) {
    console.error('Get chat list error:', error);
    res.status(500).json({ message: 'Error fetching chat list' });
  }
};

// Get chat messages
export const getChatMessages = async (req, res) => {
  try {
    const { chatId } = req.params;
    const isProvider = req.user.role === 'provider';

    const chat = await Chat.findById(chatId)
      .populate(isProvider ? 'user' : 'provider', 'name avatar businessName');

    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    // Verify user has access to this chat
    if (
      (isProvider && chat.provider.toString() !== req.user._id.toString()) ||
      (!isProvider && chat.user.toString() !== req.user._id.toString())
    ) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Mark messages as read
    if (isProvider && chat.providerUnread > 0) {
      chat.providerUnread = 0;
      chat.messages.forEach((msg) => {
        if (msg.senderType === 'User') {
          msg.read = true;
        }
      });
      await chat.save();
    } else if (!isProvider && chat.userUnread > 0) {
      chat.userUnread = 0;
      chat.messages.forEach((msg) => {
        if (msg.senderType === 'ServiceProvider') {
          msg.read = true;
        }
      });
      await chat.save();
    }

    res.json(chat);
  } catch (error) {
    console.error('Get chat messages error:', error);
    res.status(500).json({ message: 'Error fetching chat messages' });
  }
};

// Create or get chat
export const createChat = async (req, res) => {
  try {
    const { providerId } = req.body;
    const userId = req.user._id;

    let chat = await Chat.findOne({
      user: userId,
      provider: providerId,
    }).populate('provider', 'businessName');

    if (!chat) {
      chat = new Chat({
        user: userId,
        provider: providerId,
      });
      await chat.save();
      chat = await Chat.findById(chat._id).populate('provider', 'businessName');
    }

    res.json(chat);
  } catch (error) {
    console.error('Create chat error:', error);
    res.status(500).json({ message: 'Error creating chat' });
  }
};

// Send message
export const sendMessage = async (req, res) => {
  try {
    const { chatId, content } = req.body;
    const isProvider = req.user.role === 'provider';

    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    // Verify user has access to this chat
    if (
      (isProvider && chat.provider.toString() !== req.user._id.toString()) ||
      (!isProvider && chat.user.toString() !== req.user._id.toString())
    ) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const message = {
      sender: req.user._id,
      senderType: isProvider ? 'ServiceProvider' : 'User',
      content,
    };

    chat.messages.push(message);
    chat.lastMessage = new Date();

    if (isProvider) {
      chat.userUnread += 1;
    } else {
      chat.providerUnread += 1;
    }

    await chat.save();

    // Create notification for the recipient
    const recipientId = isProvider ? chat.user : chat.provider;
    await createNotification({
      user: recipientId,
      type: 'new_message',
      title: 'New Message',
      message: `You have a new message from ${
        isProvider ? req.user.businessName : req.user.name
      }`,
      data: { chatId },
    });

    // Emit socket event
    req.io.to(recipientId.toString()).emit('new_message', {
      chatId,
      message: {
        ...message,
        createdAt: new Date(),
      },
    });

    res.json(message);
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ message: 'Error sending message' });
  }
}; 