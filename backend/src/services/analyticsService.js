const { query } = require('../db/connection');

class AnalyticsService {
  async getUserGrowth(days = 30) {
    const result = await query(
      `SELECT DATE(created_at) as date, COUNT(*) as count
       FROM users
       WHERE created_at >= NOW() - INTERVAL '${days} days'
       GROUP BY DATE(created_at)
       ORDER BY date ASC`,
    );
    return result.rows;
  }

  async getPostActivity(days = 30) {
    const result = await query(
      `SELECT DATE(created_at) as date, COUNT(*) as count
       FROM posts
       WHERE created_at >= NOW() - INTERVAL '${days} days'
       GROUP BY DATE(created_at)
       ORDER BY date ASC`,
    );
    return result.rows;
  }

  async getCommunityGrowth(days = 30) {
    const result = await query(
      `SELECT DATE(created_at) as date, COUNT(*) as count
       FROM communities
       WHERE created_at >= NOW() - INTERVAL '${days} days'
       GROUP BY DATE(created_at)
       ORDER BY date ASC`,
    );
    return result.rows;
  }

  async getEngagementMetrics() {
    const postsResult = await query(
      `SELECT AVG(upvotes + downvotes) as avg_engagement
       FROM posts
       WHERE created_at >= NOW() - INTERVAL '7 days'`,
    );

    const commentsResult = await query(
      `SELECT AVG(upvotes + downvotes) as avg_engagement
       FROM comments
       WHERE created_at >= NOW() - INTERVAL '7 days'`,
    );

    return {
      avgPostEngagement: parseFloat(postsResult.rows[0].avg_engagement || 0).toFixed(2),
      avgCommentEngagement: parseFloat(commentsResult.rows[0].avg_engagement || 0).toFixed(2),
    };
  }

  async getModerationStats(days = 30) {
    const result = await query(
      `SELECT action, COUNT(*) as count
       FROM moderation_logs
       WHERE created_at >= NOW() - INTERVAL '${days} days'
       GROUP BY action`,
    );

    const stats = {};
    result.rows.forEach((row) => {
      stats[row.action] = parseInt(row.count);
    });

    return stats;
  }

  async getReportStats(days = 30) {
    const result = await query(
      `SELECT status, COUNT(*) as count
       FROM reports
       WHERE created_at >= NOW() - INTERVAL '${days} days'
       GROUP BY status`,
    );

    const stats = {};
    result.rows.forEach((row) => {
      stats[row.status] = parseInt(row.count);
    });

    return stats;
  }

  async getCommunityStats() {
    const result = await query(
      `SELECT c.id, c.name, COUNT(cm.id) as member_count, COUNT(p.id) as post_count
       FROM communities c
       LEFT JOIN community_members cm ON c.id = cm.community_id
       LEFT JOIN posts p ON c.id = p.community_id
       GROUP BY c.id, c.name
       ORDER BY member_count DESC
       LIMIT 10`,
    );

    return result.rows;
  }

  async getUserStats() {
    const totalResult = await query('SELECT COUNT(*) as count FROM users');
    const verifiedResult = await query('SELECT COUNT(*) as count FROM users WHERE is_verified = TRUE');
    const bannedResult = await query('SELECT COUNT(*) as count FROM users WHERE is_banned = TRUE');

    return {
      total: parseInt(totalResult.rows[0].count),
      verified: parseInt(verifiedResult.rows[0].count),
      banned: parseInt(bannedResult.rows[0].count),
    };
  }

  async getComprehensiveAnalytics(days = 30) {
    const [
      userGrowth,
      postActivity,
      communityGrowth,
      engagement,
      moderation,
      reports,
      topCommunities,
      userStats,
    ] = await Promise.all([
      this.getUserGrowth(days),
      this.getPostActivity(days),
      this.getCommunityGrowth(days),
      this.getEngagementMetrics(),
      this.getModerationStats(days),
      this.getReportStats(days),
      this.getCommunityStats(),
      this.getUserStats(),
    ]);

    return {
      period: `${days} days`,
      userGrowth,
      postActivity,
      communityGrowth,
      engagement,
      moderation,
      reports,
      topCommunities,
      userStats,
    };
  }
}

module.exports = new AnalyticsService();
