const asyncHandler = require('express-async-handler');
const addressModel = require('../models/addressModel');

const getAddresses = asyncHandler(async (req, res) => {
  const addresses = await addressModel.find({ userId: req.user.id });
  if (!addresses.length) {
    res.status(404);
    throw new Error('No addresses found');
  }
  res.json(addresses);
});

const createAddress = asyncHandler(async (req, res) => {
  const { street, city, state, postalCode, country, latitude, longitude, isDefault } = req.body;
  if (!street || !city || !state || !postalCode || !country || !latitude || !longitude) {
    res.status(400);
    throw new Error('All address fields are mandatory');
  }

  // If setting as default, unset other defaults
  if (isDefault) {
    await addressModel.updateMany(
      { userId: req.user.id, isDefault: true },
      { $set: { isDefault: false } }
    );
  }

  const address = await addressModel.create({
    userId: req.user.id,
    street,
    city,
    state,
    postalCode,
    country,
    location: { type: 'Point', coordinates: [longitude, latitude] },
    isDefault: isDefault || false
  });

  res.status(201).json(address);
});

const updateAddress = asyncHandler(async (req, res) => {
  const { street, city, state, postalCode, country, latitude, longitude, isDefault } = req.body;
  const address = await addressModel.findById(req.params.id);
  if (!address) {
    res.status(404);
    throw new Error('Address not found');
  }
  if (address.userId.toString() !== req.user.id) {
    res.status(403);
    throw new Error('Not authorized to update this address');
  }

  // If setting as default, unset other defaults
  if (isDefault) {
    await addressModel.updateMany(
      { userId: req.user.id, isDefault: true, _id: { $ne: req.params.id } },
      { $set: { isDefault: false } }
    );
  }

  const updatedAddress = await addressModel.findByIdAndUpdate(
    req.params.id,
    {
      street,
      city,
      state,
      postalCode,
      country,
      location: { type: 'Point', coordinates: [longitude, latitude] },
      isDefault: isDefault || false,
      updatedAt: Date.now()
    },
    { new: true, runValidators: true }
  );

  res.json(updatedAddress);
});

const deleteAddress = asyncHandler(async (req, res) => {
  const address = await addressModel.findById(req.params.id);
  if (!address) {
    res.status(404);
    throw new Error('Address not found');
  }
  if (address.userId.toString() !== req.user.id) {
    res.status(403);
    throw new Error('Not authorized to delete this address');
  }

  await addressModel.deleteOne({ _id: req.params.id });
  res.json({ message: 'Address deleted' });
});

module.exports = { getAddresses, createAddress, updateAddress, deleteAddress };