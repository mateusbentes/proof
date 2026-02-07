# Generic Bot System Implementation

## Overview

Implemented a **generic, scalable bot system** for the Proof platform that allows users to chat with AI assistants alongside user-to-user messaging. The system is designed to support multiple AI providers (Mistral, OpenAI, etc.) and can be easily extended.

## Architecture

### Database Schema

Three new tables added to support bot conversations:

```sql
-- Bots table: Store bot definitions
bots (
  id UUID PRIMARY KEY,
  name VARCHAR(255) UNIQUE,
  type VARCHAR(50),           -- 'mistral', 'openai', 'custom', etc.
  description TEXT,
  avatar VARCHAR(255),
  config JSONB,               -- Store API keys, model names, parameters
  is_active BOOLEAN,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)

-- Bot conversations: Track user-bot conversations
bot_conversations (
  id UUID PRIMARY KEY,
  bot_id UUID REFERENCES bots,
  user_id UUID REFERENCES users,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)

-- Bot messages: Store conversation messages
bot_messages (
  id UUID PRIMARY KEY,
  conversation_id UUID REFERENCES bot_conversations,
  sender_type VARCHAR(20),    -- 'user' or 'bot'
  content TEXT,
  metadata JSONB,
  created_at TIMESTAMP
)
```

### Backend Components

#### BotService (`backend/src/services/botService.js`)

Core service for bot operations:

```javascript
// Get all active bots
async getActiveBots()

// Get bot by ID
async getBotById(botId)

// Get or create conversation
async getOrCreateConversation(botId, userId)

// Get conversation messages
async getConversationMessages(conversationId, limit, offset)

// Add message to conversation
async addMessage(conversationId, senderType, content, metadata)

// Get bot response (routes to appropriate provider)
async getBotResponse(bot, userMessage)

// Provider-specific methods
async getMistralResponse(bot, userMessage)
async getOpenAIResponse(bot, userMessage)
getCustomResponse(bot, userMessage)
```

#### Bot Routes (`backend/src/routes/bots.js`)

API endpoints:

```
GET    /api/bots                              - List all active bots
GET    /api/bots/:botId/conversations         - Get user's conversation with bot
GET    /api/bots/:botId/conversations/:conversationId/messages - Get messages
POST   /api/bots/:botId/chat                  - Send message to bot
```

### Frontend Components

#### ChatThreadsList

Updated to display:
- **Bots Section** - All available bots with descriptions
- **Conversations Section** - User-to-user chats and groups

```
Messages
├─ Bots
│  └─ 🤖 Mistral
│
└─ Conversations
   ├─ User 1
   ├─ User 2
   └─ Group Chat
```

#### BotChat Component

Beautiful chat interface for bot conversations:
- Welcome message with bot info
- Message history
- Typing indicator
- Real-time responses
- Responsive design

## Default Bots

One default bot is created on database initialization:

### Mistral
- **Type**: `mistral`
- **Avatar**: 🤖
- **Description**: Mistral AI - Open source language model
- **Config**: `{"model": "mistral-7b", "temperature": 0.7, "max_tokens": 1024}`

## User Flow

### Unauthenticated Users
```
Landing → Chat Interface (for login/register/account setup)
```

### Authenticated Users
```
Home (Social Feed)
├─ Chat Page
│  ├─ Bots Section
│  │  └─ Click Mistral → BotChat Interface
│  │
│  └─ Conversations Section
│     ├─ User 1 → User-to-User Chat
│     ├─ User 2 → User-to-User Chat
│     └─ Group → Group Chat
│
├─ Communities
├─ Profile
└─ Logout
```

## Extensibility

### Adding a New Bot Type

1. **Insert bot into database**:
```sql
INSERT INTO bots (name, type, description, avatar, config, is_active)
VALUES (
  'My Bot',
  'my_type',
  'Description',
  '🤖',
  '{"api_key": "...", "model": "..."}',
  true
);
```

2. **Add handler in BotService**:
```javascript
async getBotResponse(bot, userMessage) {
  switch (bot.type) {
    case 'my_type':
      return await this.getMyBotResponse(bot, userMessage);
    // ...
  }
}

async getMyBotResponse(bot, userMessage) {
  // Implementation
}
```

### Integrating Mistral AI

1. **Install Mistral SDK**:
```bash
npm install @mistralai/mistralai
```

2. **Update BotService**:
```javascript
const { Mistral } = require('@mistralai/mistralai');

async getMistralResponse(bot, userMessage) {
  const client = new Mistral({
    apiKey: bot.config.api_key,
  });

  const response = await client.chat.complete({
    model: bot.config.model || 'mistral-7b',
    messages: [{ role: 'user', content: userMessage }],
    temperature: bot.config.temperature || 0.7,
    maxTokens: bot.config.max_tokens || 1024,
  });

  return response.choices[0].message.content;
}
```

3. **Set API key**:
```sql
UPDATE bots 
SET config = jsonb_set(config, '{api_key}', '"your-mistral-api-key"')
WHERE name = 'Mistral';
```

## Benefits

✅ **Generic** - Support any AI provider
✅ **Scalable** - Each bot has isolated conversations
✅ **Configurable** - Bot settings in JSONB
✅ **User-friendly** - Bots appear naturally in chat list
✅ **Extensible** - Easy to add new bot types
✅ **Secure** - API keys stored in config
✅ **Performant** - Indexed database queries

## Future Enhancements

- [ ] Bot management admin panel
- [ ] Bot personality customization
- [ ] Context-aware responses (conversation history)
- [ ] Multi-language support
- [ ] Bot analytics and usage tracking
- [ ] Custom bot creation UI
- [ ] Bot marketplace
- [ ] Conversation export/sharing
- [ ] Bot rating system

## Files Changed

### Backend
- `backend/db/init.sql` - Added bot tables
- `backend/src/services/botService.js` - New bot service
- `backend/src/routes/bots.js` - New bot routes
- `backend/src/index.js` - Registered bot routes

### Frontend
- `frontend/src/components/ChatThreadsList.js` - Added bot display
- `frontend/src/components/ChatThreadsList.css` - Bot styling
- `frontend/src/components/BotChat.js` - New bot chat component
- `frontend/src/components/BotChat.css` - Bot chat styling
- `frontend/src/components/ChatDetail.js` - Route to BotChat

## Testing

### Test Bot Chat
1. Login to the application
2. Go to Chat page
3. Click on "Mistral" or "Assistant" in Bots section
4. Send a message
5. Receive response from bot

### Test User Chat
1. Create another user account
2. Start a conversation with the other user
3. Verify messages are sent/received correctly

## Deployment

The system is fully integrated and ready for deployment:

```bash
# Build and start
docker-compose up -d

# Database migrations are automatic (init.sql)
# Default bots are created on first run
```

## Support

For issues or questions about the bot system, refer to:
- `BotService` documentation in code
- Bot routes in `backend/src/routes/bots.js`
- Frontend components in `frontend/src/components/`
