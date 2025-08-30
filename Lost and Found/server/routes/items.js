const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const Item = require('../models/Item');
const User = require('../models/User');
const { auth, admin } = require('../middleware/auth');

// Delete item (admin only)
router.delete('/:id', [auth, admin], async (req, res) => {
  try {
    const item = await Item.findByIdAndDelete(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }
    // Delete all chats related to this item
    const Chat = require('../models/Chat');
    await Chat.deleteMany({ itemId: req.params.id });
    res.json({ message: 'Item and related chats deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// Configure multer for image upload
const storage = multer.diskStorage({
  destination: './uploads/',
  filename: function(req, file, cb) {
    cb(null, 'item-' + Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5000000 }, // 5MB limit
  fileFilter: function(req, file, cb) {
    const filetypes = /jpeg|jpg|png/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb('Error: Images only!');
    }
  }
}).single('image');

// Create new item
router.post('/', auth, (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ message: err });
    }
    if (!req.file) {
      return res.status(400).json({ message: 'Please upload an image' });
    }

    try {
      const newItem = new Item({
        ...req.body,
        image: req.file.filename,
        owner: req.user._id
      });

      await newItem.save();
      res.status(201).json(newItem);
    } catch (error) {
      res.status(500).json({ message: 'Server Error' });
    }
  });
});

// Get all approved items
router.get('/', async (req, res) => {
  try {
    const { category, type, status, owner } = req.query;
    let filter = {};
    
    // If owner is specified, get all their items regardless of status
    if (owner) {
      filter.owner = owner;
    } else {
      filter.status = 'approved';
    }
    
    if (category) filter.category = category;
    if (type) filter.type = type;
    if (status) filter.status = status;

    const items = await Item.find(filter)
      .populate('owner', 'username')
      .sort({ createdAt: -1 });
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// Get pending items (admin only)
router.get('/pending', [auth, admin], async (req, res) => {
  try {
    const items = await Item.find({ status: 'pending' })
      .populate('owner', 'username')
      .sort({ createdAt: -1 });
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// Get single item
router.get('/:id', async (req, res) => {
  try {
    const item = await Item.findById(req.params.id)
      .populate('owner', 'username')
      .populate('reports.user', 'username');
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }
    res.json(item);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// Update item status (admin only)
router.put('/:id/status', [auth, admin], async (req, res) => {
  try {
    const { status } = req.body;
    const item = await Item.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    // Send notification to item owner
    const notification = {
      message: `Your item "${item.title}" has been ${status}`,
      itemId: item._id,
      createdAt: new Date(),
      read: false
    };
    const updatedUser = await User.findByIdAndUpdate(item.owner, {
      $push: { notifications: notification }
    }, { new: true });
    console.log('Notification pushed to user:', updatedUser ? updatedUser.email : 'User not found');

    res.json({ item, notifications: updatedUser ? updatedUser.notifications : [] });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// Mark item as returned
router.put('/:id/return', auth, async (req, res) => {
  try {
    const item = await Item.findOne({ _id: req.params.id, owner: req.user._id });
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    item.status = 'returned';
    await item.save();
    res.json(item);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// Report item
router.post('/:id/report', auth, async (req, res) => {
  try {
    const { reason } = req.body;
    const item = await Item.findById(req.params.id);
    
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    const alreadyReported = item.reports.some(report => 
      report.user.toString() === req.user._id.toString()
    );

    if (alreadyReported) {
      return res.status(400).json({ message: 'Item already reported' });
    }

    const report = {
      user: req.user._id,
      reason,
      date: new Date()
    };
    item.reports.push(report);
    const savedItem = await item.save();
    console.log('Report added to item:', savedItem._id, 'by user:', req.user._id);
    res.json(savedItem);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;
