const asyncHandler = require('express-async-handler');
const profileModel = require('../models/profileModel');

const getProfile = asyncHandler(async (req, res) => {
  const profile = await profileModel.findOne({ userId: req.user.id });
  if (!profile) {
    res.status(404);
    throw new Error('Profile not found. Please create one.');
  }
  res.json(profile);
});

const updateProfile = asyncHandler(async (req, res) => {
  const { firstName, lastName, bio, profilePicture, phoneNumber } = req.body;
  let profile = await profileModel.findOne({ userId: req.user.id });
  const profileData = {
    firstName,
    lastName,
    bio,
    profilePicture,
    phoneNumber,
    updatedAt: Date.now()
  };

  if (profile) {
    profile = await profileModel.findOneAndUpdate(
      { userId: req.user.id },
      { $set: profileData },
      { new: true, runValidators: true }
    );
  } else {
    profile = new profileModel({
      userId: req.user.id,
      ...profileData
    });
    await profile.save();
  }
  res.json(profile);
});

const getPublicProfile = asyncHandler(async (req, res) => {
  const profile = await profileModel.findOne({ userId: req.params.id }).lean();
  if (!profile) {
    res.status(404);
    throw new Error('Profile not found');
  }
  const publicProfile = {
    firstName: profile.firstName,
    lastName: profile.lastName,
    bio: profile.bio,
    profilePicture: profile.profilePicture,
    isVerified: profile.isVerified,
    responseTime: profile.responseTime,
    responseRate: profile.responseRate,
    averageRating: profile.averageRating,
    reviewCount: profile.reviewCount
  };
  res.json(publicProfile);
});

module.exports = { getProfile, updateProfile, getPublicProfile };