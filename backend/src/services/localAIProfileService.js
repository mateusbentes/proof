const axios = require('axios');
const { v4: uuidv4 } = require('uuid');

class LocalAIProfileService {
  constructor() {
    this.apiUrl = process.env.API_URL || 'http://localhost:3001/api';
    this.ollamaUrl = process.env.OLLAMA_API_URL || 'http://localhost:11434/api';
    this.model = process.env.OLLAMA_MODEL || 'mistral'; // mistral, llama2, neural-chat
    this.client = axios.create({
      baseURL: this.apiUrl,
      validateStatus: () => true,
    });
  }

  /**
   * Call local Ollama API
   */
  async callOllama(prompt, systemPrompt = '') {
    try {
      console.log(`🤖 Calling Ollama (${this.model})...`);

      const fullPrompt = systemPrompt 
        ? `${systemPrompt}\n\n${prompt}`
        : prompt;

      const response = await axios.post(
        `${this.ollamaUrl}/generate`,
        {
          model: this.model,
          prompt: fullPrompt,
          stream: false,
          temperature: 0.7,
        },
        {
          timeout: 60000, // 60 second timeout for AI response
        }
      );

      if (response.status === 200) {
        console.log('✅ Ollama response received');
        return response.data.response;
      }

      throw new Error('Failed to get response from Ollama');
    } catch (error) {
      console.error('❌ Ollama error:', error.message);
      throw error;
    }
  }

  /**
   * Analyze conversation to extract user profile
   */
  async analyzeConversation(conversationHistory) {
    try {
      console.log('🤖 Analyzing conversation with local AI...');

      // Build conversation text
      const conversationText = conversationHistory
        .map(msg => `${msg.role === 'user' ? 'User' : 'Bot'}: ${msg.content}`)
        .join('\n');

      const analysisPrompt = `Analyze this conversation and extract user profile information. Return ONLY valid JSON with no markdown formatting:

{
  "displayName": "Full name or preferred name",
  "bio": "Short bio (1-2 sentences about their interests/experience)",
  "avatarPrompt": "Detailed description for avatar generation",
  "username": "username_${Math.random().toString(36).substr(2, 9)}",
  "email": "generated_${Math.random().toString(36).substr(2, 9)}@proof.local",
  "interests": ["interest1", "interest2"],
  "experience": "Summary of their experience",
  "personality": "Brief personality description"
}

Conversation:
${conversationText}

Be creative and infer from context. Make the profile feel authentic and personal. Return ONLY the JSON object, no other text.`;

      const systemPrompt = `You are an expert at analyzing conversations and creating authentic user profiles. 
Always return ONLY valid JSON without markdown formatting or code blocks.
Do not include any text before or after the JSON.`;

      const response = await this.callOllama(analysisPrompt, systemPrompt);

      // Parse JSON response
      try {
        // Remove markdown code blocks if present
        let jsonStr = response.trim();
        if (jsonStr.startsWith('```json')) {
          jsonStr = jsonStr.replace(/^```json\n?/, '').replace(/\n?```$/, '');
        } else if (jsonStr.startsWith('```')) {
          jsonStr = jsonStr.replace(/^```\n?/, '').replace(/\n?```$/, '');
        }

        const analysis = JSON.parse(jsonStr);
        console.log('✅ Profile analysis complete:', analysis.displayName);
        return analysis;
      } catch (parseError) {
        console.error('❌ JSON parse error:', parseError.message);
        console.error('Response was:', response);
        
        // Fallback: create basic profile
        return {
          displayName: 'Community Member',
          bio: 'Passionate about open-source and community',
          avatarPrompt: 'A friendly avatar',
          username: `user_${Math.random().toString(36).substr(2, 9)}`,
          email: `user_${Math.random().toString(36).substr(2, 9)}@proof.local`,
          interests: ['open-source', 'community'],
          experience: 'Community participant',
          personality: 'Friendly and engaged',
        };
      }
    } catch (error) {
      console.error('❌ Analysis error:', error.message);
      throw error;
    }
  }

  /**
   * Continue conversation with local AI
   */
  async continueConversation(conversationHistory, messageCount) {
    try {
      console.log('🤖 Generating response with local AI...');

      const conversationText = conversationHistory
        .map(msg => `${msg.role === 'user' ? 'User' : 'Bot'}: ${msg.content}`)
        .join('\n');

      const systemPrompt = `You are a friendly AI assistant helping users onboard to Proof, a human-centric community platform.
Your goal is to learn about the user naturally through conversation.
Ask engaging questions about:
- Their interests and passions
- Their experience with open-source or communities
- What brings them to Proof
- Their hobbies and what they're passionate about

Be warm, encouraging, and conversational. Keep responses concise (1-2 sentences).
After 3-4 exchanges, you'll have enough to create their profile.`;

      const userPrompt = `Continue this conversation naturally:

${conversationText}

Bot:`;

      const response = await this.callOllama(userPrompt, systemPrompt);

      // Clean up response
      let botResponse = response.trim();
      if (botResponse.startsWith('Bot:')) {
        botResponse = botResponse.substring(4).trim();
      }

      console.log('✅ Response generated');
      return botResponse;
    } catch (error) {
      console.error('❌ Conversation error:', error.message);
      throw error;
    }
  }

  /**
   * Generate avatar prompt from analysis
   */
  async generateAvatarPrompt(analysis) {
    try {
      console.log('🎨 Generating avatar prompt with local AI...');

      const prompt = `Based on this user profile, create a detailed avatar description:
Name: ${analysis.displayName}
Bio: ${analysis.bio}
Interests: ${analysis.interests.join(', ')}
Personality: ${analysis.personality}

Create a vivid, detailed description for an AI image generator that captures their essence.
Keep it to 1-2 sentences. Return ONLY the description, no other text.`;

      const response = await this.callOllama(prompt);
      const avatarPrompt = response.trim();

      console.log('✅ Avatar prompt generated');
      return avatarPrompt;
    } catch (error) {
      console.error('❌ Avatar prompt error:', error.message);
      // Return fallback
      return `A unique avatar representing ${analysis.displayName}`;
    }
  }

  /**
   * Create user account from AI analysis
   */
  async createUserFromAnalysis(analysis) {
    try {
      console.log('👤 Creating user account...');

      // Register user
      const registerResponse = await this.client.post('/auth/register', {
        username: analysis.username,
        email: analysis.email,
        password: this.generateSecurePassword(),
      });

      if (registerResponse.status !== 201) {
        throw new Error(`Registration failed: ${registerResponse.data.error}`);
      }

      const { userId, sessionId } = registerResponse.data;
      console.log('✅ User registered:', userId);

      // Update profile
      const profileResponse = await this.client.put(
        `/users/${userId}/profile`,
        {
          displayName: analysis.displayName,
          bio: analysis.bio,
        }
      );

      if (profileResponse.status !== 200) {
        throw new Error(`Profile update failed: ${profileResponse.data.error}`);
      }

      console.log('✅ Profile updated');

      // Generate avatar
      const avatarResponse = await this.client.post(
        `/users/${userId}/avatar`,
        { prompt: analysis.avatarPrompt }
      );

      if (avatarResponse.status !== 200) {
        console.warn('⚠️ Avatar generation failed, continuing anyway');
      } else {
        console.log('✅ Avatar generated');
      }

      // Login user
      const loginResponse = await this.client.post('/auth/login', {
        email: analysis.email,
        password: this.generateSecurePassword(),
      });

      if (loginResponse.status !== 200) {
        throw new Error(`Login failed: ${loginResponse.data.error}`);
      }

      const { token, user } = loginResponse.data;
      console.log('✅ User logged in');

      return {
        token,
        user,
        analysis,
      };
    } catch (error) {
      console.error('❌ Account creation error:', error.message);
      throw error;
    }
  }

  /**
   * Generate secure password
   */
  generateSecurePassword(length = 32) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < length; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  }

  /**
   * Detect user from conversation
   */
  async detectUser(conversationHistory) {
    try {
      console.log('🔍 Detecting user with local AI...');

      const analysis = await this.analyzeConversation(conversationHistory);
      
      // Check if user already exists
      const existingUser = await this.client.get(
        `/users/search?username=${analysis.username}`
      );

      if (existingUser.status === 200 && existingUser.data.user) {
        console.log('✅ User found:', analysis.displayName);
        return {
          found: true,
          user: existingUser.data.user,
          analysis,
        };
      }

      console.log('✅ New user detected:', analysis.displayName);
      return {
        found: false,
        analysis,
      };
    } catch (error) {
      console.error('❌ Detection error:', error.message);
      throw error;
    }
  }

  /**
   * Check if Ollama is running
   */
  async checkOllamaStatus() {
    try {
      const response = await axios.get(`${this.ollamaUrl}/tags`, {
        timeout: 5000,
      });
      
      if (response.status === 200) {
        console.log('✅ Ollama is running');
        console.log('Available models:', response.data.models.map(m => m.name));
        return true;
      }
      return false;
    } catch (error) {
      console.error('❌ Ollama is not running:', error.message);
      return false;
    }
  }

  /**
   * Get Ollama model info
   */
  async getModelInfo() {
    try {
      const response = await axios.get(`${this.ollamaUrl}/tags`, {
        timeout: 5000,
      });
      
      if (response.status === 200) {
        return response.data.models;
      }
      return [];
    } catch (error) {
      console.error('❌ Failed to get model info:', error.message);
      return [];
    }
  }
}

module.exports = new LocalAIProfileService();
