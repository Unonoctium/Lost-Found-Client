const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { auth } = require('../middleware/auth');

// Delete notification
router.delete('/notifications/:notificationId', auth, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $pull: { notifications: { _id: req.params.notificationId } } },
      { new: true }
    );
    res.json(user.notifications);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// Register user
router.post('/register', async (req, res) => {
  try {
    let { username, email, password, adminCode } = req.body;
    username = username.trim().toLowerCase();
    email = email.trim().toLowerCase();

    let user = await User.findOne({ $or: [
      { email },
      { username }
    ] });
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Check if this is the first user or if admin code matches
    const isFirstUser = (await User.countDocuments()) === 0;
    const isAdmin = adminCode === process.env.ADMIN_CODE || isFirstUser;

    user = new User({
      username,
      email,
      password,
      role: isAdmin ? 'admin' : 'user'
    });

    await user.save();

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '24h' });
    res.status(201).json({ token });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    let { email, password } = req.body;
    email = email.trim().toLowerCase();

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '24h' });
    res.json({ token });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// Get user profile
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// Get user notifications
router.get('/notifications', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select('notifications')
      .populate('notifications.itemId');
    res.json(user.notifications);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// Mark notification as read
router.put('/notifications/:notificationId', auth, async (req, res) => {
  try {
    const user = await User.findOneAndUpdate(
      { 
        _id: req.user._id,
        'notifications._id': req.params.notificationId
      },
      { 
        $set: { 'notifications.$.read': true }
      },
      { new: true }
    );
    res.json(user.notifications);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;
