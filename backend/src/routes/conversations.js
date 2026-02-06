const express = require('express');
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');
const { query } = require('../db/connection');
const { verifyToken } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');

const router = express.Router();

const RASA_URL = process.env.RASA_URL || 'http://localhost:5005';

const CONVERSATION_FLOW = [
  {
    step: 1,
    prompt: "Welcome to Proof! To ensure you're human, let's chat briefly. Why do you want to join this community?",
    followUp: null,
  },
  {
    step: 2,
    prompt: "You're interested in free software. Tell me about a time you contributed to or used open-source tools. Why did it matter to you?",
    followUp: "Tell me more about your experience with open-source.",
  },
  {
    step: 3,
    prompt: "Describe how you'd like your profile picture to look (e.g., 'a modder's hat with a Linux logo'). I'll generate it for you!",
    followUp: "What visual elements are important to you?",
  },
];

router.post('/start', asyncHandler(async (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({ error: 'userId is required' });
  }

  const sessionId = uuidv4();

  await query(
    'INSERT INTO conversations (user_id, session_id, status) VALUES ($1, $2, $3)',
    [userId, sessionId, 'active'],
  );

  const firstPrompt = CONVERSATION_FLOW[0].prompt;

  res.json({
    sessionId,
    step: 1,
    message: firstPrompt,
  });
}));

router.post('/message', asyncHandler(async (req, res) => {
  const { sessionId, userMessage } = req.body;

  if (!sessionId || !userMessage) {
    return res.status(400).json({ error: 'sessionId and userMessage are required' });
  }

  const convResult = await query(
    'SELECT id, user_id, status FROM conversations WHERE session_id = $1',
    [sessionId],
  );

  if (convResult.rows.length === 0) {
    return res.status(404).json({ error: 'Conversation not found' });
  }

  const conversation = convResult.rows[0];

  if (conversation.status === 'completed') {
    return res.status(400).json({ error: 'Conversation already completed' });
  }

  await query(
    'INSERT INTO conversation_messages (conversation_id, sender, content) VALUES ($1, $2, $3)',
    [conversation.id, 'user', userMessage],
  );

  let rasaResponse = { intent: { name: 'nlu_fallback' }, confidence: 0 };
  try {
    const rasaResult = await axios.post(`${RASA_URL}/model/parse`, {
      text: userMessage,
    });
    rasaResponse = rasaResult.data;
  } catch (error) {
    console.warn('Rasa service unavailable, using fallback');
  }

  const botScore = calculateBotScore(userMessage, rasaResponse);
  const authenticityScore = 1 - botScore;

  const messageCount = await query(
    'SELECT COUNT(*) FROM conversation_messages WHERE conversation_id = $1',
    [conversation.id],
  );

  const currentStep = Math.ceil(messageCount.rows[0].count / 2);
  const nextStep = Math.min(currentStep + 1, CONVERSATION_FLOW.length);

  let botMessage = '';
  let status = 'active';

  if (nextStep < CONVERSATION_FLOW.length) {
    botMessage = CONVERSATION_FLOW[nextStep].prompt;
  } else {
    botMessage = 'Thank you! Your profile is being verified. You should receive confirmation shortly.';
    status = 'completed';
  }

  await query(
    'INSERT INTO conversation_messages (conversation_id, sender, content) VALUES ($1, $2, $3)',
    [conversation.id, 'bot', botMessage],
  );

  await query(
    'UPDATE conversations SET status = $1, bot_score = $2, authenticity_score = $3, updated_at = CURRENT_TIMESTAMP WHERE id = $4',
    [status, botScore, authenticityScore, conversation.id],
  );

  res.json({
    sessionId,
    step: nextStep,
    botMessage,
    botScore,
    authenticityScore,
    status,
  });
}));

router.get('/:sessionId', asyncHandler(async (req, res) => {
  const { sessionId } = req.params;

  const result = await query(
    'SELECT id, user_id, status, bot_score, authenticity_score, created_at FROM conversations WHERE session_id = $1',
    [sessionId],
  );

  if (result.rows.length === 0) {
    return res.status(404).json({ error: 'Conversation not found' });
  }

  const conversation = result.rows[0];

  const messagesResult = await query(
    'SELECT sender, content, created_at FROM conversation_messages WHERE conversation_id = $1 ORDER BY created_at ASC',
    [conversation.id],
  );

  res.json({
    ...conversation,
    messages: messagesResult.rows,
  });
}));

function calculateBotScore(message, rasaResponse) {
  let score = 0;

  if (rasaResponse.intent.confidence < 0.5) {
    score += 0.3;
  }

  const genericPhrases = [
    'privacy is important',
    'i love tech',
    'open source is good',
    'i like computers',
  ];

  const lowerMessage = message.toLowerCase();
  if (genericPhrases.some((phrase) => lowerMessage.includes(phrase))) {
    score += 0.4;
  }

  if (message.length < 20) {
    score += 0.2;
  }

  if (message.split(' ').length < 5) {
    score += 0.1;
  }

  return Math.min(score, 1);
}

module.exports = router;
