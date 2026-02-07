const axios = require('axios');
const { v4: uuidv4 } = require('uuid');

class AIProfileService {
  constructor() {
    this.apiUrl = process.env.API_URL || 'http://localhost:3001/api';
    this.openaiApiKey = process.env.OPENAI_API_KEY;
    this.client = axios.create({
      baseURL: this.apiUrl,
      validateStatus: () => true,
    });
  }

  /**
   * Analyze conversation to extract user profile
   */
  async analyzeConversation(conversationHistory) {
    try {
      console.log('🤖 Analyzing conversation...');

      // Build conversation text
      const conversationText = conversationHistory
        .map(msg => `${msg.role === 'user' ? 'User' : 'Bot'}: ${msg.content}`)
        .join('\n');

      // Call OpenAI to analyze
      const analysisPrompt = `
Analyze this conversation and extract user profile information. Return JSON with:
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

Be creative and infer from context. Make the profile feel authentic and personal.
`;

      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-4',
          messages: [
            {
              role: 'system',
              content: 'You are an expert at analyzing conversations and creating authentic user profiles. Always return valid JSON.',
            },
            {
              role: 'user',
              content: analysisPrompt,
            },
          ],
          temperature: 0.7,
        },
        {
          headers: {
            'Authorization': `Bearer ${this.openaiApiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.status === 200) {
        const content = response.data.choices[0].message.content;
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        
        if (jsonMatch) {
          const analysis = JSON.parse(jsonMatch[0]);
          console.log('✅ Profile analysis complete:', analysis.displayName);
          return analysis;
        }
      }

      throw new Error('Failed to parse AI response');
    } catch (error) {
      console.error('❌ Analysis error:', error.message);
      throw error;
    }
  }

  /**
   * Continue conversation with AI
   */
  async continueConversation(conversationHistory, messageCount) {
    try {
      console.log('🤖 Generating response...');

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

      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-4',
          messages: [
            {
              role: 'system',
              content: systemPrompt,
            },
            ...conversationHistory.map(msg => ({
              role: msg.role,
              content: msg.content,
            })),
          ],
          temperature: 0.8,
          max_tokens: 150,
        },
        {
          headers: {
            'Authorization': `Bearer ${this.openaiApiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.status === 200) {
        const botResponse = response.data.choices[0].message.content;
        console.log('✅ Response generated');
        return botResponse;
      }

      throw new Error('Failed to generate response');
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
      console.log('🎨 Generating avatar prompt...');

      const prompt = `Based on this user profile, create a detailed avatar description:
Name: ${analysis.displayName}
Bio: ${analysis.bio}
Interests: ${analysis.interests.join(', ')}
Personality: ${analysis.personality}

Create a vivid, detailed description for an AI image generator that captures their essence.
Keep it to 1-2 sentences.`;

      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-4',
          messages: [
            {
              role: 'user',
              content: prompt,
            },
          ],
          temperature: 0.8,
          max_tokens: 100,
        },
        {
          headers: {
            'Authorization': `Bearer ${this.openaiApiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.status === 200) {
        const avatarPrompt = response.data.choices[0].message.content;
        console.log('✅ Avatar prompt generated');
        return avatarPrompt;
      }

      throw new Error('Failed to generate avatar prompt');
    } catch (error) {
      console.error('❌ Avatar prompt error:', error.message);
      throw error;
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
      console.log('🔍 Detecting user...');

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
}

module.exports = new AIProfileService();
