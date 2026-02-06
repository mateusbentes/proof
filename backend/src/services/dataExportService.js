const { query } = require('../db/connection');
const fs = require('fs').promises;
const path = require('path');
const { createWriteStream } = require('fs');

class DataExportService {
  async exportUserData(userId) {
    try {
      const userData = {};

      // Get user info
      const userResult = await query(
        'SELECT id, username, email, created_at FROM users WHERE id = $1',
        [userId],
      );
      userData.user = userResult.rows[0];

      // Get user profile
      const profileResult = await query(
        'SELECT * FROM user_profiles WHERE user_id = $1',
        [userId],
      );
      userData.profile = profileResult.rows[0];

      // Get communities
      const communitiesResult = await query(
        `SELECT c.* FROM communities c
         JOIN community_members cm ON c.id = cm.community_id
         WHERE cm.user_id = $1`,
        [userId],
      );
      userData.communities = communitiesResult.rows;

      // Get posts
      const postsResult = await query(
        'SELECT * FROM posts WHERE user_id = $1 ORDER BY created_at DESC',
        [userId],
      );
      userData.posts = postsResult.rows;

      // Get comments
      const commentsResult = await query(
        'SELECT * FROM comments WHERE user_id = $1 ORDER BY created_at DESC',
        [userId],
      );
      userData.comments = commentsResult.rows;

      // Get reports made
      const reportsResult = await query(
        'SELECT * FROM reports WHERE reporter_id = $1 ORDER BY created_at DESC',
        [userId],
      );
      userData.reports = reportsResult.rows;

      // Get moderation logs
      const logsResult = await query(
        'SELECT * FROM moderation_logs WHERE user_id = $1 ORDER BY created_at DESC',
        [userId],
      );
      userData.moderationLogs = logsResult.rows;

      return userData;
    } catch (error) {
      console.error('Failed to export user data:', error);
      throw error;
    }
  }

  async exportUserDataAsJSON(userId) {
    const userData = await this.exportUserData(userId);
    return JSON.stringify(userData, null, 2);
  }

  async exportUserDataAsCSV(userId) {
    const userData = await this.exportUserData(userId);
    let csv = '';

    // User info
    csv += 'User Information\n';
    csv += `ID,Username,Email,Created At\n`;
    const user = userData.user;
    csv += `${user.id},${user.username},${user.email},${user.created_at}\n\n`;

    // Posts
    csv += 'Posts\n';
    csv += `ID,Title,Content,Upvotes,Downvotes,Created At\n`;
    userData.posts.forEach((post) => {
      csv += `${post.id},"${post.title}","${post.content}",${post.upvotes},${post.downvotes},${post.created_at}\n`;
    });
    csv += '\n';

    // Comments
    csv += 'Comments\n';
    csv += `ID,Content,Upvotes,Downvotes,Created At\n`;
    userData.comments.forEach((comment) => {
      csv += `${comment.id},"${comment.content}",${comment.upvotes},${comment.downvotes},${comment.created_at}\n`;
    });

    return csv;
  }

  async exportCommunityData(communityId) {
    try {
      const communityData = {};

      // Get community info
      const communityResult = await query(
        'SELECT * FROM communities WHERE id = $1',
        [communityId],
      );
      communityData.community = communityResult.rows[0];

      // Get members
      const membersResult = await query(
        `SELECT u.id, u.username, cm.role, cm.joined_at
         FROM community_members cm
         JOIN users u ON cm.user_id = u.id
         WHERE cm.community_id = $1`,
        [communityId],
      );
      communityData.members = membersResult.rows;

      // Get posts
      const postsResult = await query(
        'SELECT * FROM posts WHERE community_id = $1 ORDER BY created_at DESC',
        [communityId],
      );
      communityData.posts = postsResult.rows;

      // Get comments
      const commentsResult = await query(
        `SELECT c.* FROM comments c
         JOIN posts p ON c.post_id = p.id
         WHERE p.community_id = $1
         ORDER BY c.created_at DESC`,
        [communityId],
      );
      communityData.comments = commentsResult.rows;

      return communityData;
    } catch (error) {
      console.error('Failed to export community data:', error);
      throw error;
    }
  }

  async exportFullDatabase() {
    try {
      const dbData = {};

      // Get all users
      const usersResult = await query('SELECT id, username, email, created_at FROM users');
      dbData.users = usersResult.rows;

      // Get all communities
      const communitiesResult = await query('SELECT * FROM communities');
      dbData.communities = communitiesResult.rows;

      // Get all posts
      const postsResult = await query('SELECT * FROM posts');
      dbData.posts = postsResult.rows;

      // Get all comments
      const commentsResult = await query('SELECT * FROM comments');
      dbData.comments = commentsResult.rows;

      // Get statistics
      dbData.statistics = {
        totalUsers: usersResult.rows.length,
        totalCommunities: communitiesResult.rows.length,
        totalPosts: postsResult.rows.length,
        totalComments: commentsResult.rows.length,
        exportDate: new Date().toISOString(),
      };

      return dbData;
    } catch (error) {
      console.error('Failed to export database:', error);
      throw error;
    }
  }

  async deleteUserData(userId) {
    try {
      // Delete user's posts and comments
      await query('DELETE FROM comments WHERE user_id IN (SELECT id FROM posts WHERE user_id = $1)', [userId]);
      await query('DELETE FROM posts WHERE user_id = $1', [userId]);

      // Delete user's reports
      await query('DELETE FROM reports WHERE reporter_id = $1', [userId]);

      // Remove from communities
      await query('DELETE FROM community_members WHERE user_id = $1', [userId]);

      // Delete user profile
      await query('DELETE FROM user_profiles WHERE user_id = $1', [userId]);

      // Delete user
      await query('DELETE FROM users WHERE id = $1', [userId]);

      return { success: true, message: 'User data deleted successfully' };
    } catch (error) {
      console.error('Failed to delete user data:', error);
      throw error;
    }
  }
}

module.exports = new DataExportService();
