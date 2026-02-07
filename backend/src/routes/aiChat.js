const express = require('express');
const { verifyToken } = require('../middleware/auth');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

// Simple AI responses - can be replaced with actual AI service
const getAIResponse = (message) => {
  const lowerMessage = message.toLowerCase();

  // Simple keyword-based responses
  if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
    return 'Hello! How can I help you today?';
  }
  if (lowerMessage.includes('how are you')) {
    return "I'm doing great! Thanks for asking. How can I assist you?";
  }
  if (lowerMessage.includes('what is')) {
    return 'That\'s a great question! I\'m here to help explain things. Can you be more specific?';
  }
  if (lowerMessage.includes('help')) {
    return 'I can help you with questions about the platform, communities, posts, and more. What would you like to know?';
  }
  if (lowerMessage.includes('communities')) {
    return 'Communities are groups of people with shared interests. You can join communities, participate in discussions, and connect with like-minded people!';
  }
  if (lowerMessage.includes('post')) {
    return 'Posts are how you share content with the community. You can create posts, comment on others\' posts, and engage in discussions!';
  }
  if (lowerMessage.includes('profile')) {
    return 'Your profile is your identity on the platform. You can customize your avatar, bio, and interests to help others get to know you better!';
  }
  if (lowerMessage.includes('thanks') || lowerMessage.includes('thank you')) {
    return 'You\'re welcome! Feel free to ask me anything else!';
  }

  // Default response
  return 'That\'s interesting! I\'m here to help. Feel free to ask me about communities, posts, profiles, or anything else about the platform!';
};

// POST /api/ai/chat - Send message to AI
router.post('/chat', verifyToken, asyncHandler(async (req, res) => {
  const { message } = req.body;

  if (!message || message.trim().length === 0) {
    return res.status(400).json({ error: 'Message is required' });
  }

  const aiResponse = getAIResponse(message.trim());

  res.json({
    id: uuidv4(),
    message: aiResponse,
    content: aiResponse,
    timestamp: new Date().toISOString(),
  });
}));

module.exports = router;
