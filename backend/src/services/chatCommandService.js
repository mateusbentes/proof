const { query } = require('../db/connection');
const { v4: uuidv4 } = require('uuid');

const parseCommand = (message) => {
  const match = message.match(/^\/(\w+)(?:\s+(.+))?$/);
  if (!match) return null;
  return {
    command: match[1],
    args: match[2] ? match[2].trim() : ''
  };
};

const formatChatResponse = (type, content, data = {}) => ({
  type,
  content,
  timestamp: new Date().toISOString(),
  ...data
});

const executeCommand = async (command, args, userId) => {
  try {
    const userResult = await query('SELECT id, username, email FROM users WHERE id = $1', [userId]);
    if (userResult.rowCount === 0) {
      return formatChatResponse('error', 'User not found. Please log in.');
    }
    const user = userResult.rows[0];

    switch (command) {
      case 'communities':
        const communitiesResult = await query('SELECT id, name, member_count FROM communities LIMIT 10');
        const communityList = communitiesResult.rows.map(c => `• ${c.name} (${c.member_count || 0} members)`).join('\n');
        return formatChatResponse('info', `**Available Communities:**\n${communityList}\n\nUse /join <communityId> to join.`);

      case 'join':
        if (!args) {
          return formatChatResponse('error', 'Usage: /join <communityId>');
        }
        const communityResult = await query('SELECT id, name FROM communities WHERE id = $1', [args]);
        if (communityResult.rowCount === 0) {
          return formatChatResponse('error', 'Community not found.');
        }
        const community = communityResult.rows[0];
        
        const memberCheck = await query(
          'SELECT 1 FROM community_members WHERE community_id = $1 AND user_id = $2',
          [community.id, userId]
        );
        
        if (memberCheck.rowCount === 0) {
          await query(
            'INSERT INTO community_members (community_id, user_id, role) VALUES ($1, $2, $3)',
            [community.id, userId, 'member']
          );
          return formatChatResponse('success', `✅ Joined **${community.name}**!`);
        }
        return formatChatResponse('info', `Already a member of **${community.name}**.`);

      case 'posts':
        const postsResult = await query(
          'SELECT id, title, content, created_by FROM posts ORDER BY created_at DESC LIMIT 5'
        );
        const postList = postsResult.rows.map(p => `📝 ${p.title}\n   By: ${p.created_by || 'Unknown'}\n`).join('\n');
        return formatChatResponse('info', `**Recent Posts:**\n${postList || 'No posts yet.'}\n\nUse /create post <title> | <content>`);

      case 'create':
        if (!args.includes('|')) {
          return formatChatResponse('error', 'Usage: /create post <title> | <content>');
        }
        const [title, content] = args.split('|').map(s => s.trim());
        const postId = uuidv4();
        await query(
          'INSERT INTO posts (id, title, content, created_by) VALUES ($1, $2, $3, $4)',
          [postId, title, content, userId]
        );
        return formatChatResponse('success', `✅ Post created!\n**${title}**\n${content}`);

      case 'profile':
        const postCount = await query('SELECT COUNT(*) as count FROM posts WHERE created_by = $1', [userId]);
        return formatChatResponse('info', `**Your Profile:**\n👤 ${user.username}\n📧 ${user.email}\n📊 Posts: ${postCount.rows[0].count}`);

      case 'settings':
        return formatChatResponse('info', `**Settings:**\n\nAvailable commands:\n/settings notifications\n/settings privacy\n/settings account`);

      case 'chat':
        return formatChatResponse('info', `💬 Chat activated! Type your message or use /help for commands.`);

      case 'logout':
        return formatChatResponse('success', `👋 Logged out successfully!`, { action: 'logout' });

      case 'help':
      default:
        return formatChatResponse('info', `**Available Commands:**\n/communities - List communities\n/join <id> - Join community\n/posts - Recent posts\n/create post <title>|<content> - Create post\n/profile - Your profile\n/settings - Settings\n/chat - Start chat\n/logout - Logout`);
    }
  } catch (error) {
    console.error('Command execution error:', error);
    return formatChatResponse('error', 'An error occurred while executing the command.');
  }
};

module.exports = { parseCommand, executeCommand, formatChatResponse };
