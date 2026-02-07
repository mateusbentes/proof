const express = require('express');
const router = express.Router();
const aiProfileService = require('../services/aiProfileService');

/**
 * POST /api/ai/analyze-profile
 * Analyze conversation history and extract user profile
 */
router.post('/analyze-profile', async (req, res) => {
  try {
    const { conversationHistory } = req.body;

    if (!conversationHistory || conversationHistory.length === 0) {
      return res.status(400).json({
        error: 'Conversation history is required',
      });
    }

    const analysis = await aiProfileService.analyzeConversation(conversationHistory);

    res.status(200).json(analysis);
  } catch (error) {
    console.error('Analysis error:', error.message);
    res.status(500).json({
      error: 'Failed to analyze profile',
      message: error.message,
    });
  }
});

/**
 * POST /api/ai/continue-conversation
 * Generate AI response to continue conversation
 */
router.post('/continue-conversation', async (req, res) => {
  try {
    const { conversationHistory, messageCount } = req.body;

    if (!conversationHistory || conversationHistory.length === 0) {
      return res.status(400).json({
        error: 'Conversation history is required',
      });
    }

    const response = await aiProfileService.continueConversation(
      conversationHistory,
      messageCount
    );

    res.status(200).json({
      response,
    });
  } catch (error) {
    console.error('Conversation error:', error.message);
    res.status(500).json({
      error: 'Failed to generate response',
      message: error.message,
    });
  }
});

/**
 * POST /api/ai/detect-user
 * Detect user from conversation and create account if needed
 */
router.post('/detect-user', async (req, res) => {
  try {
    const { conversationHistory } = req.body;

    if (!conversationHistory || conversationHistory.length === 0) {
      return res.status(400).json({
        error: 'Conversation history is required',
      });
    }

    const detection = await aiProfileService.detectUser(conversationHistory);

    if (detection.found) {
      // User already exists
      res.status(200).json({
        found: true,
        user: detection.user,
        message: `Welcome back, ${detection.analysis.displayName}!`,
      });
    } else {
      // Create new user
      const result = await aiProfileService.createUserFromAnalysis(detection.analysis);
      
      res.status(201).json({
        found: false,
        token: result.token,
        user: result.user,
        analysis: result.analysis,
        message: `Welcome, ${result.analysis.displayName}!`,
      });
    }
  } catch (error) {
    console.error('Detection error:', error.message);
    res.status(500).json({
      error: 'Failed to detect user',
      message: error.message,
    });
  }
});

/**
 * POST /api/auth/ai-register
 * Register user with AI-generated profile
 */
router.post('/ai-register', async (req, res) => {
  try {
    const {
      username,
      email,
      displayName,
      bio,
      avatarPrompt,
      conversationAnalysis,
    } = req.body;

    // Validate required fields
    if (!username || !email || !displayName) {
      return res.status(400).json({
        error: 'Missing required fields',
      });
    }

    // Create account using AI profile service
    const result = await aiProfileService.createUserFromAnalysis({
      username,
      email,
      displayName,
      bio,
      avatarPrompt,
      ...conversationAnalysis,
    });

    res.status(201).json({
      message: 'User created successfully',
      token: result.token,
      user: result.user,
    });
  } catch (error) {
    console.error('AI registration error:', error.message);
    res.status(500).json({
      error: 'Failed to create user',
      message: error.message,
    });
  }
});

/**
 * POST /api/ai/avatar-prompt
 * Generate detailed avatar prompt from analysis
 */
router.post('/avatar-prompt', async (req, res) => {
  try {
    const { analysis } = req.body;

    if (!analysis) {
      return res.status(400).json({
        error: 'Analysis is required',
      });
    }

    const avatarPrompt = await aiProfileService.generateAvatarPrompt(analysis);

    res.status(200).json({
      avatarPrompt,
    });
  } catch (error) {
    console.error('Avatar prompt error:', error.message);
    res.status(500).json({
      error: 'Failed to generate avatar prompt',
      message: error.message,
    });
  }
});

module.exports = router;
