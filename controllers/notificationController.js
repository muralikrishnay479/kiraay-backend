const asyncHandler = require('express-async-handler');
const notificationsModel = require('../models/notificationsModel');

const getNotifications = asyncHandler(async (req, res) => {
  const { isRead } = req.query;
  const query = { userId: req.user.id };
  if (isRead !== undefined) query.isRead = isRead === 'true';

  const notifications = await notificationsModel.find(query)
    .sort({ createdAt: -1 })
    .limit(50);

  await notificationsModel.updateMany(
    { userId: req.user.id, isRead: false },
    { $set: { isRead: true, updatedAt: Date.now() } }
  );

  res.json(notifications);
});

const createNotification = asyncHandler(async (req, res) => {
  const { userId, type, title, message, relatedId, relatedModel } = req.body;
  if (!userId || !type || !title || !message || !relatedId || !relatedModel) {
    res.status(400);
    throw new Error('All notification fields are mandatory');
  }

  const notification = await notificationsModel.create({
    userId,
    type,
    title,
    message,
    relatedId,
    relatedModel
  });

  res.status(201).json(notification);
});

const deleteNotification = asyncHandler(async (req, res) => {
  const notification = await notificationsModel.findById(req.params.id);
  if (!notification) {
    res.status(404);
    throw new Error('Notification not found');
  }
  if (notification.userId.toString() !== req.user.id) {
    res.status(403);
    throw new Error('Not authorized to delete this notification');
  }

  await notificationsModel.deleteOne({ _id: req.params.id });
  res.json({ message: 'Notification deleted' });
});

module.exports = { getNotifications, createNotification, deleteNotification };