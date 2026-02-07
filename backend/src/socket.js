const jwt = require('jsonwebtoken');
const { query } = require('./db/connection');
const { pushService } = require('./services/pushService');

const initializeSocket = (io) => {
  // Middleware: Authenticate socket connections
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;

      if (!token) {
        return next(new Error('Authentication error'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.id;
      socket.username = decoded.username;

      next();
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });

  // Connection handler
  io.on('connection', (socket) => {
    console.log(`✓ User ${socket.userId} connected via Socket.IO`);

    // Join thread room
    socket.on('thread:join', async (data) => {
      const { threadId } = data;

      try {
        // Verify user is participant
        const result = await query(
          'SELECT 1 FROM chat_thread_participants WHERE thread_id = $1 AND user_id = $2',
          [threadId, socket.userId]
        );

        if (result.rowCount === 0) {
          socket.emit('error', { message: 'Not a participant in this thread' });
          return;
        }

        socket.join(`thread:${threadId}`);
        console.log(`✓ User ${socket.userId} joined thread ${threadId}`);

        // Notify others that user is online
        socket.to(`thread:${threadId}`).emit('user:online', {
          userId: socket.userId,
          username: socket.username
        });
      } catch (error) {
        console.error('Error joining thread:', error);
        socket.emit('error', { message: 'Failed to join thread' });
      }
    });

    // Leave thread room
    socket.on('thread:leave', (data) => {
      const { threadId } = data;
      socket.leave(`thread:${threadId}`);
      console.log(`✓ User ${socket.userId} left thread ${threadId}`);

      socket.to(`thread:${threadId}`).emit('user:offline', {
        userId: socket.userId,
        username: socket.username
      });
    });

    // Send message in real-time
    socket.on('message:send', async (data) => {
      const { threadId, content, clientMessageId } = data;

      try {
        // Verify user is participant
        const participantCheck = await query(
          'SELECT 1 FROM chat_thread_participants WHERE thread_id = $1 AND user_id = $2',
          [threadId, socket.userId]
        );

        if (participantCheck.rowCount === 0) {
          socket.emit('error', { message: 'Not a participant in this thread' });
          return;
        }

        if (!content || content.trim().length === 0) {
          socket.emit('error', { message: 'Message content is required' });
          return;
        }

        // Insert message into database
        const messageId = require('uuid').v4();
        const result = await query(
          `INSERT INTO chat_messages (id, thread_id, sender_id, client_message_id, content)
           VALUES ($1, $2, $3, $4, $5)
           RETURNING id, created_at`,
          [messageId, threadId, socket.userId, clientMessageId || null, content.trim()]
        );

        const message = {
          id: result.rows[0].id,
          threadId,
          senderId: socket.userId,
          username: socket.username,
          content: content.trim(),
          createdAt: result.rows[0].created_at,
          clientMessageId
        };

        // Broadcast to all users in thread
        io.to(`thread:${threadId}`).emit('message:new', message);

        // Send push notifications to offline users
        await pushService.notifyThreadMessage(threadId, socket.userId, content);

        // Acknowledge to sender
        socket.emit('message:ack', {
          clientMessageId,
          messageId: result.rows[0].id,
          createdAt: result.rows[0].created_at
        });
      } catch (error) {
        console.error('Error sending message:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Typing indicator
    socket.on('typing:start', (data) => {
      const { threadId } = data;

      socket.to(`thread:${threadId}`).emit('typing:start', {
        userId: socket.userId,
        username: socket.username
      });
    });

    socket.on('typing:stop', (data) => {
      const { threadId } = data;

      socket.to(`thread:${threadId}`).emit('typing:stop', {
        userId: socket.userId
      });
    });

    // Disconnect handler
    socket.on('disconnect', () => {
      console.log(`✓ User ${socket.userId} disconnected`);
    });

    // Error handler
    socket.on('error', (error) => {
      console.error('Socket error:', error);
    });
  });

  return io;
};

module.exports = { initializeSocket };
