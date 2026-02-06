const { query } = require('../db/connection');

class MonitoringService {
  constructor() {
    this.metrics = {
      requests: 0,
      errors: 0,
      avgResponseTime: 0,
      startTime: Date.now(),
    };
  }

  recordRequest(duration, isError = false) {
    this.metrics.requests += 1;
    if (isError) {
      this.metrics.errors += 1;
    }
    this.updateAvgResponseTime(duration);
  }

  updateAvgResponseTime(duration) {
    const totalTime = this.metrics.avgResponseTime * (this.metrics.requests - 1) + duration;
    this.metrics.avgResponseTime = totalTime / this.metrics.requests;
  }

  getMetrics() {
    const uptime = Date.now() - this.metrics.startTime;
    const errorRate = this.metrics.requests > 0
      ? (this.metrics.errors / this.metrics.requests) * 100
      : 0;

    return {
      requests: this.metrics.requests,
      errors: this.metrics.errors,
      errorRate: errorRate.toFixed(2),
      avgResponseTime: this.metrics.avgResponseTime.toFixed(2),
      uptime: Math.floor(uptime / 1000),
    };
  }

  async getDatabaseMetrics() {
    try {
      const usersResult = await query('SELECT COUNT(*) as count FROM users');
      const postsResult = await query('SELECT COUNT(*) as count FROM posts');
      const commentsResult = await query('SELECT COUNT(*) as count FROM comments');
      const reportsResult = await query('SELECT COUNT(*) as count FROM reports');

      return {
        users: parseInt(usersResult.rows[0].count),
        posts: parseInt(postsResult.rows[0].count),
        comments: parseInt(commentsResult.rows[0].count),
        reports: parseInt(reportsResult.rows[0].count),
      };
    } catch (error) {
      console.error('Failed to get database metrics:', error);
      return null;
    }
  }

  async getHealthStatus() {
    const appMetrics = this.getMetrics();
    const dbMetrics = await this.getDatabaseMetrics();

    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      app: appMetrics,
      database: dbMetrics,
    };
  }
}

module.exports = new MonitoringService();
