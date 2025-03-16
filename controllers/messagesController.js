const asyncHandler = require('express-async-handler');
const messagesModel = require('../models/messagesModel');
const chatsModel = require('../models/chatsModel');
const notificationsModel = require('../models/notificationsModel');

const sendMessage = asyncHandler(async (req, res) => {
  const { chatId, content } = req.body;
  if (!chatId || !content) {
    res.status(400);
    throw new Error('Chat ID and content are mandatory');
  }

  const chat = await chatsModel.findById(chatId);
  if (!chat) {
    res.status(404);
    throw new Error('Chat not found');
  }
  if (!chat.participants.includes(req.user.id)) {
    res.status(403);
    throw new Error('Not authorized to send message in this chat');
  }

  const message = await messagesModel.create({
    chatId,
    senderId: req.user.id,
    content
  });

  // Update chat's last message
  chat.lastMessage = content;
  chat.lastMessageAt = Date.now();
  await chat.save();

  // Notify the other participant
  const recipientId = chat.participants.find(id => id.toString() !== req.user.id);
  await notificationsModel.create({
    userId: recipientId,
    type: 'new_chat',
    title: 'New Message',
    message: `${req.user.username} sent you a message`,
    relatedId: chatId,
    relatedModel: 'Chat'
  });

  res.status(201).json(message);
});

const getMessages = asyncHandler(async (req, res) => {
  const { chatId } = req.query;
  if (!chatId) {
    res.status(400);
    throw new Error('Chat ID is required');
  }

  const chat = await chatsModel.findById(chatId);
  if (!chat || !chat.participants.includes(req.user.id)) {
    res.status(403);
    throw new Error('Not authorized to view this chat');
  }

  const messages = await messagesModel.find({ chatId }).sort({ createdAt: 1 });
  res.json(messages);
});

module.exports = { sendMessage, getMessages };