const mongoose = require('mongoose');

const lostItemSchema = new mongoose.Schema(
  {
    itemName: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    location: { type: String, required: true, trim: true },
    date: { type: Date, required: true },
    image: { type: String } // filename only
  },
  {
    timestamps: true,
    toJSON: { virtuals: true, getters: true },
    toObject: { virtuals: true, getters: true }
  }
);

// Expose a ready-to-use URL for the frontend
lostItemSchema.virtual('imageUrl').get(function () {
  return this.image ? `/uploads/${this.image}` : null;
});

// Helpful indexes
lostItemSchema.index({ createdAt: -1 });
lostItemSchema.index({ location: 1 });

module.exports = mongoose.model('LostItem', lostItemSchema);
