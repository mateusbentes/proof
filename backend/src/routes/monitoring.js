const express = require('express');
const monitoringService = require('../services/monitoringService');
const analyticsService = require('../services/analyticsService');
const { verifyToken } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');

const router = express.Router();

const checkAdmin = asyncHandler(async (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ error: 'Admin access required' });
  }
});

router.get('/health', asyncHandler(async (req, res) => {
  const health = await monitoringService.getHealthStatus();
  res.json(health);
}));

router.get('/metrics', verifyToken, checkAdmin, asyncHandler(async (req, res) => {
  const metrics = monitoringService.getMetrics();
  res.json(metrics);
}));

router.get('/analytics', verifyToken, checkAdmin, asyncHandler(async (req, res) => {
  const { days = 30 } = req.query;
  const analytics = await analyticsService.getComprehensiveAnalytics(parseInt(days));
  res.json(analytics);
}));

router.get('/analytics/user-growth', verifyToken, checkAdmin, asyncHandler(async (req, res) => {
  const { days = 30 } = req.query;
  const data = await analyticsService.getUserGrowth(parseInt(days));
  res.json(data);
}));

router.get('/analytics/post-activity', verifyToken, checkAdmin, asyncHandler(async (req, res) => {
  const { days = 30 } = req.query;
  const data = await analyticsService.getPostActivity(parseInt(days));
  res.json(data);
}));

router.get('/analytics/community-growth', verifyToken, checkAdmin, asyncHandler(async (req, res) => {
  const { days = 30 } = req.query;
  const data = await analyticsService.getCommunityGrowth(parseInt(days));
  res.json(data);
}));

router.get('/analytics/engagement', verifyToken, checkAdmin, asyncHandler(async (req, res) => {
  const data = await analyticsService.getEngagementMetrics();
  res.json(data);
}));

router.get('/analytics/moderation', verifyToken, checkAdmin, asyncHandler(async (req, res) => {
  const { days = 30 } = req.query;
  const data = await analyticsService.getModerationStats(parseInt(days));
  res.json(data);
}));

router.get('/analytics/reports', verifyToken, checkAdmin, asyncHandler(async (req, res) => {
  const { days = 30 } = req.query;
  const data = await analyticsService.getReportStats(parseInt(days));
  res.json(data);
}));

router.get('/analytics/communities', verifyToken, checkAdmin, asyncHandler(async (req, res) => {
  const data = await analyticsService.getCommunityStats();
  res.json(data);
}));

router.get('/analytics/users', verifyToken, checkAdmin, asyncHandler(async (req, res) => {
  const data = await analyticsService.getUserStats();
  res.json(data);
}));

module.exports = router;
