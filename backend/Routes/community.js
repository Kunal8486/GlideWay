// server/routes/community.js
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose'); // Add this import
const Message = require('../Models/Community');

// Get all messages with filtering, sorting and search
router.get('/', async (req, res) => {
  try {
    const { category, sort, search } = req.query;
    
    // Build query based on filters
    let query = {};
    
    // Category filter
    if (category && category !== 'all') {
      query.category = category;
    }
    
    // Search filter
    if (search) {
      query.$or = [
        { content: { $regex: search, $options: 'i' } },
        { username: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Sort options
    let sortOption = { timestamp: -1 }; // Default to newest first
    
    switch (sort) {
      case 'oldest':
        sortOption = { timestamp: 1 };
        break;
      case 'popular':
        sortOption = { likes: -1 };
        break;
      case 'active':
        sortOption = { 'comments.length': -1 };
        break;
      default:
        sortOption = { timestamp: -1 }; // Default to newest
    }
    
    const messages = await Message.find(query).sort(sortOption);
    res.json(messages);
  } catch (err) {
    console.error('Error fetching messages:', err);
    res.status(500).json({ error: 'Failed to fetch messages', details: err.message });
  }
});

// Create a new message
router.post('/', async (req, res) => {
  try {
    const { username, content, category } = req.body;
    
    if (!content.trim()) {
      return res.status(400).json({ error: 'Message content is required' });
    }
    
    // Create new message, using Anonymous if username is empty
    const message = new Message({
      username: username?.trim() || 'Anonymous',
      content: content.trim(),
      category: category || 'general',
      timestamp: new Date(),
      likes: 0,
      comments: []
    });
    
    await message.save();
    res.status(201).json(message);
  } catch (err) {
    console.error('Error creating message:', err);
    res.status(500).json({ error: 'Failed to create message', details: err.message });
  }
});

// Update a message
router.put('/:id', async (req, res) => {
  try {
    const { content } = req.body;
    
    if (!content || !content.trim()) {
      return res.status(400).json({ error: 'Message content is required' });
    }
    
    const message = await Message.findById(req.params.id);
    
    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }
    
    message.content = content.trim();
    message.edited = true;
    message.editedAt = new Date();
    
    await message.save();
    res.json(message);
  } catch (err) {
    console.error('Error updating message:', err);
    res.status(500).json({ error: 'Failed to update message', details: err.message });
  }
});

// Delete a message
router.delete('/:id', async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);
    
    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }
    
    await Message.deleteOne({ _id: req.params.id });
    res.json({ message: 'Message deleted successfully' });
  } catch (err) {
    console.error('Error deleting message:', err);
    res.status(500).json({ error: 'Failed to delete message', details: err.message });
  }
});

// Like a message
router.put('/:id/like', async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);
    
    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }
    
    message.likes = (message.likes || 0) + 1;
    await message.save();
    
    res.json(message);
  } catch (err) {
    console.error('Error liking message:', err);
    res.status(500).json({ error: 'Failed to like message', details: err.message });
  }
});

// Add a comment to a message
router.post('/:id/comments', async (req, res) => {
  try {
    const { username, content } = req.body;
    
    if (!content || !content.trim()) {
      return res.status(400).json({ error: 'Comment content is required' });
    }
    
    const message = await Message.findById(req.params.id);
    
    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }
    
    const comment = {
      _id: new mongoose.Types.ObjectId(),
      username: username?.trim() || 'Anonymous',
      content: content.trim(),
      timestamp: new Date()
    };
    
    if (!message.comments) {
      message.comments = [];
    }
    
    message.comments.push(comment);
    await message.save();
    
    res.json(message);
  } catch (err) {
    console.error('Error adding comment:', err);
    res.status(500).json({ error: 'Failed to add comment', details: err.message });
  }
});

module.exports = router;