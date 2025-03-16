const asyncHandler = require('express-async-handler');
const galleryModel = require('../models/galleryModel');
const productsModel = require('../models/productsModel');
const cloudinary = require('../config/cloudinary');

const getGalleryImages = asyncHandler(async (req, res) => {
  const { productId } = req.query;
  if (!productId) {
    res.status(400);
    throw new Error('Product ID is required');
  }
  const images = await galleryModel.find({ productId }).sort({ isPrimary: -1, createdAt: 1 });
  res.json(images);
});

const createGalleryImage = asyncHandler(async (req, res) => {
  const { productId, isPrimary } = req.body;
  const file = req.files?.image; // Assumes multer middleware
  if (!productId || !file) {
    res.status(400);
    throw new Error('Product ID and image are mandatory');
  }

  const product = await productsModel.findById(productId);
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }
  if (product.ownerId.toString() !== req.user.id) {
    res.status(403);
    throw new Error('Not authorized to add images to this product');
  }

  // Upload to Cloudinary
  const result = await new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: `products/${productId}`, public_id: `${Date.now()}-${file.name}` },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    stream.end(file.buffer);
  });

  // If setting as primary, unset other primaries
  if (isPrimary) {
    await galleryModel.updateMany(
      { productId, isPrimary: true },
      { $set: { isPrimary: false } }
    );
  }

  const image = await galleryModel.create({
    productId,
    imageUrl: result.secure_url, // Matches your schema's imageUrl
    isPrimary: isPrimary || false
  });

  res.status(201).json(image);
});

const updateGalleryImage = asyncHandler(async (req, res) => {
  const { isPrimary } = req.body;
  const file = req.files?.image; // Optional new image
  const image = await galleryModel.findById(req.params.id);
  if (!image) {
    res.status(404);
    throw new Error('Image not found');
  }

  const product = await productsModel.findById(image.productId);
  if (product.ownerId.toString() !== req.user.id) {
    res.status(403);
    throw new Error('Not authorized to update this image');
  }

  let imageUrl = image.imageUrl;
  if (file) {
    // Upload new image to Cloudinary
    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: `products/${productId}`, public_id: `${Date.now()}-${file.name}` },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        }
      );
      stream.end(file.buffer);
    });
    imageUrl = result.secure_url;

    // Delete old image from Cloudinary
    const oldPublicId = image.imageUrl.split('/').slice(-2).join('/').split('.')[0];
    await cloudinary.uploader.destroy(oldPublicId);
  }

  if (isPrimary) {
    await galleryModel.updateMany(
      { productId: image.productId, isPrimary: true, _id: { $ne: req.params.id } },
      { $set: { isPrimary: false } }
    );
  }

  const updatedImage = await galleryModel.findByIdAndUpdate(
    req.params.id,
    { imageUrl, isPrimary: isPrimary || false, updatedAt: Date.now() },
    { new: true, runValidators: true }
  );

  res.json(updatedImage);
});

const deleteGalleryImage = asyncHandler(async (req, res) => {
  const image = await galleryModel.findById(req.params.id);
  if (!image) {
    res.status(404);
    throw new Error('Image not found');
  }

  const product = await productsModel.findById(image.productId);
  if (product.ownerId.toString() !== req.user.id) {
    res.status(403);
    throw new Error('Not authorized to delete this image');
  }

  // Delete from Cloudinary
  const publicId = image.imageUrl.split('/').slice(-2).join('/').split('.')[0];
  await cloudinary.uploader.destroy(publicId);

  await galleryModel.deleteOne({ _id: req.params.id });
  res.json({ message: 'Image deleted' });
});

module.exports = { getGalleryImages, createGalleryImage, updateGalleryImage, deleteGalleryImage };