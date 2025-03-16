const asyncHandler = require('express-async-handler');
const ordersModel = require('../models/ordersModel');
const productsModel = require('../models/productsModel');
const notificationsModel = require('../models/notificationsModel');

const getOrders = asyncHandler(async (req, res) => {
  const { status } = req.query;
  const query = { $or: [{ renterId: req.user.id }, { lenderId: req.user.id }] };
  if (status) query.status = status;

  const orders = await ordersModel.find(query)
    .populate('renterId', 'username phone')
    .populate('lenderId', 'username phone')
    .populate('productId', 'title')
    .populate('pickupAddressId', 'street city state postalCode country')
    .sort({ createdAt: -1 });

  res.json(orders);
});

const createOrder = asyncHandler(async (req, res) => {
  const { productId, startDate, endDate, pickupAddressId } = req.body;
  if (!productId || !startDate || !endDate || !pickupAddressId) {
    res.status(400);
    throw new Error('All order fields are mandatory');
  }

  const product = await productsModel.findById(productId);
  if (!product || product.ownerId.toString() === req.user.id) {
    res.status(400);
    throw new Error('Product not found or cannot rent your own product');
  }

  const days = Math.ceil((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24));
  if (days <= 0) {
    res.status(400);
    throw new Error('End date must be after start date');
  }

  const order = await ordersModel.create({
    renterId: req.user.id,
    lenderId: product.ownerId,
    productId,
    startDate,
    endDate,
    totalCost: product.pricePerDay * days,
    status: 'requested',
    pickupAddressId
  });

  product.availabilityStatus = 'pending';
  await product.save();

  await notificationsModel.create({
    userId: product.ownerId,
    type: 'rental_request',
    title: 'New Rental Request',
    message: `${req.user.username} wants to rent your ${product.title}`,
    relatedId: order._id,
    relatedModel: 'Order'
  });

  res.status(201).json(order);
});

const updateOrder = asyncHandler(async (req, res) => {
  const { status } = req.body;
  if (!status) {
    res.status(400);
    throw new Error('Status is required');
  }

  const order = await ordersModel.findById(req.params.id);
  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }
  if (order.renterId.toString() !== req.user.id && order.lenderId.toString() !== req.user.id) {
    res.status(403);
    throw new Error('Not authorized to update this order');
  }

  const validTransitions = {
    pending: ['requested', 'cancelled'],
    requested: ['accepted', 'cancelled'],
    accepted: ['active'],
    active: ['completed'],
    completed: [],
    cancelled: []
  };
  if (!validTransitions[order.status].includes(status)) {
    res.status(400);
    throw new Error(`Cannot transition from ${order.status} to ${status}`);
  }

  order.status = status;
  order.updatedAt = Date.now();
  const updatedOrder = await order.save();

  const product = await productsModel.findById(order.productId);
  if (status === 'accepted') product.availabilityStatus = 'booked';
  if (status === 'completed' || status === 'cancelled') product.availabilityStatus = 'available';
  await product.save();

  const recipientId = order.lenderId.toString() === req.user.id ? order.renterId : order.lenderId;
  await notificationsModel.create({
    userId: recipientId,
    type: 'rental_update',
    title: `Order ${status.charAt(0).toUpperCase() + status.slice(1)}`,
    message: `Your order for ${product.title} has been ${status}`,
    relatedId: order._id,
    relatedModel: 'Order'
  });

  res.json(updatedOrder);
});

const deleteOrder = asyncHandler(async (req, res) => {
  const order = await ordersModel.findById(req.params.id);
  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }
  if (order.renterId.toString() !== req.user.id) {
    res.status(403);
    throw new Error('Not authorized to delete this order');
  }
  if (order.status !== 'pending' && order.status !== 'requested') {
    res.status(400);
    throw new Error('Can only delete pending or requested orders');
  }

  await ordersModel.deleteOne({ _id: req.params.id });

  const product = await productsModel.findById(order.productId);
  product.availabilityStatus = 'available';
  await product.save();

  res.json({ message: 'Order deleted' });
});

module.exports = { getOrders, createOrder, updateOrder, deleteOrder };