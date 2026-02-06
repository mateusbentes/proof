const express = require('express');
const { v4: uuidv4 } = require('uuid');
const Joi = require('joi');
const { query } = require('../db/connection');
const { verifyToken } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');

const router = express.Router();

const reportSchema = Joi.object({
  reportedUserId: Joi.string().uuid(),
  postId: Joi.string().uuid(),
  commentId: Joi.string().uuid(),
  reason: Joi.string().min(10).max(500).required(),
  description: Joi.string().max(2000),
});

const actionSchema = Joi.object({
  userId: Joi.string().uuid().required(),
  action: Joi.string().valid('warn', 'suspend', 'ban').required(),
  reason: Joi.string().min(10).max(500).required(),
  duration: Joi.number().min(1),
});

router.post('/report', verifyToken, asyncHandler(async (req, res) => {
  const { error, value } = reportSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }

  const { reportedUserId, postId, commentId, reason, description } = value;

  if (!reportedUserId && !postId && !commentId) {
    return res.status(400).json({ error: 'Must report a user, post, or comment' });
  }

  const reportId = uuidv4();

  await query(
    `INSERT INTO reports (id, reporter_id, reported_user_id, post_id, comment_id, reason, description, status)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
    [reportId, req.user.userId, reportedUserId, postId, commentId, reason, description, 'open'],
  );

  res.status(201).json({
    id: reportId,
    reporterId: req.user.userId,
    reportedUserId,
    postId,
    commentId,
    reason,
    status: 'open',
    createdAt: new Date().toISOString(),
  });
}));

router.get('/reports', verifyToken, asyncHandler(async (req, res) => {
  const userResult = await query(
    'SELECT role FROM users WHERE id = $1',
    [req.user.userId],
  );

  if (!userResult.rows[0] || userResult.rows[0].role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }

  const result = await query(
    `SELECT r.id, r.reporter_id, r.reported_user_id, r.post_id, r.comment_id,
            r.reason, r.description, r.status, r.created_at,
            u.username as reporter_username,
            ru.username as reported_username
     FROM reports r
     LEFT JOIN users u ON r.reporter_id = u.id
     LEFT JOIN users ru ON r.reported_user_id = ru.id
     ORDER BY r.created_at DESC`,
  );

  res.json(result.rows);
}));

router.post('/action', verifyToken, asyncHandler(async (req, res) => {
  const { error, value } = actionSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }

  const adminResult = await query(
    'SELECT role FROM users WHERE id = $1',
    [req.user.userId],
  );

  if (!adminResult.rows[0] || adminResult.rows[0].role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }

  const { userId, action, reason, duration } = value;

  const logId = uuidv4();

  await query(
    `INSERT INTO moderation_logs (id, user_id, action, reason, moderator_id, duration)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [logId, userId, action, reason, req.user.userId, duration || null],
  );

  if (action === 'ban') {
    await query(
      'UPDATE users SET is_banned = TRUE WHERE id = $1',
      [userId],
    );
  }

  res.status(201).json({
    id: logId,
    userId,
    action,
    reason,
    moderatorId: req.user.userId,
    duration,
    createdAt: new Date().toISOString(),
  });
}));

router.get('/logs', verifyToken, asyncHandler(async (req, res) => {
  const adminResult = await query(
    'SELECT role FROM users WHERE id = $1',
    [req.user.userId],
  );

  if (!adminResult.rows[0] || adminResult.rows[0].role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }

  const result = await query(
    `SELECT ml.id, ml.user_id, ml.action, ml.reason, ml.moderator_id, ml.duration, ml.created_at,
            u.username as user_username,
            m.username as moderator_username
     FROM moderation_logs ml
     LEFT JOIN users u ON ml.user_id = u.id
     LEFT JOIN users m ON ml.moderator_id = m.id
     ORDER BY ml.created_at DESC`,
  );

  res.json(result.rows);
}));

router.post('/reports/:reportId/resolve', verifyToken, asyncHandler(async (req, res) => {
  const { reportId } = req.params;
  const { status } = req.body;

  if (!['resolved', 'dismissed'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }

  const adminResult = await query(
    'SELECT role FROM users WHERE id = $1',
    [req.user.userId],
  );

  if (!adminResult.rows[0] || adminResult.rows[0].role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }

  await query(
    'UPDATE reports SET status = $1, resolved_at = CURRENT_TIMESTAMP WHERE id = $2',
    [status, reportId],
  );

  res.json({ message: `Report ${status}` });
}));

module.exports = router;
