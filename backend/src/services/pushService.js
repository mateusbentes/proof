const admin = require('firebase-admin');
const { query } = require('../db/connection');

class PushService {
  constructor() {
    this.initialized = false;
  }

  async initialize() {
    try {
      if (process.env.FIREBASE_CREDENTIALS) {
        const credentials = JSON.parse(process.env.FIREBASE_CREDENTIALS);
        admin.initializeApp({
          credential: admin.credential.cert(credentials)
        });
        this.initialized = true;
        console.log('✓ Firebase Cloud Messaging initialized');
      } else {
        console.log('⚠ Firebase credentials not configured, push notifications disabled');
      }
    } catch (error) {
      console.error('✗ Failed to initialize Firebase:', error.message);
    }
  }

  async registerDevice(userId, deviceToken, platform, deviceName) {
    try {
      await query(
        `INSERT INTO user_devices (user_id, device_token, platform, device_name)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (user_id, device_token) DO UPDATE SET updated_at = now()`,
        [userId, deviceToken, platform, deviceName || null]
      );
    } catch (error) {
      console.error('Failed to register device:', error);
    }
  }

  async unregisterDevice(userId, deviceToken) {
    try {
      await query(
        'DELETE FROM user_devices WHERE user_id = $1 AND device_token = $2',
        [userId, deviceToken]
      );
    } catch (error) {
      console.error('Failed to unregister device:', error);
    }
  }

  async notifyThreadMessage(threadId, senderId, messageContent) {
    if (!this.initialized) return;

    try {
      // Get all participants except sender
      const participantsResult = await query(
        `SELECT DISTINCT ctp.user_id, u.username
         FROM chat_thread_participants ctp
         JOIN users u ON ctp.user_id = u.id
         WHERE ctp.thread_id = $1 AND ctp.user_id != $2`,
        [threadId, senderId]
      );

      if (participantsResult.rowCount === 0) return;

      // Get sender info
      const senderResult = await query(
        'SELECT username FROM users WHERE id = $1',
        [senderId]
      );

      const senderName = senderResult.rows[0]?.username || 'Someone';

      // Get devices for all participants
      for (const participant of participantsResult.rows) {
        const devicesResult = await query(
          'SELECT device_token FROM user_devices WHERE user_id = $1',
          [participant.user_id]
        );

        const deviceTokens = devicesResult.rows.map(d => d.device_token);

        if (deviceTokens.length > 0) {
          await this.sendMulticast(
            deviceTokens,
            {
              notification: {
                title: senderName,
                body: messageContent.substring(0, 100)
              },
              data: {
                threadId,
                senderId,
                type: 'chat_message'
              }
            }
          );
        }
      }
    } catch (error) {
      console.error('Failed to send thread message notifications:', error);
    }
  }

  async notifyThreadInvite(threadId, invitedUserId, inviterName) {
    if (!this.initialized) return;

    try {
      const devicesResult = await query(
        'SELECT device_token FROM user_devices WHERE user_id = $1',
        [invitedUserId]
      );

      const deviceTokens = devicesResult.rows.map(d => d.device_token);

      if (deviceTokens.length > 0) {
        await this.sendMulticast(
          deviceTokens,
          {
            notification: {
              title: 'New Chat Invitation',
              body: `${inviterName} added you to a group chat`
            },
            data: {
              threadId,
              type: 'chat_invite'
            }
          }
        );
      }
    } catch (error) {
      console.error('Failed to send invite notifications:', error);
    }
  }

  async sendMulticast(tokens, message) {
    if (!this.initialized || tokens.length === 0) return;

    try {
      const response = await admin.messaging().sendMulticast({
        tokens,
        ...message
      });

      // Clean up failed tokens
      if (response.failureCount > 0) {
        const failedTokens = [];
        response.responses.forEach((resp, idx) => {
          if (!resp.success) {
            failedTokens.push(tokens[idx]);
          }
        });

        // Remove invalid tokens
        for (const token of failedTokens) {
          try {
            await query(
              'DELETE FROM user_devices WHERE device_token = $1',
              [token]
            );
          } catch (error) {
            console.error('Failed to remove invalid token:', error);
          }
        }
      }

      return response;
    } catch (error) {
      console.error('Failed to send multicast message:', error);
    }
  }

  async sendToUser(userId, message) {
    if (!this.initialized) return;

    try {
      const devicesResult = await query(
        'SELECT device_token FROM user_devices WHERE user_id = $1',
        [userId]
      );

      const deviceTokens = devicesResult.rows.map(d => d.device_token);

      if (deviceTokens.length > 0) {
        return await this.sendMulticast(deviceTokens, message);
      }
    } catch (error) {
      console.error('Failed to send notification to user:', error);
    }
  }
}

const pushService = new PushService();

module.exports = { pushService };
