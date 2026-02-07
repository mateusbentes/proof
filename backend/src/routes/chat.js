const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

// Regular chat messages (non-commands)
router.post('/', auth, async (req, res) => {
  try {
    const { message } = req.body;
    
    // Forward non-command messages to chat commands for unified handling
    const response = await fetch('http://localhost:5000/api/chat/command', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': req.headers.authorization
      },
      body: JSON.stringify({ message })
    });
    
    const chatResponse = await response.json();
    res.json(chatResponse);
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({
      type: 'error',
      content: 'Failed to process chat message.',
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = router;
