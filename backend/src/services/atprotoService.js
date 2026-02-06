const axios = require('axios');

const ATPROTO_URL = process.env.ATPROTO_URL || 'https://bsky.social';

class ATProtoService {
  constructor() {
    this.client = null;
    this.session = null;
  }

  async initialize() {
    try {
      if (!process.env.ATPROTO_USERNAME || !process.env.ATPROTO_PASSWORD) {
        console.warn('ATProto credentials not configured. Federation disabled.');
        return;
      }

      this.client = axios.create({
        baseURL: ATPROTO_URL,
        headers: {
          'Content-Type': 'application/json',
        },
      });

      await this.authenticate();
      console.log('✓ ATProto service initialized');
    } catch (error) {
      console.warn('Failed to initialize ATProto:', error.message);
    }
  }

  async authenticate() {
    try {
      const response = await this.client.post('/xrpc/com.atproto.server.createSession', {
        identifier: process.env.ATPROTO_USERNAME,
        password: process.env.ATPROTO_PASSWORD,
      });

      this.session = response.data;
      this.client.defaults.headers.common.Authorization = `Bearer ${this.session.accessJwt}`;
    } catch (error) {
      console.error('ATProto authentication failed:', error.message);
    }
  }

  async publishPost(text, metadata = {}) {
    if (!this.client || !this.session) {
      console.warn('ATProto not initialized');
      return null;
    }

    try {
      const response = await this.client.post('/xrpc/com.atproto.repo.createRecord', {
        repo: this.session.did,
        collection: 'app.bsky.feed.post',
        record: {
          text,
          createdAt: new Date().toISOString(),
          ...metadata,
        },
      });

      return response.data;
    } catch (error) {
      console.error('Failed to publish post to ATProto:', error.message);
      return null;
    }
  }

  async publishProfile(displayName, description, avatar) {
    if (!this.client || !this.session) {
      console.warn('ATProto not initialized');
      return null;
    }

    try {
      const response = await this.client.post('/xrpc/com.atproto.repo.createRecord', {
        repo: this.session.did,
        collection: 'app.bsky.actor.profile',
        record: {
          displayName,
          description,
          avatar,
          createdAt: new Date().toISOString(),
        },
      });

      return response.data;
    } catch (error) {
      console.error('Failed to publish profile to ATProto:', error.message);
      return null;
    }
  }

  async getProfile(did) {
    if (!this.client) {
      console.warn('ATProto not initialized');
      return null;
    }

    try {
      const response = await this.client.get('/xrpc/app.bsky.actor.getProfile', {
        params: { actor: did },
      });

      return response.data;
    } catch (error) {
      console.error('Failed to get ATProto profile:', error.message);
      return null;
    }
  }

  async followUser(did) {
    if (!this.client || !this.session) {
      console.warn('ATProto not initialized');
      return null;
    }

    try {
      const response = await this.client.post('/xrpc/com.atproto.repo.createRecord', {
        repo: this.session.did,
        collection: 'app.bsky.graph.follow',
        record: {
          subject: did,
          createdAt: new Date().toISOString(),
        },
      });

      return response.data;
    } catch (error) {
      console.error('Failed to follow user on ATProto:', error.message);
      return null;
    }
  }

  async likePost(uri, cid) {
    if (!this.client || !this.session) {
      console.warn('ATProto not initialized');
      return null;
    }

    try {
      const response = await this.client.post('/xrpc/com.atproto.repo.createRecord', {
        repo: this.session.did,
        collection: 'app.bsky.feed.like',
        record: {
          subject: { uri, cid },
          createdAt: new Date().toISOString(),
        },
      });

      return response.data;
    } catch (error) {
      console.error('Failed to like post on ATProto:', error.message);
      return null;
    }
  }

  getDID() {
    return this.session?.did || null;
  }

  isConnected() {
    return this.client !== null && this.session !== null;
  }
}

module.exports = new ATProtoService();
