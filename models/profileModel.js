const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: [true, 'User ID is required'], 
    unique: true 
  },
  firstName: { 
    type: String, 
    required: [true, 'First name is required'] 
  },
  lastName: { 
    type: String, 
    required: [true, 'Last name is required'] 
  },
  bio: { 
    type: String, 
    maxlength: [500, 'Bio cannot exceed 500 characters'] 
  },
  profilePicture: { 
    type: String, 
    default: 'https://example.com/default-avatar.png' 
  },
  isVerified: { 
    type: Boolean, 
    default: false 
  },
  verificationStatus: { 
    type: String, 
    default: 'pending', 
    enum: ['pending', 'approved', 'rejected'] 
  },
  phoneNumber: { 
    type: String, 
    match: [/^\+?[1-9]\d{1,14}$/, 'Please enter a valid phone number'] 
  },
  responseTime: { 
    type: Number, 
    default: null 
  },
  responseRate: { 
    type: Number, 
    default: null, 
    min: 0, 
    max: 100 
  },
  averageRating: { 
    type: Number, 
    default: null, 
    min: 1, 
    max: 5 
  },
  reviewCount: { 
    type: Number, 
    default: 0 
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

module.exports = mongoose.model('Profile', profileSchema);