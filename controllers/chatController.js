const asyncHandler = require('express-async-handler');
const chatsModel = require('../models/chatsModel');
const notificationsModel = require('../models/notificationsModel');

const getChats = asyncHandler(async (req, res) => {
  const chats = await chatsModel.find({ participants: req.user.id })
    .populate('participants', 'username phone')
    .sort({ lastMessageAt: -1 });
  res.json(chats);
});

const createChat = asyncHandler(async (req, res) => {
  const { participantId } = req.body;
  if (!participantId) {
    res.status(400);
    throw new Error('Participant ID is mandatory');
  }
  if (participantId === req.user.id) {
    res.status(400);
    throw new Error('Cannot create chat with yourself');
  }

  const existingChat = await chatsModel.findOne({
    participants: { $all: [req.user.id, participantId] }
  });
  if (existingChat) {
    return res.status(200).json(existingChat); // Return existing chat
  }

  const chat = await chatsModel.create({
    participants: [req.user.id, participantId]
  });

  // Notify the other participant
  await notificationsModel.create({
    userId: participantId,
    type: 'new_chat',
    title: 'New Chat Started',
    message: `${req.user.username} has started a chat with you`,
    relatedId: chat._id,
    relatedModel: 'Chat'
  });

  res.status(201).json(chat);
});

const deleteChat = asyncHandler(async (req, res) => {
  const chat = await chatsModel.findById(req.params.id);
  if (!chat) {
    res.status(404);
    throw new Error('Chat not found');
  }
  if (!chat.participants.includes(req.user.id)) {
    res.status(403);
    throw new Error('Not authorized to delete this chat');
  }

  await chatsModel.deleteOne({ _id: req.params.id });
  res.json({ message: 'Chat deleted' });
});

module.exports = { getChats, createChat, deleteChat };