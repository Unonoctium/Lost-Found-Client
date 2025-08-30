const express = require('express');
const router = express.Router();
const Chat = require('../models/Chat');
const { auth } = require('../middleware/auth');

// Create or get chat
router.post('/', auth, async (req, res) => {
  try {
    const { itemId, participantId } = req.body;
    
    if (!itemId || !participantId) {
      return res.status(400).json({ message: 'Item ID and participant ID are required' });
    }

    // Validate that users aren't creating a chat with themselves
    if (participantId === req.user._id.toString()) {
      return res.status(400).json({ message: 'Cannot create chat with yourself' });
    }

    console.log('Creating chat:', { itemId, participantId, userId: req.user._id });
    
    let chat = await Chat.findOne({
      itemId,
      participants: { $all: [req.user._id, participantId] }
    });

    if (!chat) {
      chat = new Chat({
        itemId,
        participants: [req.user._id, participantId],
        messages: []
      });
      await chat.save();
    }

    await chat.populate([
      { path: 'participants', select: 'username' },
      { path: 'messages.sender', select: 'username' },
      { path: 'itemId', select: 'title description' }
    ]);
    
    console.log('Chat created/found:', chat);
    res.json(chat);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// Get user's chats
router.get('/', auth, async (req, res) => {
  try {
    const chats = await Chat.find({ participants: req.user._id })
      .populate('participants', 'username')
      .populate('itemId')
      .populate('messages.sender', 'username')
      .sort({ 'messages.timestamp': -1 });
    
    res.json(chats);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// Get single chat
router.get('/:id', auth, async (req, res) => {
  try {
    const chat = await Chat.findOne({
      _id: req.params.id,
      participants: req.user._id
    })
      .populate('participants', 'username')
      .populate('itemId')
      .populate('messages.sender', 'username');

    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    res.json(chat);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// Send message
router.post('/:id/messages', auth, async (req, res) => {
  try {
    const { content } = req.body;
    const chat = await Chat.findOne({
      _id: req.params.id,
      participants: req.user._id
    });

    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    chat.messages.push({
      sender: req.user._id,
      content
    });

    await chat.save();
    await chat.populate('messages.sender', 'username');

    res.json(chat.messages[chat.messages.length - 1]);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;
