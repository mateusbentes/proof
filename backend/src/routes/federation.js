const express = require('express');
const atprotoService = require('../services/atprotoService');
const dataExportService = require('../services/dataExportService');
const { verifyToken } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');
const { query } = require('../db/connection');

const router = express.Router();

// ATProto Federation Endpoints

router.get('/status', asyncHandler(async (req, res) => {
  const isConnected = atprotoService.isConnected();
  const did = atprotoService.getDID();

  res.json({
    atproto: {
      connected: isConnected,
      did,
      url: process.env.ATPROTO_URL || 'https://bsky.social',
    },
  });
}));

router.post('/publish-post', verifyToken, asyncHandler(async (req, res) => {
  const { postId } = req.body;

  const postResult = await query(
    'SELECT p.*, u.username FROM posts p JOIN users u ON p.user_id = u.id WHERE p.id = $1',
    [postId],
  );

  if (postResult.rows.length === 0) {
    return res.status(404).json({ error: 'Post not found' });
  }

  const post = postResult.rows[0];

  if (post.user_id !== req.user.userId) {
    return res.status(403).json({ error: 'Unauthorized' });
  }

  const atprotoResult = await atprotoService.publishPost(
    `${post.title}\n\n${post.content}`,
    {
      tags: ['proof', 'community'],
      proof_post_id: postId,
    },
  );

  if (!atprotoResult) {
    return res.status(500).json({ error: 'Failed to publish to ATProto' });
  }

  // Store ATProto URI
  await query(
    'UPDATE posts SET atproto_uri = $1 WHERE id = $2',
    [atprotoResult.uri, postId],
  );

  res.json({
    message: 'Post published to ATProto',
    atprotoUri: atprotoResult.uri,
  });
}));

router.post('/sync-profile', verifyToken, asyncHandler(async (req, res) => {
  const userResult = await query(
    'SELECT u.username, up.display_name, up.bio, up.avatar_url FROM users u LEFT JOIN user_profiles up ON u.id = up.user_id WHERE u.id = $1',
    [req.user.userId],
  );

  if (userResult.rows.length === 0) {
    return res.status(404).json({ error: 'User not found' });
  }

  const user = userResult.rows[0];

  const atprotoResult = await atprotoService.publishProfile(
    user.display_name || user.username,
    user.bio || '',
    user.avatar_url || '',
  );

  if (!atprotoResult) {
    return res.status(500).json({ error: 'Failed to sync profile to ATProto' });
  }

  res.json({
    message: 'Profile synced to ATProto',
    atprotoUri: atprotoResult.uri,
  });
}));

// Data Export Endpoints

router.get('/export/user', verifyToken, asyncHandler(async (req, res) => {
  const { format = 'json' } = req.query;

  if (format === 'json') {
    const data = await dataExportService.exportUserDataAsJSON(req.user.userId);
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', 'attachment; filename="user-data.json"');
    res.send(data);
  } else if (format === 'csv') {
    const data = await dataExportService.exportUserDataAsCSV(req.user.userId);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="user-data.csv"');
    res.send(data);
  } else {
    res.status(400).json({ error: 'Invalid format. Use json or csv.' });
  }
}));

router.get('/export/community/:communityId', verifyToken, asyncHandler(async (req, res) => {
  const { communityId } = req.params;
  const { format = 'json' } = req.query;

  // Check if user is admin of community
  const memberResult = await query(
    'SELECT role FROM community_members WHERE community_id = $1 AND user_id = $2',
    [communityId, req.user.userId],
  );

  if (memberResult.rows.length === 0 || memberResult.rows[0].role !== 'admin') {
    return res.status(403).json({ error: 'Only community admins can export data' });
  }

  const data = await dataExportService.exportCommunityData(communityId);

  if (format === 'json') {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="community-${communityId}.json"`);
    res.send(JSON.stringify(data, null, 2));
  } else {
    res.status(400).json({ error: 'CSV export not available for communities' });
  }
}));

router.get('/export/database', verifyToken, asyncHandler(async (req, res) => {
  // Check if user is admin
  const userResult = await query(
    'SELECT role FROM users WHERE id = $1',
    [req.user.userId],
  );

  if (!userResult.rows[0] || userResult.rows[0].role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }

  const data = await dataExportService.exportFullDatabase();

  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Disposition', 'attachment; filename="proof-database.json"');
  res.send(JSON.stringify(data, null, 2));
}));

// Data Deletion Endpoints

router.delete('/delete-account', verifyToken, asyncHandler(async (req, res) => {
  const { password } = req.body;

  if (!password) {
    return res.status(400).json({ error: 'Password required for account deletion' });
  }

  // Verify password
  const userResult = await query(
    'SELECT password_hash FROM users WHERE id = $1',
    [req.user.userId],
  );

  const bcrypt = require('bcryptjs');
  const passwordMatch = await bcrypt.compare(password, userResult.rows[0].password_hash);

  if (!passwordMatch) {
    return res.status(401).json({ error: 'Invalid password' });
  }

  // Delete user data
  await dataExportService.deleteUserData(req.user.userId);

  res.json({ message: 'Account and all associated data deleted successfully' });
}));

module.exports = router;
