const mongoose = require('mongoose');

const popularItemSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true 
  },
  description: { type: String },
  price: { 
    type: Number, 
    required: true 
  },
  originalPrice: { type: Number },
  image: { 
    type: String, 
    required: true 
  },
  category: { type: String },
  rating: { 
    type: Number, 
    default: 0, 
    min: 0, 
    max: 5 
  },
  ratingCount: { 
    type: Number, 
    default: 0 
  },
  preparationTime: { type: Number }, // in minutes
  isAvailable: { 
    type: Boolean, 
    default: true 
  },
  tags: [String],
  weeklyOrders: { 
    type: Number, 
    default: 0 
  }
}, { timestamps: true });

module.exports = mongoose.model('PopularItem', popularItemSchema);