const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { query } = require('../db/connection');
const { verifyToken } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');

const router = express.Router();

router.get('/:userId', asyncHandler(async (req, res) => {
  const { userId } = req.params;

  const userResult = await query(
    'SELECT id, username, email, is_verified, created_at FROM users WHERE id = $1',
    [userId],
  );

  if (userResult.rows.length === 0) {
    return res.status(404).json({ error: 'User not found' });
  }

  const profileResult = await query(
    'SELECT display_name, bio, avatar_url, location, website FROM user_profiles WHERE user_id = $1',
    [userId],
  );

  const user = userResult.rows[0];
  const profile = profileResult.rows[0] || {};

  res.json({
    ...user,
    profile,
  });
}));

router.put('/:userId/profile', verifyToken, asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { displayName, bio, location, website, avatarPrompt } = req.body;

  if (req.user.userId !== userId) {
    return res.status(403).json({ error: 'Unauthorized' });
  }

  const existingProfile = await query(
    'SELECT id FROM user_profiles WHERE user_id = $1',
    [userId],
  );

  if (existingProfile.rows.length === 0) {
    const profileId = uuidv4();
    await query(
      'INSERT INTO user_profiles (id, user_id, display_name, bio, location, website, avatar_prompt) VALUES ($1, $2, $3, $4, $5, $6, $7)',
      [profileId, userId, displayName, bio, location, website, avatarPrompt],
    );
  } else {
    await query(
      'UPDATE user_profiles SET display_name = $1, bio = $2, location = $3, website = $4, avatar_prompt = $5, updated_at = CURRENT_TIMESTAMP WHERE user_id = $6',
      [displayName, bio, location, website, avatarPrompt, userId],
    );
  }

  res.json({ message: 'Profile updated successfully' });
}));

router.post('/:userId/avatar', verifyToken, asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { prompt } = req.body;

  if (req.user.userId !== userId) {
    return res.status(403).json({ error: 'Unauthorized' });
  }

  if (!prompt) {
    return res.status(400).json({ error: 'Avatar prompt is required' });
  }

  try {
    const avatarUrl = await generateAvatar(prompt);

    await query(
      'UPDATE user_profiles SET avatar_url = $1, avatar_prompt = $2, updated_at = CURRENT_TIMESTAMP WHERE user_id = $3',
      [avatarUrl, prompt, userId],
    );

    res.json({
      message: 'Avatar generated successfully',
      avatarUrl,
    });
  } catch (error) {
    console.error('Avatar generation failed:', error);
    res.status(500).json({ error: 'Failed to generate avatar' });
  }
}));

async function generateAvatar(prompt) {
  const apiKey = process.env.HUGGINGFACE_API_KEY;
  if (!apiKey) {
    return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(prompt)}`;
  }

  try {
    const response = await fetch(
      'https://api-inference.huggingface.co/models/runwayml/stable-diffusion-v1-5',
      {
        headers: { Authorization: `Bearer ${apiKey}` },
        method: 'POST',
        body: JSON.stringify({ inputs: prompt }),
      },
    );

    if (!response.ok) {
      throw new Error('Avatar generation failed');
    }

    const blob = await response.blob();
    const base64 = await blob.text();
    return `data:image/png;base64,${base64}`;
  } catch (error) {
    console.warn('Stable Diffusion unavailable, using fallback');
    return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(prompt)}`;
  }
}

module.exports = router;
