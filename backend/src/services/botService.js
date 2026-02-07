const { query } = require('../db/connection');
const { v4: uuidv4 } = require('uuid');

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

  // Mistral AI response
  async getMistralResponse(bot, userMessage) {
    try {
      // Check if Mistral API key is configured
      if (!bot.config.api_key) {
        return 'Mistral AI is not configured. Please add your API key.';
      }

      // For now, return a placeholder
      // In production, integrate with Mistral API
      return `Mistral response to: "${userMessage}"`;
    } catch (error) {
      console.error('Mistral error:', error);
      return 'Sorry, I encountered an error processing your request.';
    }
  }

  // OpenAI response
  async getOpenAIResponse(bot, userMessage) {
    try {
      if (!bot.config.api_key) {
        return 'OpenAI is not configured. Please add your API key.';
      }

      // For now, return a placeholder
      // In production, integrate with OpenAI API
      return `OpenAI response to: "${userMessage}"`;
    } catch (error) {
      console.error('OpenAI error:', error);
      return 'Sorry, I encountered an error processing your request.';
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
