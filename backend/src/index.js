require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const communityRoutes = require('./routes/communities');
const conversationRoutes = require('./routes/conversations');
const postRoutes = require('./routes/posts');
const moderationRoutes = require('./routes/moderation');
const adminRoutes = require('./routes/admin');
const monitoringRoutes = require('./routes/monitoring');
const federationRoutes = require('./routes/federation');
const infrastructureRoutes = require('./routes/infrastructure');
const botRoutes = require('./routes/bots');
const { errorHandler } = require('./middleware/errorHandler');
const { connectDB } = require('./db/connection');
const { initializeEmailService } = require('./services/emailService');
const { initializeCache } = require('./services/cacheService');
const monitoringService = require('./services/monitoringService');
const atprotoService = require('./services/atprotoService');
const cdnService = require('./services/cdnService');
const loadBalancerService = require('./services/loadBalancerService');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(helmet());
app.use(morgan('combined'));
app.use(cors({
  origin: process.env.NODE_ENV === 'production' ? process.env.FRONTEND_URL : '*',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Monitoring middleware
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    const isError = res.statusCode >= 400;
    monitoringService.recordRequest(duration, isError);
  });
  next();
});

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP, please try again later.',
});

app.use('/api/', limiter);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/api/local-ai/status', (req, res) => {
  res.json({ 
    status: 'ok', 
    running: true,
    timestamp: new Date().toISOString() 
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/communities', communityRoutes);
app.use('/api/conversations', conversationRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/moderation', moderationRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/monitoring', monitoringRoutes);
app.use('/api/federation', federationRoutes);
app.use('/api/infrastructure', infrastructureRoutes);
app.use('/api/bots', botRoutes);

app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.use(errorHandler);

const startServer = async () => {
  try {
    await connectDB();
    console.log('✓ Database connected');

    initializeEmailService();
    console.log('✓ Email service initialized');

    await initializeCache();
    console.log('✓ Cache service initialized');

    await atprotoService.initialize();
    console.log('✓ ATProto service initialized');

    await cdnService.initialize();
    console.log('✓ CDN service initialized');

    const servers = (process.env.LOAD_BALANCER_SERVERS || '').split(',').filter(s => s.trim());
    if (servers.length > 0) {
      await loadBalancerService.initialize(servers);
      console.log('✓ Load balancer initialized');
    }

    app.listen(PORT, () => {
      console.log(`✓ Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('✗ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

module.exports = app;
