const express = require('express');
const botService = require('../services/botService');
const { verifyToken } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');
const { query } = require('../db/connection');

const router = express.Router();

const checkAdmin = asyncHandler(async (req, res, next) => {
  const result = await query(
    'SELECT role FROM users WHERE id = $1',
    [req.user.userId],
  );

  if (!result.rows[0] || result.rows[0].role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }

  next();
});

// Create bot account
router.post('/create', verifyToken, checkAdmin, asyncHandler(async (req, res) => {
  const {
    username,
    email,
    password,
    displayName,
    bio,
    avatarPrompt,
  } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ error: 'Username, email, and password are required' });
  }

  try {
    const botAccount = await botService.createBotAccount({
      username,
      email,
      password,
      displayName: displayName || username,
      bio: bio || 'Bot account',
      avatarPrompt: avatarPrompt || 'A robot avatar',
    });

    res.status(201).json({
      message: 'Bot account created successfully',
      bot: {
        userId: botAccount.userId,
        username: botAccount.username,
        email: botAccount.email,
        token: botAccount.token,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}));

// Login bot
router.post('/login', verifyToken, checkAdmin, asyncHandler(async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  try {
    const result = await botService.loginBot(username, password);
    res.json(result);
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
}));

// Update bot profile
router.put('/:botId/profile', verifyToken, checkAdmin, asyncHandler(async (req, res) => {
  const { botId } = req.params;
  const { token, ...profileData } = req.body;

  if (!token) {
    return res.status(400).json({ error: 'Bot token is required' });
  }

  try {
    const result = await botService.updateBotProfile(botId, token, profileData);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}));

// Create bot post
router.post('/:botId/posts', verifyToken, checkAdmin, asyncHandler(async (req, res) => {
  const { botId } = req.params;
  const { token, communityId, title, content } = req.body;

  if (!token || !communityId || !title || !content) {
    return res.status(400).json({ error: 'Token, communityId, title, and content are required' });
  }

  try {
    const result = await botService.createBotPost(botId, token, communityId, {
      title,
      content,
    });
    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}));

// Create bot comment
router.post('/:botId/comments', verifyToken, checkAdmin, asyncHandler(async (req, res) => {
  const { botId } = req.params;
  const { token, postId, content } = req.body;

  if (!token || !postId || !content) {
    return res.status(400).json({ error: 'Token, postId, and content are required' });
  }

  try {
    const result = await botService.createBotComment(botId, token, postId, content);
    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}));

// Join community
router.post('/:botId/communities/:communityId/join', verifyToken, checkAdmin, asyncHandler(async (req, res) => {
  const { botId, communityId } = req.params;
  const { token } = req.body;

  if (!token) {
    return res.status(400).json({ error: 'Bot token is required' });
  }

  try {
    const result = await botService.joinBotCommunity(botId, token, communityId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}));

// Upvote post
router.post('/:botId/posts/:postId/upvote', verifyToken, checkAdmin, asyncHandler(async (req, res) => {
  const { botId, postId } = req.params;
  const { token } = req.body;

  if (!token) {
    return res.status(400).json({ error: 'Bot token is required' });
  }

  try {
    const result = await botService.upvotePost(botId, token, postId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}));

// Delete bot account
router.delete('/:botId', verifyToken, checkAdmin, asyncHandler(async (req, res) => {
  const { botId } = req.params;
  const { token, password } = req.body;

  if (!token || !password) {
    return res.status(400).json({ error: 'Token and password are required' });
  }

  try {
    const result = await botService.deleteBotAccount(botId, token, password);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}));

// Get all bot accounts
router.get('/list', verifyToken, checkAdmin, asyncHandler(async (req, res) => {
  const bots = botService.getAllBotAccounts();
  res.json({
    count: bots.length,
    bots: bots.map(bot => ({
      userId: bot.userId,
      username: bot.username,
      email: bot.email,
      createdAt: bot.createdAt,
    })),
  });
}));

// Simulate bot activity
router.post('/simulate', verifyToken, checkAdmin, asyncHandler(async (req, res) => {
  const { botConfig, activityConfig } = req.body;

  if (!botConfig || !activityConfig) {
    return res.status(400).json({ error: 'botConfig and activityConfig are required' });
  }

  try {
    const result = await botService.simulateBotActivity(botConfig, activityConfig);
    res.status(201).json({
      message: 'Bot activity simulation completed',
      bot: result,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}));

module.exports = router;
