const mongoose = require('mongoose');

const lostItemSchema = new mongoose.Schema({
  itemName: { type: String, required: true },
  description: { type: String, required: true },
  location: { type: String, required: true },
  date: { type: Date, required: true },
  image: { type: String } // stores filename
}, { timestamps: true });

module.exports = mongoose.model('LostItem', lostItemSchema);
