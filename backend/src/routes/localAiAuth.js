const express = require('express');
const router = express.Router();
const localAIProfileService = require('../services/localAIProfileService');

/**
 * POST /api/local-ai/analyze-profile
 * Analyze conversation history and extract user profile using local AI
 */
router.post('/analyze-profile', async (req, res) => {
  try {
    const { conversationHistory } = req.body;

    if (!conversationHistory || conversationHistory.length === 0) {
      return res.status(400).json({
        error: 'Conversation history is required',
      });
    }

    const analysis = await localAIProfileService.analyzeConversation(conversationHistory);

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
 * POST /api/local-ai/continue-conversation
 * Generate AI response to continue conversation using local AI
 */
router.post('/continue-conversation', async (req, res) => {
  try {
    const { conversationHistory, messageCount } = req.body;

    if (!conversationHistory || conversationHistory.length === 0) {
      return res.status(400).json({
        error: 'Conversation history is required',
      });
    }

    const response = await localAIProfileService.continueConversation(
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
 * POST /api/local-ai/detect-user
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

    const detection = await localAIProfileService.detectUser(conversationHistory);

    if (detection.found) {
      // User already exists
      res.status(200).json({
        found: true,
        user: detection.user,
        message: `Welcome back, ${detection.analysis.displayName}!`,
      });
    } else {
      // Create new user
      const result = await localAIProfileService.createUserFromAnalysis(detection.analysis);
      
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
 * POST /api/auth/local-ai-register
 * Register user with local AI-generated profile
 */
router.post('/local-ai-register', async (req, res) => {
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

    // Create account using local AI profile service
    const result = await localAIProfileService.createUserFromAnalysis({
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
    console.error('Local AI registration error:', error.message);
    res.status(500).json({
      error: 'Failed to create user',
      message: error.message,
    });
  }
});

/**
 * POST /api/local-ai/avatar-prompt
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

    const avatarPrompt = await localAIProfileService.generateAvatarPrompt(analysis);

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

/**
 * GET /api/local-ai/status
 * Check if Ollama is running and get model info
 */
router.get('/status', async (req, res) => {
  try {
    const isRunning = await localAIProfileService.checkOllamaStatus();
    const models = await localAIProfileService.getModelInfo();

    res.status(200).json({
      running: isRunning,
      models: models.map(m => ({
        name: m.name,
        size: m.size,
        digest: m.digest,
      })),
      currentModel: process.env.OLLAMA_MODEL || 'mistral',
    });
  } catch (error) {
    console.error('Status check error:', error.message);
    res.status(500).json({
      error: 'Failed to check status',
      message: error.message,
    });
  }
});

module.exports = router;
