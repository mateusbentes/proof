const express = require('express');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const Joi = require('joi');
const { query } = require('../db/connection');
const { generateToken, verifyToken } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');

const router = express.Router();

const registerSchema = Joi.object({
  username: Joi.string().alphanum().min(3).max(30).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

router.post('/register', asyncHandler(async (req, res) => {
  const { error, value } = registerSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }

  const { username, email, password } = value;

  const existingUser = await query(
    'SELECT id FROM users WHERE email = $1 OR username = $2',
    [email, username],
  );

  if (existingUser.rows.length > 0) {
    return res.status(409).json({ error: 'User already exists' });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const userId = uuidv4();

  await query(
    'INSERT INTO users (id, username, email, password_hash) VALUES ($1, $2, $3, $4)',
    [userId, username, email, passwordHash],
  );

  const sessionId = uuidv4();
  await query(
    'INSERT INTO conversations (user_id, session_id, status) VALUES ($1, $2, $3)',
    [userId, sessionId, 'active'],
  );

  const token = generateToken(userId, username);

  res.status(201).json({
    message: 'User registered successfully',
    token,
    user: {
      id: userId,
      username,
      email,
    },
    sessionId,
  });
}));

router.post('/login', asyncHandler(async (req, res) => {
  const { error, value } = loginSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }

  const { email, password } = value;

  const result = await query(
    'SELECT id, username, password_hash, is_verified, is_banned FROM users WHERE email = $1',
    [email],
  );

  if (result.rows.length === 0) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const user = result.rows[0];

  if (user.is_banned) {
    return res.status(403).json({ error: 'User is banned' });
  }

  const passwordMatch = await bcrypt.compare(password, user.password_hash);
  if (!passwordMatch) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const token = generateToken(user.id, user.username);

  res.json({
    token,
    user: {
      id: user.id,
      username: user.username,
      email,
      isVerified: user.is_verified,
    },
  });
}));

router.post('/logout', verifyToken, asyncHandler(async (req, res) => {
  res.json({ message: 'Logged out successfully' });
}));

router.get('/me', verifyToken, asyncHandler(async (req, res) => {
  const result = await query(
    'SELECT id, username, email, is_verified FROM users WHERE id = $1',
    [req.user.userId],
  );

  if (result.rows.length === 0) {
    return res.status(404).json({ error: 'User not found' });
  }

  res.json(result.rows[0]);
}));

module.exports = router;
