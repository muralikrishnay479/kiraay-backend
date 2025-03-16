const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
  participants: { 
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], 
    required: [true, 'Participants are required'], 
    validate: [v => v.length === 2, 'Chat must have exactly 2 participants'] 
  },
  lastMessage: { 
    type: String, 
    default: null 
  },
  lastMessageAt: { 
    type: Date, 
    default: null 
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

chatSchema.index({ participants: 1 });

module.exports = mongoose.model('Chat', chatSchema);