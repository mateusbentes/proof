const { query } = require('../db/connection');
const { v4: uuidv4 } = require('uuid');
const axios = require('axios');

class BotService {
  // Get all active bots
  async getActiveBots() {
    const result = await query(
      'SELECT id, name, type, description, avatar, config FROM bots WHERE is_active = true ORDER BY name'
    );
    return result.rows;
  }

  // Get bot by ID
  async getBotById(botId) {
    const result = await query(
      'SELECT id, name, type, description, avatar, config FROM bots WHERE id = $1',
      [botId]
    );
    return result.rows[0] || null;
  }

  // Get or create bot conversation
  async getOrCreateConversation(botId, userId) {
    let result = await query(
      'SELECT id FROM bot_conversations WHERE bot_id = $1 AND user_id = $2',
      [botId, userId]
    );

    if (result.rows.length > 0) {
      return result.rows[0].id;
    }

    const conversationId = uuidv4();
    await query(
      'INSERT INTO bot_conversations (id, bot_id, user_id) VALUES ($1, $2, $3)',
      [conversationId, botId, userId]
    );
    return conversationId;
  }

  // Get conversation messages
  async getConversationMessages(conversationId, limit = 50, offset = 0) {
    const result = await query(
      `SELECT id, sender_type, content, created_at FROM bot_messages 
       WHERE conversation_id = $1 
       ORDER BY created_at DESC 
       LIMIT $2 OFFSET $3`,
      [conversationId, limit, offset]
    );
    return result.rows.reverse();
  }

  // Add message to conversation
  async addMessage(conversationId, senderType, content, metadata = {}) {
    const messageId = uuidv4();
    await query(
      `INSERT INTO bot_messages (id, conversation_id, sender_type, content, metadata) 
       VALUES ($1, $2, $3, $4, $5)`,
      [messageId, conversationId, senderType, content, JSON.stringify(metadata)]
    );
    return {
      id: messageId,
      sender_type: senderType,
      content,
      created_at: new Date().toISOString(),
    };
  }

  // Get bot response based on type
  async getBotResponse(bot, userMessage) {
    switch (bot.type) {
      case 'mistral':
        return await this.getMistralResponse(bot, userMessage);
      case 'openai':
        return await this.getOpenAIResponse(bot, userMessage);
      case 'custom':
      default:
        return this.getCustomResponse(bot, userMessage);
    }
  }

  // Mistral AI response (via Ollama, with fallbacks)
  async getMistralResponse(bot, userMessage) {
    try {
      const ollamaUrl = process.env.OLLAMA_API_URL || 'http://localhost:11434/api';
      const model = bot.config?.model || process.env.OLLAMA_MODEL || 'mistral';
      const temperature = bot.config?.temperature || 0.7;

      const response = await axios.post(
        `${ollamaUrl}/generate`,
        {
          model,
          prompt: userMessage,
          temperature,
          stream: false
        },
        {
          timeout: 60000
        }
      );

      if (response.data && response.data.response) {
        return response.data.response.trim();
      }

      return 'I received an empty response from Mistral. Please try again.';
    } catch (ollamaError) {
      // Try Rasa as first fallback
      try {
        return await this.getRasaResponse(userMessage);
      } catch (rasaError) {
        // Fall back to custom keyword-based responses
        try {
          return this.getCustomResponse({}, userMessage);
        } catch (customError) {
          // Final fallback
          return 'Hello! How can I help you today?';
        }
      }
    }
  }

  // Rasa response (fallback)
  async getRasaResponse(userMessage) {
    const rasaUrl = process.env.RASA_URL || 'http://localhost:5005';
    
    const response = await axios.post(
      `${rasaUrl}/model/parse`,
      {
        text: userMessage
      },
      {
        timeout: 30000
      }
    );

    if (response.data && response.data.intent) {
      // Return a response based on intent
      const intent = response.data.intent.name;
      const confidence = response.data.intent.confidence;

      if (confidence > 0.5) {
        // Use Rasa's understanding to generate a response
        return `I understood you're asking about "${intent}". How can I help you with that?`;
      }
    }

    // Fallback to custom response
    return this.getCustomResponse({}, userMessage);
  }

  // OpenAI response (via Ollama if API key not configured)
  async getOpenAIResponse(bot, userMessage) {
    try {
      // If no API key, fall back to Ollama
      if (!bot.config || !bot.config.api_key) {
        return await this.getMistralResponse(bot, userMessage);
      }

      const apiKey = bot.config.api_key;
      const model = bot.config.model || 'gpt-3.5-turbo';
      const temperature = bot.config.temperature || 0.7;
      const maxTokens = bot.config.max_tokens || 1024;

      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model,
          messages: [
            {
              role: 'user',
              content: userMessage
            }
          ],
          temperature,
          max_tokens: maxTokens
        },
        {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          },
          timeout: 30000
        }
      );

      if (response.data && response.data.choices && response.data.choices.length > 0) {
        return response.data.choices[0].message.content;
      }

      return 'I received an empty response from OpenAI. Please try again.';
    } catch (error) {
      console.error('OpenAI error:', error.message);
      
      if (error.response?.status === 401) {
        return 'OpenAI API key is invalid. Please check your configuration.';
      }
      if (error.response?.status === 429) {
        return 'OpenAI API rate limit exceeded. Please try again later.';
      }
      if (error.code === 'ECONNABORTED') {
        return 'Request to OpenAI timed out. Please try again.';
      }
      
      return 'Sorry, I encountered an error processing your request. Please try again later.';
    }
  }

  // Custom/keyword-based response
  getCustomResponse(bot, userMessage) {
    const lowerMessage = userMessage.toLowerCase();

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

    return 'That\'s interesting! I\'m here to help. Feel free to ask me about communities, posts, profiles, or anything else about the platform!';
  }
}

module.exports = new BotService();
