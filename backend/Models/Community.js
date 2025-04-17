// server/Models/Community.js
const mongoose = require('mongoose');

const CommentSchema = new mongoose.Schema({
  username: {
    type: String,
    default: 'Anonymous'
  },
  content: {
    type: String,
    required: true,
    trim: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

const MessageSchema = new mongoose.Schema({
  username: {
    type: String,
    default: 'Anonymous'
  },
  content: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    enum: ['general', 'question', 'suggestion', 'feedback'],
    default: 'general'
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  likes: {
    type: Number,
    default: 0
  },
  edited: {
    type: Boolean,
    default: false
  },
  editedAt: {
    type: Date
  },
  comments: [CommentSchema]
});

module.exports = mongoose.model('Message', MessageSchema);
