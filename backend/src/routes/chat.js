const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { verifyToken } = require('../middleware/auth');
const { query } = require('../db/connection');
const { pushService } = require('../services/pushService');

const router = express.Router();

const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

// Get user's chat threads with unread counts
router.get('/threads', verifyToken, asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const limit = Math.min(parseInt(req.query.limit) || 20, 100);
  const offset = parseInt(req.query.offset) || 0;

  const result = await query(
    `SELECT 
      ct.id,
      ct.thread_type,
      ct.title,
      ct.created_at,
      ct.updated_at,
      COUNT(CASE WHEN cm.created_at > ctp.last_read_at THEN 1 END) as unread_count,
      (SELECT json_agg(json_build_object('id', u.id, 'username', u.username, 'avatar_url', u.avatar_url))
       FROM chat_thread_participants ctp2
       JOIN users u ON u.id = ctp2.user_id
       WHERE ctp2.thread_id = ct.id AND ctp2.user_id != $1
       LIMIT 3) as participants,
      (SELECT content FROM chat_messages WHERE thread_id = ct.id ORDER BY created_at DESC LIMIT 1) as last_message
    FROM chat_threads ct
    JOIN chat_thread_participants ctp ON ct.id = ctp.thread_id
    LEFT JOIN chat_messages cm ON ct.id = cm.thread_id AND cm.deleted_at IS NULL
    WHERE ctp.user_id = $1
    GROUP BY ct.id, ctp.last_read_at
    ORDER BY ct.updated_at DESC
    LIMIT $2 OFFSET $3`,
    [userId, limit, offset]
  );

  res.json({
    threads: result.rows,
    total: result.rowCount,
    limit,
    offset
  });
}));

// Create new DM or group chat
router.post('/threads', verifyToken, asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { thread_type, participant_ids, title } = req.body;

  if (!['dm', 'group'].includes(thread_type)) {
    return res.status(400).json({ error: 'Invalid thread_type' });
  }

  if (thread_type === 'dm' && (!participant_ids || participant_ids.length !== 1)) {
    return res.status(400).json({ error: 'DM requires exactly one other participant' });
  }

  if (thread_type === 'group' && (!participant_ids || participant_ids.length < 1)) {
    return res.status(400).json({ error: 'Group requires at least one participant' });
  }

  const threadId = uuidv4();
  const allParticipants = [userId, ...participant_ids];

  try {
    await query('BEGIN');

    // Create thread
    await query(
      `INSERT INTO chat_threads (id, thread_type, title, created_by) 
       VALUES ($1, $2, $3, $4)`,
      [threadId, thread_type, title || null, userId]
    );

    // Add participants
    for (const participantId of allParticipants) {
      await query(
        `INSERT INTO chat_thread_participants (thread_id, user_id, role) 
         VALUES ($1, $2, $3)`,
        [threadId, participantId, participantId === userId ? 'admin' : 'member']
      );
    }

    await query('COMMIT');

    res.status(201).json({
      id: threadId,
      thread_type,
      title,
      created_at: new Date().toISOString()
    });
  } catch (error) {
    await query('ROLLBACK');
    throw error;
  }
}));

// Get messages in a thread with pagination
router.get('/threads/:threadId/messages', verifyToken, asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { threadId } = req.params;
  const limit = Math.min(parseInt(req.query.limit) || 50, 100);
  const offset = parseInt(req.query.offset) || 0;

  // Verify user is participant
  const participantCheck = await query(
    'SELECT 1 FROM chat_thread_participants WHERE thread_id = $1 AND user_id = $2',
    [threadId, userId]
  );

  if (participantCheck.rowCount === 0) {
    return res.status(403).json({ error: 'Not a participant in this thread' });
  }

  const result = await query(
    `SELECT 
      cm.id,
      cm.sender_id,
      u.username,
      u.avatar_url,
      cm.content,
      cm.created_at,
      cm.edited_at,
      cm.deleted_at
    FROM chat_messages cm
    JOIN users u ON cm.sender_id = u.id
    WHERE cm.thread_id = $1 AND cm.deleted_at IS NULL
    ORDER BY cm.created_at DESC
    LIMIT $2 OFFSET $3`,
    [threadId, limit, offset]
  );

  res.json({
    messages: result.rows.reverse(),
    total: result.rowCount,
    limit,
    offset
  });
}));

// Send message to thread
router.post('/threads/:threadId/messages', verifyToken, asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { threadId } = req.params;
  const { content, client_message_id } = req.body;

  if (!content || content.trim().length === 0) {
    return res.status(400).json({ error: 'Message content is required' });
  }

  // Verify user is participant
  const participantCheck = await query(
    'SELECT 1 FROM chat_thread_participants WHERE thread_id = $1 AND user_id = $2',
    [threadId, userId]
  );

  if (participantCheck.rowCount === 0) {
    return res.status(403).json({ error: 'Not a participant in this thread' });
  }

  const messageId = uuidv4();

  try {
    await query(
      `INSERT INTO chat_messages (id, thread_id, sender_id, client_message_id, content)
       VALUES ($1, $2, $3, $4, $5)`,
      [messageId, threadId, userId, client_message_id || null, content.trim()]
    );

    // Get sender info
    const senderResult = await query(
      'SELECT username, avatar_url FROM users WHERE id = $1',
      [userId]
    );

    const message = {
      id: messageId,
      sender_id: userId,
      username: senderResult.rows[0].username,
      avatar_url: senderResult.rows[0].avatar_url,
      content: content.trim(),
      created_at: new Date().toISOString()
    };

    // Send push notifications to other participants
    await pushService.notifyThreadMessage(threadId, userId, content);

    res.status(201).json(message);
  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({ error: 'Message already sent' });
    }
    throw error;
  }
}));

// Mark thread as read
router.post('/threads/:threadId/read', verifyToken, asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { threadId } = req.params;

  const result = await query(
    `UPDATE chat_thread_participants 
     SET last_read_at = now()
     WHERE thread_id = $1 AND user_id = $2
     RETURNING last_read_at`,
    [threadId, userId]
  );

  if (result.rowCount === 0) {
    return res.status(404).json({ error: 'Thread not found or not a participant' });
  }

  res.json({ last_read_at: result.rows[0].last_read_at });
}));

// Update thread (title for groups)
router.put('/threads/:threadId', verifyToken, asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { threadId } = req.params;
  const { title } = req.body;

  // Verify user is admin
  const adminCheck = await query(
    'SELECT 1 FROM chat_thread_participants WHERE thread_id = $1 AND user_id = $2 AND role = $3',
    [threadId, userId, 'admin']
  );

  if (adminCheck.rowCount === 0) {
    return res.status(403).json({ error: 'Only admins can update thread' });
  }

  const result = await query(
    'UPDATE chat_threads SET title = $1, updated_at = now() WHERE id = $2 RETURNING *',
    [title, threadId]
  );

  if (result.rowCount === 0) {
    return res.status(404).json({ error: 'Thread not found' });
  }

  res.json(result.rows[0]);
}));

// Leave/delete thread
router.delete('/threads/:threadId', verifyToken, asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { threadId } = req.params;

  // Check if user is participant
  const participantCheck = await query(
    'SELECT role FROM chat_thread_participants WHERE thread_id = $1 AND user_id = $2',
    [threadId, userId]
  );

  if (participantCheck.rowCount === 0) {
    return res.status(404).json({ error: 'Not a participant in this thread' });
  }

  try {
    await query('BEGIN');

    // Remove user from thread
    await query(
      'DELETE FROM chat_thread_participants WHERE thread_id = $1 AND user_id = $2',
      [threadId, userId]
    );

    // If no participants left, delete thread
    const remainingParticipants = await query(
      'SELECT COUNT(*) as count FROM chat_thread_participants WHERE thread_id = $1',
      [threadId]
    );

    if (remainingParticipants.rows[0].count === 0) {
      await query('DELETE FROM chat_threads WHERE id = $1', [threadId]);
    }

    await query('COMMIT');
    res.json({ success: true });
  } catch (error) {
    await query('ROLLBACK');
    throw error;
  }
}));

// Add participant to group
router.post('/threads/:threadId/participants', verifyToken, asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { threadId } = req.params;
  const { user_id } = req.body;

  // Verify requester is admin
  const adminCheck = await query(
    'SELECT 1 FROM chat_thread_participants WHERE thread_id = $1 AND user_id = $2 AND role = $3',
    [threadId, userId, 'admin']
  );

  if (adminCheck.rowCount === 0) {
    return res.status(403).json({ error: 'Only admins can add participants' });
  }

  try {
    await query(
      `INSERT INTO chat_thread_participants (thread_id, user_id, role)
       VALUES ($1, $2, 'member')`,
      [threadId, user_id]
    );

    res.status(201).json({ success: true });
  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({ error: 'User already in thread' });
    }
    throw error;
  }
}));

// Remove participant from group
router.delete('/threads/:threadId/participants/:userId', verifyToken, asyncHandler(async (req, res) => {
  const requesterId = req.user.id;
  const { threadId, userId } = req.params;

  // Verify requester is admin
  const adminCheck = await query(
    'SELECT 1 FROM chat_thread_participants WHERE thread_id = $1 AND user_id = $2 AND role = $3',
    [threadId, requesterId, 'admin']
  );

  if (adminCheck.rowCount === 0) {
    return res.status(403).json({ error: 'Only admins can remove participants' });
  }

  const result = await query(
    'DELETE FROM chat_thread_participants WHERE thread_id = $1 AND user_id = $2',
    [threadId, userId]
  );

  if (result.rowCount === 0) {
    return res.status(404).json({ error: 'Participant not found' });
  }

  res.json({ success: true });
}));

// Register device for push notifications
router.post('/devices', verifyToken, asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { device_token, platform, device_name } = req.body;

  if (!device_token || !platform) {
    return res.status(400).json({ error: 'device_token and platform are required' });
  }

  if (!['ios', 'android', 'web'].includes(platform)) {
    return res.status(400).json({ error: 'Invalid platform' });
  }

  const deviceId = uuidv4();

  try {
    await query(
      `INSERT INTO user_devices (id, user_id, device_token, platform, device_name)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (user_id, device_token) DO UPDATE SET updated_at = now()`,
      [deviceId, userId, device_token, platform, device_name || null]
    );

    res.status(201).json({ success: true });
  } catch (error) {
    throw error;
  }
}));

module.exports = router;
