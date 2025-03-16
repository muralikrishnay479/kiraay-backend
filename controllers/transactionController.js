const asyncHandler = require('express-async-handler');
const transactionsModel = require('../models/TransactionsModel');
const ordersModel = require('../models/ordersModel');
const notificationsModel = require('../models/notificationsModel');

const getTransactions = asyncHandler(async (req, res) => {
  const transactions = await transactionsModel.find({
    $or: [{ payerId: req.user.id }, { payeeId: req.user.id }]
  })
    .populate('orderId', 'productId startDate endDate')
    .populate('payerId', 'username')
    .populate('payeeId', 'username');
  res.json(transactions);
});

const createTransaction = asyncHandler(async (req, res) => {
  const { orderId, paymentMethod } = req.body;
  if (!orderId || !paymentMethod) {
    res.status(400);
    throw new Error('Order ID and payment method are mandatory');
  }

  const order = await ordersModel.findById(orderId);
  if (!order || order.renterId.toString() !== req.user.id) {
    res.status(403);
    throw new Error('Order not found or not authorized');
  }
  if (order.status !== 'accepted') {
    res.status(400);
    throw new Error('Order must be accepted before payment');
  }

  const transaction = await transactionsModel.create({
    orderId,
    payerId: req.user.id,
    payeeId: order.lenderId,
    amount: order.totalCost,
    paymentMethod,
    status: 'pending' // Simulated; real integration would update this
  });

  // Simulate payment completion
  transaction.status = 'completed';
  transaction.transactionId = `TXN-${Date.now()}`;
  await transaction.save();

  // Notify payee
  await notificationsModel.create({
    userId: order.lenderId,
    type: 'rental_update',
    title: 'Payment Received',
    message: `${req.user.username} paid $${order.totalCost} for order ${orderId}`,
    relatedId: orderId,
    relatedModel: 'Order'
  });

  res.status(201).json(transaction);
});

module.exports = { getTransactions, createTransaction };