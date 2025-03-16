const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: [true, 'Category name is required'], 
    unique: true, 
    maxlength: [50, 'Category name cannot exceed 50 characters'] 
  },
  description: { 
    type: String, 
    maxlength: [500, 'Description cannot exceed 500 characters'] 
  },
  image: { 
    type: String, 
    default: 'https://example.com/default-category-image.jpg', 
    match: [/^https?:\/\/.+\.(jpg|jpeg|png|gif)$/, 'Please enter a valid image URL (jpg, png, gif)'] 
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

module.exports = mongoose.model('Category', categorySchema);