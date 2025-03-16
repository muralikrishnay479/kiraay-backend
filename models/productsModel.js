const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: [true, 'Title is required'], maxlength: 100 },
  description: { type: String, required: true, maxlength: 1000 },
  categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  pricePerDay: { type: Number, required: true, min: 0.01 },
  availabilityStatus: { 
    type: String, 
    enum: ['available', 'pending', 'booked'], 
    default: 'available' 
  },
  location: { 
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], required: true } // [longitude, latitude]
  },
  imageUrl: { // New field for primary image
    type: String,
    required: [true, 'Primary image URL is required'],
    match: [/^https?:\/\/.+\.(jpg|jpeg|png|gif)$/, 'Please enter a valid image URL (jpg, png, gif)']
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

productSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Product', productSchema);