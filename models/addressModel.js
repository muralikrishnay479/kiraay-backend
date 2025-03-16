const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: [true, 'User ID is required'] 
  },
  street: { 
    type: String, 
    required: [true, 'Street is required'] 
  },
  city: { 
    type: String, 
    required: [true, 'City is required'] 
  },
  state: { 
    type: String, 
    required: [true, 'State is required'] 
  },
  postalCode: { 
    type: String, 
    required: [true, 'Postal code is required'], 
    match: [/^\d{5}(-\d{4})?$/, 'Please enter a valid postal code (e.g., 12345 or 12345-6789)'] 
  },
  country: { 
    type: String, 
    required: [true, 'Country is required'] 
  },
  location: {
    type: { 
      type: String, 
      enum: ['Point'], 
      default: 'Point' 
    },
    coordinates: { 
      type: [Number], // [longitude, latitude]
      required: [true, 'Coordinates are required'] 
    }
  },
  isDefault: { 
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

addressSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Address', addressSchema);