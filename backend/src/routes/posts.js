const express = require('express');
const { v4: uuidv4 } = require('uuid');
const Joi = require('joi');
const { query } = require('../db/connection');
const { verifyToken } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');

const router = express.Router();

const postSchema = Joi.object({
  communityId: Joi.string().uuid().required(),
  title: Joi.string().min(5).max(500).required(),
  content: Joi.string().min(10).max(5000).required(),
});

const commentSchema = Joi.object({
  content: Joi.string().min(1).max(2000).required(),
});

router.post('/', verifyToken, asyncHandler(async (req, res) => {
  const { error, value } = postSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }

  const { communityId, title, content } = value;

  const communityResult = await query(
    'SELECT id FROM communities WHERE id = $1',
    [communityId],
  );

  if (communityResult.rows.length === 0) {
    return res.status(404).json({ error: 'Community not found' });
  }

  const postId = uuidv4();

  await query(
    'INSERT INTO posts (id, community_id, user_id, title, content) VALUES ($1, $2, $3, $4, $5)',
    [postId, communityId, req.user.userId, title, content],
  );

  res.status(201).json({
    id: postId,
    communityId,
    userId: req.user.userId,
    title,
    content,
    upvotes: 0,
    downvotes: 0,
    createdAt: new Date().toISOString(),
  });
}));

router.get('/community/:communityId', asyncHandler(async (req, res) => {
  const { communityId } = req.params;

  const result = await query(
    `SELECT p.id, p.title, p.content, p.upvotes, p.downvotes, p.created_at,
            u.id as user_id, u.username
     FROM posts p
     JOIN users u ON p.user_id = u.id
     WHERE p.community_id = $1
     ORDER BY p.created_at DESC`,
    [communityId],
  );

  res.json(result.rows);
}));

router.get('/:postId', asyncHandler(async (req, res) => {
  const { postId } = req.params;

  const postResult = await query(
    `SELECT p.id, p.title, p.content, p.upvotes, p.downvotes, p.created_at,
            u.id as user_id, u.username
     FROM posts p
     JOIN users u ON p.user_id = u.id
     WHERE p.id = $1`,
    [postId],
  );

  if (postResult.rows.length === 0) {
    return res.status(404).json({ error: 'Post not found' });
  }

  const post = postResult.rows[0];

  const commentsResult = await query(
    `SELECT c.id, c.content, c.upvotes, c.downvotes, c.created_at,
            u.id as user_id, u.username
     FROM comments c
     JOIN users u ON c.user_id = u.id
     WHERE c.post_id = $1
     ORDER BY c.created_at ASC`,
    [postId],
  );

  res.json({
    ...post,
    comments: commentsResult.rows,
  });
}));

router.post('/:postId/comments', verifyToken, asyncHandler(async (req, res) => {
  const { postId } = req.params;
  const { error, value } = commentSchema.validate(req.body);

  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }

  const postResult = await query(
    'SELECT id FROM posts WHERE id = $1',
    [postId],
  );

  if (postResult.rows.length === 0) {
    return res.status(404).json({ error: 'Post not found' });
  }

  const commentId = uuidv4();

  await query(
    'INSERT INTO comments (id, post_id, user_id, content) VALUES ($1, $2, $3, $4)',
    [commentId, postId, req.user.userId, value.content],
  );

  res.status(201).json({
    id: commentId,
    postId,
    userId: req.user.userId,
    content: value.content,
    upvotes: 0,
    downvotes: 0,
    createdAt: new Date().toISOString(),
  });
}));

router.post('/:postId/upvote', verifyToken, asyncHandler(async (req, res) => {
  const { postId } = req.params;

  await query(
    'UPDATE posts SET upvotes = upvotes + 1 WHERE id = $1',
    [postId],
  );

  const result = await query(
    'SELECT upvotes, downvotes FROM posts WHERE id = $1',
    [postId],
  );

  res.json(result.rows[0]);
}));

router.post('/:postId/downvote', verifyToken, asyncHandler(async (req, res) => {
  const { postId } = req.params;

  await query(
    'UPDATE posts SET downvotes = downvotes + 1 WHERE id = $1',
    [postId],
  );

  const result = await query(
    'SELECT upvotes, downvotes FROM posts WHERE id = $1',
    [postId],
  );

  res.json(result.rows[0]);
}));

router.delete('/:postId', verifyToken, asyncHandler(async (req, res) => {
  const { postId } = req.params;

  const postResult = await query(
    'SELECT user_id FROM posts WHERE id = $1',
    [postId],
  );

  if (postResult.rows.length === 0) {
    return res.status(404).json({ error: 'Post not found' });
  }

  if (postResult.rows[0].user_id !== req.user.userId) {
    return res.status(403).json({ error: 'Unauthorized' });
  }

  await query('DELETE FROM comments WHERE post_id = $1', [postId]);
  await query('DELETE FROM posts WHERE id = $1', [postId]);

  res.json({ message: 'Post deleted successfully' });
}));

module.exports = router;
