const axios = require('axios');
const { query } = require('../db/connection');
const { generateToken } = require('../middleware/auth');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

class BotService {
  constructor() {
    this.apiUrl = process.env.API_URL || 'http://localhost:3001/api';
    this.client = axios.create({
      baseURL: this.apiUrl,
      validateStatus: () => true,
    });
    this.botAccounts = [];
  }

  async createBotAccount(botConfig) {
    try {
      const {
        username,
        email,
        password,
        displayName,
        bio,
        avatarPrompt,
      } = botConfig;

      // Register bot account
      const registerResponse = await this.client.post('/auth/register', {
        username,
        email,
        password,
      });

      if (registerResponse.status !== 201) {
        throw new Error(`Registration failed: ${registerResponse.data.error}`);
      }

      const { userId, sessionId } = registerResponse.data;

      // Complete conversational authentication
      await this.completeConversationalAuth(sessionId);

      // Update profile
      const token = generateToken(userId, username);
      await this.client.put(
        `/users/${userId}/profile`,
        {
          displayName,
          bio,
          avatarPrompt,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      // Generate avatar
      await this.client.post(
        `/users/${userId}/avatar`,
        { prompt: avatarPrompt },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      const botAccount = {
        userId,
        username,
        email,
        password,
        token,
        createdAt: new Date(),
      };

      this.botAccounts.push(botAccount);

      console.log(`✓ Bot account created: ${username}`);
      return botAccount;
    } catch (error) {
      console.error('Failed to create bot account:', error.message);
      throw error;
    }
  }

  async completeConversationalAuth(sessionId) {
    try {
      const responses = [
        'I am passionate about open-source software and have been contributing to various projects for years. I believe in the power of community-driven development.',
        'I have contributed to several open-source projects including Linux kernel patches and maintained a popular GitHub repository. I also self-host my own services for data sovereignty.',
        'I would like my avatar to be a combination of a developer hat with a Linux penguin logo, representing my passion for open-source development.',
      ];

      for (const response of responses) {
        const messageResponse = await this.client.post('/conversations/message', {
          sessionId,
          userMessage: response,
        });

        if (messageResponse.status !== 200) {
          throw new Error(`Conversation failed: ${messageResponse.data.error}`);
        }

        if (messageResponse.data.status === 'completed') {
          break;
        }
      }

      console.log(`✓ Conversational auth completed for session: ${sessionId}`);
    } catch (error) {
      console.error('Failed to complete conversational auth:', error.message);
      throw error;
    }
  }

  async loginBot(username, password) {
    try {
      const loginResponse = await this.client.post('/auth/login', {
        email: `${username}@bot.proof.local`,
        password,
      });

      if (loginResponse.status !== 200) {
        throw new Error(`Login failed: ${loginResponse.data.error}`);
      }

      const { token, user } = loginResponse.data;

      console.log(`✓ Bot logged in: ${username}`);
      return { token, user };
    } catch (error) {
      console.error('Failed to login bot:', error.message);
      throw error;
    }
  }

  async updateBotProfile(userId, token, profileData) {
    try {
      const response = await this.client.put(
        `/users/${userId}/profile`,
        profileData,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (response.status !== 200) {
        throw new Error(`Profile update failed: ${response.data.error}`);
      }

      console.log(`✓ Bot profile updated: ${userId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to update bot profile:', error.message);
      throw error;
    }
  }

  async createBotPost(userId, token, communityId, postData) {
    try {
      const response = await this.client.post(
        '/posts',
        {
          communityId,
          ...postData,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (response.status !== 201) {
        throw new Error(`Post creation failed: ${response.data.error}`);
      }

      console.log(`✓ Bot post created: ${response.data.id}`);
      return response.data;
    } catch (error) {
      console.error('Failed to create bot post:', error.message);
      throw error;
    }
  }

  async createBotComment(userId, token, postId, content) {
    try {
      const response = await this.client.post(
        `/posts/${postId}/comments`,
        { content },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (response.status !== 201) {
        throw new Error(`Comment creation failed: ${response.data.error}`);
      }

      console.log(`✓ Bot comment created: ${response.data.id}`);
      return response.data;
    } catch (error) {
      console.error('Failed to create bot comment:', error.message);
      throw error;
    }
  }

  async joinBotCommunity(userId, token, communityId) {
    try {
      const response = await this.client.post(
        `/communities/${communityId}/join`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (response.status !== 200) {
        throw new Error(`Join community failed: ${response.data.error}`);
      }

      console.log(`✓ Bot joined community: ${communityId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to join community:', error.message);
      throw error;
    }
  }

  async upvotePost(userId, token, postId) {
    try {
      const response = await this.client.post(
        `/posts/${postId}/upvote`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (response.status !== 200) {
        throw new Error(`Upvote failed: ${response.data.error}`);
      }

      console.log(`✓ Bot upvoted post: ${postId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to upvote post:', error.message);
      throw error;
    }
  }

  async deleteBotAccount(userId, token, password) {
    try {
      const response = await this.client.delete(
        '/federation/delete-account',
        {
          data: { password },
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (response.status !== 200) {
        throw new Error(`Account deletion failed: ${response.data.error}`);
      }

      this.botAccounts = this.botAccounts.filter(acc => acc.userId !== userId);

      console.log(`✓ Bot account deleted: ${userId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to delete bot account:', error.message);
      throw error;
    }
  }

  getBotAccount(username) {
    return this.botAccounts.find(acc => acc.username === username);
  }

  getAllBotAccounts() {
    return this.botAccounts;
  }

  async simulateBotActivity(botConfig, activityConfig) {
    try {
      // Create bot account
      const botAccount = await this.createBotAccount(botConfig);

      // Join communities
      if (activityConfig.communities && activityConfig.communities.length > 0) {
        for (const communityId of activityConfig.communities) {
          await this.joinBotCommunity(botAccount.userId, botAccount.token, communityId);
        }
      }

      // Create posts
      if (activityConfig.posts && activityConfig.posts.length > 0) {
        for (const postData of activityConfig.posts) {
          await this.createBotPost(
            botAccount.userId,
            botAccount.token,
            postData.communityId,
            {
              title: postData.title,
              content: postData.content,
            },
          );
        }
      }

      // Create comments
      if (activityConfig.comments && activityConfig.comments.length > 0) {
        for (const commentData of activityConfig.comments) {
          await this.createBotComment(
            botAccount.userId,
            botAccount.token,
            commentData.postId,
            commentData.content,
          );
        }
      }

      console.log(`✓ Bot activity simulation completed for: ${botConfig.username}`);
      return botAccount;
    } catch (error) {
      console.error('Failed to simulate bot activity:', error.message);
      throw error;
    }
  }
}

module.exports = new BotService();
