const Community = require('../models/Community');
const Post = require('../models/Post');
const User = require('../models/User');
const authService = require('./authService');

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
  const user = await User.findById(userId);
  if (!user) {
    return formatChatResponse('error', 'User not found. Please log in.');
  }

  switch (command) {
    case 'communities':
      const communities = await Community.find({}).limit(10);
      const communityList = communities.map(c => `• ${c.name} (${c.memberCount || 0} members)`).join('\n');
      return formatChatResponse('info', `**Available Communities:**\n${communityList}\n\nUse /join &lt;communityId&gt; to join.`);

    case 'join':
      if (!args) {
        return formatChatResponse('error', 'Usage: /join &lt;communityId&gt;');
      }
      const community = await Community.findById(args);
      if (!community) {
        return formatChatResponse('error', 'Community not found.');
      }
      if (!community.members.includes(userId)) {
        community.members.push(userId);
        community.memberCount = community.members.length;
        await community.save();
        return formatChatResponse('success', `✅ Joined **${community.name}**!`);
      }
      return formatChatResponse('info', `Already a member of **${community.name}**.`);

    case 'posts':
      const posts = await Post.find({}).sort({ createdAt: -1 }).limit(5);
      const postList = posts.map(p => `📝 ${p.title}\n   By: ${p.author?.name || 'Unknown'}\n`).join('\n');
      return formatChatResponse('info', `**Recent Posts:**\n${postList || 'No posts yet.'}\n\nUse /create post &lt;title&gt; | &lt;content&gt;`);

    case 'create':
      if (!args.includes('|')) {
        return formatChatResponse('error', 'Usage: /create post &lt;title&gt; | &lt;content&gt;');
      }
      const [title, content] = args.split('|').map(s => s.trim());
      const newPost = new Post({
        title,
        content,
        author: userId
      });
      await newPost.save();
      return formatChatResponse('success', `✅ Post created!\n**${title}**\n${content}`);

    case 'profile':
      return formatChatResponse('info', `**Your Profile:**\n👤 ${user.name}\n📧 ${user.email}\n📊 Posts: ${await Post.countDocuments({ author: userId })}`);

    case 'settings':
      return formatChatResponse('info', `**Settings:**\n\nAvailable commands:\n/settings notifications\n/settings privacy\n/settings account`);

    case 'chat':
      return formatChatResponse('info', `💬 Chat activated! Type your message or use /help for commands.`);

    case 'logout':
      return formatChatResponse('success', `👋 Logged out successfully!`, { action: 'logout' });

    case 'help':
    default:
      return formatChatResponse('info', `**Available Commands:**\n/communties - List communities\n/join &lt;id&gt; - Join community\n/posts - Recent posts\n/create post &lt;title&gt;|&lt;content&gt; - Create post\n/profile - Your profile\n/settings - Settings\n/chat - Start chat\n/logout - Logout`);
  }
};

module.exports = { parseCommand, executeCommand, formatChatResponse };
