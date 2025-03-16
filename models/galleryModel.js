const mongoose = require('mongoose');

const gallerySchema = new mongoose.Schema({
  productId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Product', 
    required: [true, 'Product ID is required'] 
  },
  imageUrl: { 
    type: String, 
    required: [true, 'Image URL is required'], 
    match: [/^https?:\/\/.+\.(jpg|jpeg|png|gif)$/, 'Please enter a valid image URL (jpg, png, gif)'] 
  },
  isPrimary: { 
    type: Boolean, 
    default: false 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  updatedAt: { 
    type: Date, 
    default: Date.now 
  }
});

gallerySchema.index({ productId: 1 });

module.exports = mongoose.model('Gallery', gallerySchema);