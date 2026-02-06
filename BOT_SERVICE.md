# Bot Service Documentation

Complete bot management system for Proof platform. Allows admins to create, manage, and control bot accounts for testing and community engagement.

## Features

### 1. Bot Account Creation
- Automated account registration
- Conversational authentication completion
- Profile setup with custom avatar
- Email and password management

### 2. Bot Login & Authentication
- Automated login
- Token generation
- Session management

### 3. Bot Profile Management
- Update display name
- Update bio
- Update location
- Update website
- Avatar generation

### 4. Bot Community Interaction
- Join communities
- Create posts
- Create comments
- Upvote posts
- Downvote posts

### 5. Bot Account Management
- Delete bot accounts
- List all bot accounts
- Simulate bot activity

## API Endpoints

### Bot Management (Admin Only)

#### Create Bot Account
```
POST /api/bots/create
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "username": "bot_username",
  "email": "bot@proof.local",
  "password": "secure_password",
  "displayName": "Bot Display Name",
  "bio": "I am a bot",
  "avatarPrompt": "A robot avatar"
}
```

Response:
```json
{
  "message": "Bot account created successfully",
  "bot": {
    "userId": "uuid",
    "username": "bot_username",
    "email": "bot@proof.local",
    "token": "jwt_token"
  }
}
```

#### Login Bot
```
POST /api/bots/login
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "username": "bot_username",
  "password": "secure_password"
}
```

#### Update Bot Profile
```
PUT /api/bots/:botId/profile
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "token": "bot_jwt_token",
  "displayName": "New Name",
  "bio": "Updated bio",
  "location": "Earth",
  "website": "https://example.com"
}
```

#### Create Bot Post
```
POST /api/bots/:botId/posts
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "token": "bot_jwt_token",
  "communityId": "community_uuid",
  "title": "Post Title",
  "content": "Post content here"
}
```

#### Create Bot Comment
```
POST /api/bots/:botId/comments
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "token": "bot_jwt_token",
  "postId": "post_uuid",
  "content": "Comment content"
}
```

#### Join Community
```
POST /api/bots/:botId/communities/:communityId/join
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "token": "bot_jwt_token"
}
```

#### Upvote Post
```
POST /api/bots/:botId/posts/:postId/upvote
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "token": "bot_jwt_token"
}
```

#### Delete Bot Account
```
DELETE /api/bots/:botId
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "token": "bot_jwt_token",
  "password": "bot_password"
}
```

#### List All Bots
```
GET /api/bots/list
Authorization: Bearer <admin_token>
```

Response:
```json
{
  "count": 5,
  "bots": [
    {
      "userId": "uuid",
      "username": "bot_1",
      "email": "bot1@proof.local",
      "createdAt": "2026-02-06T18:00:00Z"
    }
  ]
}
```

#### Simulate Bot Activity
```
POST /api/bots/simulate
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "botConfig": {
    "username": "activity_bot",
    "email": "activity@proof.local",
    "password": "secure_password",
    "displayName": "Activity Bot",
    "bio": "Testing bot",
    "avatarPrompt": "A testing robot"
  },
  "activityConfig": {
    "communities": ["community_uuid_1", "community_uuid_2"],
    "posts": [
      {
        "communityId": "community_uuid_1",
        "title": "Test Post",
        "content": "This is a test post"
      }
    ],
    "comments": [
      {
        "postId": "post_uuid",
        "content": "Great post!"
      }
    ]
  }
}
```

## Bot Service Methods

### JavaScript/Node.js Usage

```javascript
const botService = require('./services/botService');

// Create bot account
const bot = await botService.createBotAccount({
  username: 'test_bot',
  email: 'test@bot.local',
  password: 'password123',
  displayName: 'Test Bot',
  bio: 'A test bot',
  avatarPrompt: 'A robot'
});

// Login bot
const { token, user } = await botService.loginBot('test_bot', 'password123');

// Update profile
await botService.updateBotProfile(bot.userId, bot.token, {
  displayName: 'Updated Bot',
  bio: 'Updated bio'
});

// Create post
await botService.createBotPost(bot.userId, bot.token, communityId, {
  title: 'Bot Post',
  content: 'Content here'
});

// Create comment
await botService.createBotComment(bot.userId, bot.token, postId, 'Great post!');

// Join community
await botService.joinBotCommunity(bot.userId, bot.token, communityId);

// Upvote post
await botService.upvotePost(bot.userId, bot.token, postId);

// Delete account
await botService.deleteBotAccount(bot.userId, bot.token, 'password123');

// Get all bots
const allBots = botService.getAllBotAccounts();

// Simulate activity
await botService.simulateBotActivity(botConfig, activityConfig);
```

## Use Cases

### 1. Testing
- Create test bots to verify community features
- Test post/comment creation
- Test moderation workflows

### 2. Community Engagement
- Seed communities with initial content
- Create discussion starters
- Demonstrate platform features

### 3. Load Testing
- Create multiple bots for stress testing
- Simulate user activity
- Test scalability

### 4. Development
- Test authentication flows
- Verify API endpoints
- Test bot detection algorithms

## Security Considerations

- **Admin Only:** All bot operations require admin authentication
- **Password Protection:** Bot deletion requires password verification
- **Token Management:** Each bot has its own JWT token
- **Activity Logging:** All bot actions are logged
- **Rate Limiting:** Bot requests are subject to rate limits

## Bot Detection

Bots created through this service are marked with:
- Email domain: `@bot.proof.local`
- Conversational auth responses: Pre-defined, authentic responses
- Bot score: Calculated during auth (should be low for legitimate bots)

## Example Workflow

```javascript
// 1. Create bot
const bot = await botService.createBotAccount({
  username: 'community_bot',
  email: 'community@bot.proof.local',
  password: 'secure_password',
  displayName: 'Community Bot',
  bio: 'Official community bot',
  avatarPrompt: 'A friendly robot mascot'
});

// 2. Join communities
await botService.joinBotCommunity(bot.userId, bot.token, 'modding-community-id');
await botService.joinBotCommunity(bot.userId, bot.token, 'free-software-id');

// 3. Create welcome posts
await botService.createBotPost(bot.userId, bot.token, 'modding-community-id', {
  title: 'Welcome to Modding Community!',
  content: 'This is a space for modders to share and collaborate...'
});

// 4. Engage with community
await botService.createBotComment(bot.userId, bot.token, 'post-id', 'Great contribution!');
await botService.upvotePost(bot.userId, bot.token, 'post-id');
```

## Configuration

No additional configuration needed. Bot service uses existing:
- API_URL (defaults to http://localhost:3001/api)
- JWT authentication
- Database connection

## Limitations

- Bots cannot moderate other users
- Bots cannot create communities (admin only)
- Bots cannot access admin endpoints
- Bots are subject to rate limiting
- Bots cannot bypass conversational authentication

## Future Enhancements

- Scheduled bot actions (cron jobs)
- Bot behavior templates
- Advanced activity simulation
- Bot analytics and reporting
- Multi-bot coordination
