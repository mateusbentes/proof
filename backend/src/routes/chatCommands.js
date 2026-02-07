const express = require('express');
const router = express.Router();
const { executeCommand, parseCommand } = require('../services/chatCommandService');
const auth = require('../middleware/auth');

// POST /api/chat/command - Handle chat commands
router.post('/command', auth, async (req, res) => {
  try {
    const { message } = req.body;
    
    if (!message || !message.startsWith('/')) {
      return res.json({
        type: 'message',
        content: message,
        timestamp: new Date().toISOString(),
        isUser: true
      });
    }

    const commandObj = parseCommand(message);
    if (!commandObj) {
      return res.json({
        type: 'error',
        content: 'Invalid command format. Use /help for available commands.',
        timestamp: new Date().toISOString()
      });
    }

    const response = await executeCommand(commandObj.command, commandObj.args, req.user.id);
    res.json(response);
  } catch (error) {
    console.error('Chat command error:', error);
    res.json({
      type: 'error',
      content: 'An error occurred processing your command.',
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = router;
