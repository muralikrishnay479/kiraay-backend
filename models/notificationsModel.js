const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: [true, 'User ID is required'] 
  },
  type: { 
    type: String, 
    required: [true, 'Notification type is required'], 
    enum: ['new_chat', 'rental_request', 'rental_update', 'system'] 
  },
  title: { 
    type: String, 
    required: [true, 'Title is required'], 
    maxlength: [100, 'Title cannot exceed 100 characters'] 
  },
  message: { 
    type: String, 
    required: [true, 'Message is required'], 
    maxlength: [500, 'Message cannot exceed 500 characters'] 
  },
  relatedId: { 
    type: mongoose.Schema.Types.ObjectId, 
    required: [true, 'Related ID is required'] 
  },
  relatedModel: { 
    type: String, 
    required: [true, 'Related model is required'], 
    enum: ['Chat', 'Order', 'Product', 'User'] 
  },
  isRead: { 
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

notificationSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);