const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    index: true
  },
  description: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
    enum: ['Electronics', 'Clothing', 'Accessories', 'Documents', 'Other'],
    index: true
  },
  type: {
    type: String,
    required: true,
    enum: ['lost', 'found'],
    index: true
  },
  location: {
    type: String,
    required: true,
    index: true
  },
  date: {
    type: Date,
    required: true,
    index: true
  },
  image: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'returned'],
    default: 'pending',
    index: true
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  reports: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true
    },
    reason: String,
    date: {
      type: Date,
      default: Date.now,
    },
  }],
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  },
});

// Add text index for search functionality
itemSchema.index({ title: 'text', description: 'text', location: 'text' });

// Add compound indexes for common queries
itemSchema.index({ status: 1, type: 1, category: 1 });
itemSchema.index({ owner: 1, createdAt: -1 });

module.exports = mongoose.model('Item', itemSchema);
