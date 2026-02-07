const axios = require('axios');
const { v4: uuidv4 } = require('uuid');

class AutoRegistrationService {
  constructor() {
    this.apiUrl = process.env.API_URL || 'http://localhost:3001/api';
    this.client = axios.create({
      baseURL: this.apiUrl,
      validateStatus: () => true,
    });
    this.registeredUsers = [];
  }

  /**
   * Generate random username
   */
  generateUsername(prefix = 'user') {
    return `${prefix}_${uuidv4().substring(0, 8)}`;
  }

  /**
   * Generate random email
   */
  generateEmail(username) {
    return `${username}@proof.local`;
  }

  /**
   * Generate secure password
   */
  generatePassword(length = 16) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < length; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  }

  /**
   * Auto-register a new user
   */
  async autoRegister(options = {}) {
    try {
      const {
        usernamePrefix = 'user',
        displayName = null,
        bio = 'Proof community member',
        avatarPrompt = 'A friendly avatar',
      } = options;

      const username = this.generateUsername(usernamePrefix);
      const email = this.generateEmail(username);
      const password = this.generatePassword();

      console.log(`🤖 Auto-registering user: ${username}`);

      // Step 1: Register
      const registerResponse = await this.client.post('/auth/register', {
        username,
        email,
        password,
      });

      if (registerResponse.status !== 201) {
        throw new Error(`Registration failed: ${registerResponse.data.error}`);
      }

      const { userId, sessionId } = registerResponse.data;
      console.log(`✓ User registered: ${userId}`);

      // Step 2: Complete conversational authentication
      await this.completeConversationalAuth(sessionId);
      console.log(`✓ Conversational auth completed`);

      // Step 3: Login automatically
      const loginResponse = await this.client.post('/auth/login', {
        email,
        password,
      });

      if (loginResponse.status !== 200) {
        throw new Error(`Login failed: ${loginResponse.data.error}`);
      }

      const { token, user } = loginResponse.data;
      console.log(`✓ User logged in automatically`);

      // Step 4: Update profile
      await this.client.put(
        `/users/${userId}/profile`,
        {
          displayName: displayName || username,
          bio,
          avatarPrompt,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      console.log(`✓ Profile updated`);

      // Step 5: Generate avatar
      await this.client.post(
        `/users/${userId}/avatar`,
        { prompt: avatarPrompt },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      console.log(`✓ Avatar generated`);

      const userData = {
        userId,
        username,
        email,
        password,
        token,
        displayName: displayName || username,
        bio,
        avatarPrompt,
        registeredAt: new Date(),
        loggedIn: true,
      };

      this.registeredUsers.push(userData);

      console.log(`✅ User fully registered and logged in: ${username}`);
      return userData;
    } catch (error) {
      console.error('❌ Auto-registration failed:', error.message);
      throw error;
    }
  }

  /**
   * Auto-register multiple users
   */
  async autoRegisterMultiple(count = 5, options = {}) {
    try {
      console.log(`\n🤖 Auto-registering ${count} users...`);
      const users = [];

      for (let i = 0; i < count; i++) {
        try {
          const user = await this.autoRegister({
            usernamePrefix: options.usernamePrefix || 'user',
            displayName: options.displayName ? `${options.displayName} ${i + 1}` : null,
            bio: options.bio || 'Proof community member',
            avatarPrompt: options.avatarPrompt || 'A friendly avatar',
          });
          users.push(user);
          console.log(`[${i + 1}/${count}] ✓ User registered and logged in\n`);
        } catch (error) {
          console.error(`[${i + 1}/${count}] ✗ Failed: ${error.message}\n`);
        }
      }

      console.log(`\n✅ Auto-registration complete: ${users.length}/${count} users registered`);
      return users;
    } catch (error) {
      console.error('❌ Batch registration failed:', error.message);
      throw error;
    }
  }

  /**
   * Auto-login existing user
   */
  async autoLogin(email, password) {
    try {
      console.log(`🤖 Auto-logging in user: ${email}`);

      const loginResponse = await this.client.post('/auth/login', {
        email,
        password,
      });

      if (loginResponse.status !== 200) {
        throw new Error(`Login failed: ${loginResponse.data.error}`);
      }

      const { token, user } = loginResponse.data;
      console.log(`✅ User logged in: ${user.username}`);

      return {
        token,
        user,
        loggedInAt: new Date(),
      };
    } catch (error) {
      console.error('❌ Auto-login failed:', error.message);
      throw error;
    }
  }

  /**
   * Complete conversational authentication automatically
   */
  async completeConversationalAuth(sessionId) {
    try {
      const responses = [
        'I am passionate about open-source software and have been contributing to various projects for years. I believe in the power of community-driven development and transparency.',
        'I have contributed to several open-source projects including Linux kernel patches and maintained a popular GitHub repository. I also self-host my own services for data sovereignty and privacy.',
        'I would like my avatar to be a combination of a developer hat with a Linux penguin logo, representing my passion for open-source development and community collaboration.',
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
    } catch (error) {
      console.error('❌ Conversational auth failed:', error.message);
      throw error;
    }
  }

  /**
   * Get all registered users
   */
  getRegisteredUsers() {
    return this.registeredUsers;
  }

  /**
   * Get user by username
   */
  getUserByUsername(username) {
    return this.registeredUsers.find(u => u.username === username);
  }

  /**
   * Get user by email
   */
  getUserByEmail(email) {
    return this.registeredUsers.find(u => u.email === email);
  }

  /**
   * Get user credentials (for re-login)
   */
  getUserCredentials(username) {
    const user = this.getUserByUsername(username);
    if (!user) {
      return null;
    }
    return {
      email: user.email,
      password: user.password,
      token: user.token,
    };
  }

  /**
   * Export registered users to JSON
   */
  exportUsers() {
    return {
      count: this.registeredUsers.length,
      users: this.registeredUsers.map(u => ({
        username: u.username,
        email: u.email,
        password: u.password,
        token: u.token,
        displayName: u.displayName,
        registeredAt: u.registeredAt,
      })),
    };
  }

  /**
   * Clear all registered users (for testing)
   */
  clearUsers() {
    this.registeredUsers = [];
    console.log('✓ All registered users cleared');
  }
}

module.exports = new AutoRegistrationService();
