const LostItem = require('../models/LostItem');

const createLostItem = async (req, res) => {
  try {
    const { itemName, description, location, date } = req.body;
    const image = req.file ? req.file.filename : null;

    const newItem = await LostItem.create({ itemName, description, location, date, image });
    res.status(201).json(newItem);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

const getAllLostItems = async (req, res) => {
  try {
    const items = await LostItem.find().sort({ createdAt: -1 });
    res.json(items);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { createLostItem, getAllLostItems };
