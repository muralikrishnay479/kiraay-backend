const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  renterId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: [true, 'Renter ID is required'] 
  },
  lenderId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: [true, 'Lender ID is required'] 
  },
  productId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Product', 
    required: [true, 'Product ID is required'] 
  },
  startDate: { 
    type: Date, 
    required: [true, 'Start date is required'] 
  },
  endDate: { 
    type: Date, 
    required: [true, 'End date is required'] 
  },
  totalCost: { 
    type: Number, 
    required: [true, 'Total cost is required'], 
    min: [0.01, 'Total cost must be at least $0.01'] 
  },
  status: { 
    type: String, 
    enum: ['pending', 'requested', 'accepted', 'active', 'completed', 'cancelled'], 
    default: 'pending' 
  },
  pickupAddressId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Address', 
    required: [true, 'Pickup address is required'] 
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

orderSchema.index({ renterId: 1, status: 1 });
orderSchema.index({ lenderId: 1, status: 1 });

module.exports = mongoose.model('Order', orderSchema);