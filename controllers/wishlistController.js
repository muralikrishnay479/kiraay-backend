const asyncHandler = require('express-async-handler');
const wishlistModel = require('../models/wishlistmodel');
const productsModel = require('../models/productsModel');

const getWishlist = asyncHandler(async (req, res) => {
  const wishlist = await wishlistModel.find({ userId: req.user.id })
    .populate('productId', 'title description pricePerDay');
  res.json(wishlist);
});

const addToWishlist = asyncHandler(async (req, res) => {
  const { productId } = req.body;
  if (!productId) {
    res.status(400);
    throw new Error('Product ID is mandatory');
  }

  const product = await productsModel.findById(productId);
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  const existing = await wishlistModel.findOne({ userId: req.user.id, productId });
  if (existing) {
    return res.status(200).json(existing);
  }

  const wishlistItem = await wishlistModel.create({
    userId: req.user.id,
    productId
  });

  res.status(201).json(wishlistItem);
});

const removeFromWishlist = asyncHandler(async (req, res) => {
  const wishlistItem = await wishlistModel.findById(req.params.id);
  if (!wishlistItem) {
    res.status(404);
    throw new Error('Wishlist item not found');
  }
  if (wishlistItem.userId.toString() !== req.user.id) {
    res.status(403);
    throw new Error('Not authorized to remove this item');
  }

  await wishlistModel.deleteOne({ _id: req.params.id });
  res.json({ message: 'Item removed from wishlist' });
});

module.exports = { getWishlist, addToWishlist, removeFromWishlist };