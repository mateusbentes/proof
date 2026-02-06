const express = require('express');
const cdnService = require('../services/cdnService');
const loadBalancerService = require('../services/loadBalancerService');
const { verifyToken } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');
const { query } = require('../db/connection');

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

// CDN Endpoints

router.get('/cdn/status', verifyToken, checkAdmin, asyncHandler(async (req, res) => {
  const stats = await cdnService.getStats();

  res.json({
    enabled: cdnService.isEnabled(),
    provider: process.env.CDN_PROVIDER || 'cloudflare',
    url: process.env.CDN_URL || 'https://cdn.proof.local',
    stats,
  });
}));

router.post('/cdn/purge', verifyToken, checkAdmin, asyncHandler(async (req, res) => {
  const { paths } = req.body;

  const success = await cdnService.purgeCache(paths || []);

  if (!success) {
    return res.status(500).json({ error: 'Failed to purge CDN cache' });
  }

  res.json({ message: 'CDN cache purged successfully' });
}));

router.post('/cdn/optimize-image', asyncHandler(async (req, res) => {
  const { imageUrl, width, height, quality, format } = req.body;

  if (!imageUrl) {
    return res.status(400).json({ error: 'Image URL is required' });
  }

  const optimizedUrl = cdnService.optimizeImage(imageUrl, {
    width: width || 800,
    height: height || 600,
    quality: quality || 80,
    format: format || 'webp',
  });

  res.json({ optimizedUrl });
}));

// Load Balancer Endpoints

router.get('/load-balancer/status', verifyToken, checkAdmin, asyncHandler(async (req, res) => {
  const stats = loadBalancerService.getStats();

  res.json({
    enabled: loadBalancerService.isEnabled(),
    stats,
  });
}));

router.post('/load-balancer/initialize', verifyToken, checkAdmin, asyncHandler(async (req, res) => {
  const { servers } = req.body;

  if (!servers || !Array.isArray(servers) || servers.length === 0) {
    return res.status(400).json({ error: 'Servers array is required' });
  }

  await loadBalancerService.initialize(servers);

  res.json({
    message: 'Load balancer initialized',
    stats: loadBalancerService.getStats(),
  });
}));

router.post('/load-balancer/health-check', verifyToken, checkAdmin, asyncHandler(async (req, res) => {
  const stats = loadBalancerService.getStats();

  res.json({
    message: 'Health check completed',
    stats,
  });
}));

router.get('/load-balancer/next-server', asyncHandler(async (req, res) => {
  const { strategy = 'round-robin' } = req.query;

  let server;

  switch (strategy) {
    case 'least-connections':
      server = loadBalancerService.getServerByLeastConnections();
      break;
    case 'response-time':
      server = loadBalancerService.getServerByResponseTime();
      break;
    case 'round-robin':
    default:
      server = loadBalancerService.getNextServer();
  }

  if (!server) {
    return res.status(503).json({ error: 'No healthy servers available' });
  }

  res.json({
    server: server.url,
    strategy,
  });
}));

// Infrastructure Stats

router.get('/stats', verifyToken, checkAdmin, asyncHandler(async (req, res) => {
  const cdnStats = await cdnService.getStats();
  const lbStats = loadBalancerService.getStats();

  res.json({
    cdn: {
      enabled: cdnService.isEnabled(),
      stats: cdnStats,
    },
    loadBalancer: {
      enabled: loadBalancerService.isEnabled(),
      stats: lbStats,
    },
  });
}));

module.exports = router;
