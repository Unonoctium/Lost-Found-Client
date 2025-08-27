const LostItem = require('../models/LostItem');

const createLostItem = async (req, res, next) => {
  try {
    const { itemName, description, location, date } = req.body;
    const image = req.file ? `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}` : null;
    const newItem = await LostItem.create({ itemName, description, location, date, image });
    res.status(201).json(newItem); // virtuals included via toJSON
  } catch (err) {
    next(err);
  }
};

const getAllLostItems = async (req, res, next) => {
  try {
    let {
      page = 1,
      limit = 12,
      q,
      location,
      from,
      to,
      sort = '-createdAt'
    } = req.query;

    const filter = {};
    if (q) {
      filter.$or = [
        { itemName: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } }
      ];
    }
    if (location) filter.location = { $regex: location, $options: 'i' };
    if (from || to) {
      filter.date = {};
      if (from) filter.date.$gte = new Date(from);
      if (to) filter.date.$lte = new Date(to);
    }

    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      LostItem.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(Number(limit))
        .lean({ virtuals: true }),
      LostItem.countDocuments(filter)
    ]);

    res.json({
      items,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / limit),
        limit: Number(limit)
      }
    });
  } catch (err) {
    next(err);
  }
};

const getLostItemById = async (req, res, next) => {
  try {
    const item = await LostItem.findById(req.params.id).lean({ virtuals: true });
    if (!item) return res.status(404).json({ message: 'Item not found' });
    res.json(item);
  } catch (err) {
    next(err);
  }
};

module.exports = { createLostItem, getAllLostItems, getLostItemById };
