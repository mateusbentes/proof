const express = require('express');
const { query } = require('../db/connection');
const { verifyToken } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');

const router = express.Router();

const checkAdmin = asyncHandler(async (req, res, next) => {
  const result = await query(
    'SELECT role FROM users WHERE id = $1',
    [req.user.userId],
  );

  if (!result.rows[0] || result.rows[0].role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }

  next();
});

router.get('/dashboard', verifyToken, checkAdmin, asyncHandler(async (req, res) => {
  const usersResult = await query('SELECT COUNT(*) as count FROM users');
  const communitiesResult = await query('SELECT COUNT(*) as count FROM communities');
  const postsResult = await query('SELECT COUNT(*) as count FROM posts');
  const reportsResult = await query('SELECT COUNT(*) as count FROM reports WHERE status = $1', ['open']);
  const bannedUsersResult = await query('SELECT COUNT(*) as count FROM users WHERE is_banned = TRUE');

  res.json({
    totalUsers: parseInt(usersResult.rows[0].count),
    totalCommunities: parseInt(communitiesResult.rows[0].count),
    totalPosts: parseInt(postsResult.rows[0].count),
    openReports: parseInt(reportsResult.rows[0].count),
    bannedUsers: parseInt(bannedUsersResult.rows[0].count),
  });
}));

router.get('/users', verifyToken, checkAdmin, asyncHandler(async (req, res) => {
  const result = await query(
    `SELECT id, username, email, is_verified, is_banned, bot_score, created_at
     FROM users
     ORDER BY created_at DESC`,
  );

  res.json(result.rows);
}));

router.get('/users/:userId', verifyToken, checkAdmin, asyncHandler(async (req, res) => {
  const { userId } = req.params;

  const userResult = await query(
    `SELECT id, username, email, is_verified, is_banned, bot_score, created_at
     FROM users WHERE id = $1`,
    [userId],
  );

  if (userResult.rows.length === 0) {
    return res.status(404).json({ error: 'User not found' });
  }

  const profileResult = await query(
    'SELECT * FROM user_profiles WHERE user_id = $1',
    [userId],
  );

  const communitiesResult = await query(
    `SELECT c.id, c.name, c.slug FROM communities c
     JOIN community_members cm ON c.id = cm.community_id
     WHERE cm.user_id = $1`,
    [userId],
  );

  const postsResult = await query(
    'SELECT COUNT(*) as count FROM posts WHERE user_id = $1',
    [userId],
  );

  res.json({
    user: userResult.rows[0],
    profile: profileResult.rows[0],
    communities: communitiesResult.rows,
    postCount: parseInt(postsResult.rows[0].count),
  });
}));

router.post('/users/:userId/verify', verifyToken, checkAdmin, asyncHandler(async (req, res) => {
  const { userId } = req.params;

  await query(
    'UPDATE users SET is_verified = TRUE WHERE id = $1',
    [userId],
  );

  res.json({ message: 'User verified' });
}));

router.post('/users/:userId/ban', verifyToken, checkAdmin, asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { reason } = req.body;

  await query(
    'UPDATE users SET is_banned = TRUE WHERE id = $1',
    [userId],
  );

  await query(
    `INSERT INTO moderation_logs (id, user_id, action, reason, moderator_id)
     VALUES (gen_random_uuid(), $1, $2, $3, $4)`,
    [userId, 'ban', reason, req.user.userId],
  );

  res.json({ message: 'User banned' });
}));

router.post('/users/:userId/unban', verifyToken, checkAdmin, asyncHandler(async (req, res) => {
  const { userId } = req.params;

  await query(
    'UPDATE users SET is_banned = FALSE WHERE id = $1',
    [userId],
  );

  res.json({ message: 'User unbanned' });
}));

router.get('/communities', verifyToken, checkAdmin, asyncHandler(async (req, res) => {
  const result = await query(
    `SELECT c.id, c.name, c.slug, c.member_count, c.created_at,
            u.username as creator_username
     FROM communities c
     JOIN users u ON c.created_by = u.id
     ORDER BY c.created_at DESC`,
  );

  res.json(result.rows);
}));

router.get('/reports', verifyToken, checkAdmin, asyncHandler(async (req, res) => {
  const result = await query(
    `SELECT r.id, r.reporter_id, r.reported_user_id, r.post_id, r.comment_id,
            r.reason, r.status, r.created_at,
            u.username as reporter_username,
            ru.username as reported_username
     FROM reports r
     LEFT JOIN users u ON r.reporter_id = u.id
     LEFT JOIN users ru ON r.reported_user_id = ru.id
     ORDER BY r.created_at DESC`,
  );

  res.json(result.rows);
}));

router.get('/moderation-logs', verifyToken, checkAdmin, asyncHandler(async (req, res) => {
  const result = await query(
    `SELECT ml.id, ml.user_id, ml.action, ml.reason, ml.moderator_id, ml.created_at,
            u.username as user_username,
            m.username as moderator_username
     FROM moderation_logs ml
     LEFT JOIN users u ON ml.user_id = u.id
     LEFT JOIN users m ON ml.moderator_id = m.id
     ORDER BY ml.created_at DESC
     LIMIT 100`,
  );

  res.json(result.rows);
}));

router.get('/analytics', verifyToken, checkAdmin, asyncHandler(async (req, res) => {
  const dailyUsersResult = await query(
    `SELECT DATE(created_at) as date, COUNT(*) as count
     FROM users
     WHERE created_at >= NOW() - INTERVAL '30 days'
     GROUP BY DATE(created_at)
     ORDER BY date DESC`,
  );

  const botScoresResult = await query(
    `SELECT 
      COUNT(CASE WHEN bot_score > 0.7 THEN 1 END) as high_bot_score,
      COUNT(CASE WHEN bot_score BETWEEN 0.4 AND 0.7 THEN 1 END) as medium_bot_score,
      COUNT(CASE WHEN bot_score < 0.4 THEN 1 END) as low_bot_score
     FROM users`,
  );

  res.json({
    dailyUsers: dailyUsersResult.rows,
    botScores: botScoresResult.rows[0],
  });
}));

module.exports = router;
