const express = require('express');
const { verifyToken } = require('../middleware/auth');
const botService = require('../services/botService');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

// GET /api/bots - Get all active bots
router.get('/', asyncHandler(async (req, res) => {
  const bots = await botService.getActiveBots();
  res.json({ bots });
}));

// GET /api/bots/:botId/conversations/:conversationId/messages - Get conversation messages
router.get(
  '/:botId/conversations/:conversationId/messages',
  verifyToken,
  asyncHandler(async (req, res) => {
    const { botId, conversationId } = req.params;
    const limit = Math.min(parseInt(req.query.limit) || 50, 100);
    const offset = parseInt(req.query.offset) || 0;

    const messages = await botService.getConversationMessages(conversationId, limit, offset);
    res.json({ messages });
  })
);

// POST /api/bots/:botId/chat - Send message to bot (authenticated)
router.post('/:botId/chat', verifyToken, asyncHandler(async (req, res) => {
  const { botId } = req.params;
  const { message } = req.body;
  const userId = req.user.userId;

  if (!message || message.trim().length === 0) {
    return res.status(400).json({ error: 'Message is required' });
  }

  // Get bot
  const bot = await botService.getBotById(botId);
  if (!bot) {
    return res.status(404).json({ error: 'Bot not found' });
  }

  // Get or create conversation
  const conversationId = await botService.getOrCreateConversation(botId, userId);

  // Add user message
  await botService.addMessage(conversationId, 'user', message.trim());

  // Get bot response
  const botResponse = await botService.getBotResponse(bot, message.trim());

  // Add bot message
  const botMessage = await botService.addMessage(conversationId, 'bot', botResponse);

  res.json({
    conversationId,
    message: botMessage,
  });
}));

// POST /api/bots/:botId/chat/public - Send message to bot (unauthenticated)
router.post('/:botId/chat/public', asyncHandler(async (req, res) => {
  const { botId } = req.params;
  const { message } = req.body;

  if (!message || message.trim().length === 0) {
    return res.status(400).json({ error: 'Message is required' });
  }

  // Get bot
  const bot = await botService.getBotById(botId);
  if (!bot) {
    return res.status(404).json({ error: 'Bot not found' });
  }

  // Get bot response (no conversation tracking for unauthenticated users)
  const botResponse = await botService.getBotResponse(bot, message.trim());

  res.json({
    message: {
      id: require('uuid').v4(),
      content: botResponse,
      created_at: new Date().toISOString()
    }
  });
}));

// GET /api/bots/:botId/conversations - Get user's conversations with a bot
router.get('/:botId/conversations', verifyToken, asyncHandler(async (req, res) => {
  const { botId } = req.params;
  const userId = req.user.userId;

  const conversationId = await botService.getOrCreateConversation(botId, userId);
  const messages = await botService.getConversationMessages(conversationId);

  res.json({
    conversationId,
    messages,
  });
}));

module.exports = router;
