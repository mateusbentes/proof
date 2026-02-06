const express = require('express');
const { v4: uuidv4 } = require('uuid');
const Joi = require('joi');
const { query } = require('../db/connection');
const { verifyToken } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');

const router = express.Router();

const communitySchema = Joi.object({
  name: Joi.string().min(3).max(255).required(),
  slug: Joi.string().alphanum().min(3).max(255).required(),
  description: Joi.string().max(1000),
  isPrivate: Joi.boolean().default(false),
});

router.post('/', verifyToken, asyncHandler(async (req, res) => {
  const { error, value } = communitySchema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }

  const { name, slug, description, isPrivate } = value;

  const existingCommunity = await query(
    'SELECT id FROM communities WHERE slug = $1 OR name = $2',
    [slug, name],
  );

  if (existingCommunity.rows.length > 0) {
    return res.status(409).json({ error: 'Community already exists' });
  }

  const communityId = uuidv4();

  await query(
    'INSERT INTO communities (id, name, slug, description, created_by, is_private) VALUES ($1, $2, $3, $4, $5, $6)',
    [communityId, name, slug, description, req.user.userId, isPrivate],
  );

  await query(
    'INSERT INTO community_members (id, community_id, user_id, role) VALUES ($1, $2, $3, $4)',
    [uuidv4(), communityId, req.user.userId, 'admin'],
  );

  res.status(201).json({
    id: communityId,
    name,
    slug,
    description,
    isPrivate,
  });
}));

router.get('/', asyncHandler(async (req, res) => {
  const result = await query(
    'SELECT id, name, slug, description, icon_url, member_count, created_at FROM communities WHERE is_private = FALSE ORDER BY created_at DESC',
  );

  res.json(result.rows);
}));

router.get('/:slug', asyncHandler(async (req, res) => {
  const { slug } = req.params;

  const result = await query(
    'SELECT id, name, slug, description, icon_url, member_count, created_at FROM communities WHERE slug = $1',
    [slug],
  );

  if (result.rows.length === 0) {
    return res.status(404).json({ error: 'Community not found' });
  }

  res.json(result.rows[0]);
}));

router.post('/:communityId/join', verifyToken, asyncHandler(async (req, res) => {
  const { communityId } = req.params;

  const communityResult = await query(
    'SELECT id FROM communities WHERE id = $1',
    [communityId],
  );

  if (communityResult.rows.length === 0) {
    return res.status(404).json({ error: 'Community not found' });
  }

  const existingMember = await query(
    'SELECT id FROM community_members WHERE community_id = $1 AND user_id = $2',
    [communityId, req.user.userId],
  );

  if (existingMember.rows.length > 0) {
    return res.status(409).json({ error: 'Already a member' });
  }

  await query(
    'INSERT INTO community_members (id, community_id, user_id, role) VALUES ($1, $2, $3, $4)',
    [uuidv4(), communityId, req.user.userId, 'member'],
  );

  await query(
    'UPDATE communities SET member_count = member_count + 1 WHERE id = $1',
    [communityId],
  );

  res.json({ message: 'Joined community successfully' });
}));

router.get('/:communityId/members', asyncHandler(async (req, res) => {
  const { communityId } = req.params;

  const result = await query(
    `SELECT u.id, u.username, cm.role, cm.joined_at
     FROM community_members cm
     JOIN users u ON cm.user_id = u.id
     WHERE cm.community_id = $1
     ORDER BY cm.joined_at DESC`,
    [communityId],
  );

  res.json(result.rows);
}));

module.exports = router;
