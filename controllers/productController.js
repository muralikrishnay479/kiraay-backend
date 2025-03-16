const asyncHandler = require('express-async-handler');
const productsModel = require('../models/productsModel');
const cloudinary = require('../config/cloudinary');

const getProducts = asyncHandler(async (req, res) => {
  const { categoryId, near } = req.query;
  let query = {};
  if (categoryId) query.categoryId = categoryId;
  if (near) {
    const [longitude, latitude] = near.split(',').map(Number);
    query.location = {
      $near: { $geometry: { type: 'Point', coordinates: [longitude, latitude] }, $maxDistance: 10000 }
    };
  }

  const products = await productsModel.find(query)
    .populate('ownerId', 'username')
    .populate('categoryId', 'name');
  res.json(products);
});

const createProduct = asyncHandler(async (req, res) => {
  const { title, description, categoryId, pricePerDay, latitude, longitude } = req.body;
  const file = req.files?.image; // Assumes multer middleware
  if (!title || !description || !categoryId || !pricePerDay || !latitude || !longitude || !file) {
    res.status(400);
    throw new Error('All product fields and image are mandatory');
  }

  // Upload to Cloudinary
  const result = await new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: 'products', public_id: `${Date.now()}-${file.name}` },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    stream.end(file.buffer);
  });

  const product = await productsModel.create({
    ownerId: req.user.id,
    title,
    description,
    categoryId,
    pricePerDay,
    location: { type: 'Point', coordinates: [longitude, latitude] },
    imageUrl: result.secure_url
  });

  res.status(201).json(product);
});

const updateProduct = asyncHandler(async (req, res) => {
  const { title, description, categoryId, pricePerDay, latitude, longitude } = req.body;
  const file = req.files?.image; // Optional new image
  const product = await productsModel.findById(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }
  if (product.ownerId.toString() !== req.user.id) {
    res.status(403);
    throw new Error('Not authorized to update this product');
  }

  let imageUrl = product.imageUrl;
  if (file) {
    // Upload new image to Cloudinary
    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: 'products', public_id: `${Date.now()}-${file.name}` },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        }
      );
      stream.end(file.buffer);
    });
    imageUrl = result.secure_url;

    // Delete old image from Cloudinary
    const oldPublicId = product.imageUrl.split('/').slice(-2).join('/').split('.')[0];
    await cloudinary.uploader.destroy(oldPublicId);
  }

  const updatedProduct = await productsModel.findByIdAndUpdate(
    req.params.id,
    { title, description, categoryId, pricePerDay, location: { type: 'Point', coordinates: [longitude, latitude] }, imageUrl, updatedAt: Date.now() },
    { new: true, runValidators: true }
  );

  res.json(updatedProduct);
});

const deleteProduct = asyncHandler(async (req, res) => {
  const product = await productsModel.findById(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }
  if (product.ownerId.toString() !== req.user.id) {
    res.status(403);
    throw new Error('Not authorized to delete this product');
  }

  // Delete image from Cloudinary
  const publicId = product.imageUrl.split('/').slice(-2).join('/').split('.')[0];
  await cloudinary.uploader.destroy(publicId);

  await productsModel.deleteOne({ _id: req.params.id });
  res.json({ message: 'Product deleted' });
});

module.exports = { getProducts, createProduct, updateProduct, deleteProduct };