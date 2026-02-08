# Mistral Bot Setup Guide

## Overview
The Mistral bot is now **fully functional** with a multi-tier fallback system:
1. **Primary**: Ollama (self-hosted local AI model server)
2. **Fallback 1**: Rasa (conversational AI framework)
3. **Fallback 2**: Custom keyword-based responses

No API keys required! The bot runs entirely on your infrastructure.

## What Was Fixed

### 1. **Multi-Tier Fallback System**
- Implemented Mistral AI integration via **Ollama** (already running in Docker)
- Falls back to **Rasa** if Ollama is unavailable
- Falls back to **custom keyword-based responses** if both services fail
- Ensures the bot always responds, even if services are down

### 2. **Error Handling**
The bot gracefully handles errors:
- If Ollama is unavailable or model not found → tries Rasa
- If Rasa is unavailable or not trained → uses custom responses
- Always returns a helpful response to the user

### 3. **Database Schema**
Updated the bot configuration to use Ollama settings (no API key needed).

## Setup Instructions

### Step 1: Ensure Ollama is Running
Your `docker-compose.yml` already includes Ollama with Mistral model. Just make sure it's running:

```bash
docker-compose up -d ollama
```

Verify Ollama is healthy:
```bash
curl http://localhost:11434/api/tags
```

You should see the `mistral` model listed.

### Step 2: Verify Backend Configuration
The backend is already configured to use Ollama. Check your environment variables in `docker-compose.yml`:

```yaml
environment:
  - OLLAMA_API_URL=http://ollama:11434/api
  - OLLAMA_MODEL=mistral
```

These are already set correctly!

### Step 3: Test the Bot
1. Start a conversation with the Mistral bot
2. Send a message like "Hello"
3. You should receive a response from Mistral AI running locally

## Configuration Options

The bot config supports the following parameters:

```json
{
  "model": "mistral",
  "temperature": 0.7
}
```

### Parameters Explained:
- **model**: The Ollama model to use (default: "mistral")
  - Available models in Ollama: `mistral`, `neural-chat`, `dolphin-mixtral`, etc.
  - To add more models: `ollama pull <model-name>`
- **temperature**: Controls randomness (0-1, default: 0.7)
  - Lower = more deterministic
  - Higher = more creative

## API Endpoints

### Send Message to Mistral Bot (Authenticated)
```
POST /api/bots/:botId/chat
Authorization: Bearer <token>
Content-Type: application/json

{
  "message": "Hello, how are you?"
}
```

**Response:**
```json
{
  "conversationId": "uuid",
  "message": {
    "id": "uuid",
    "sender_type": "bot",
    "content": "I'm doing well, thank you for asking!",
    "created_at": "2026-02-07T21:30:49Z"
  }
}
```

### Send Message to Mistral Bot (Public/Unauthenticated)
```
POST /api/bots/:botId/chat/public
Content-Type: application/json

{
  "message": "Hello, how are you?"
}
```

**Response:**
```json
{
  "message": {
    "id": "uuid",
    "content": "I'm doing well, thank you for asking!",
    "created_at": "2026-02-07T21:30:49Z"
  }
}
```

### Get Bot Conversations
```
GET /api/bots/:botId/conversations
Authorization: Bearer <token>
```

**Response:**
```json
{
  "conversationId": "uuid",
  "messages": [
    {
      "id": "uuid",
      "sender_type": "user",
      "content": "Hello",
      "created_at": "2026-02-07T21:30:49Z"
    },
    {
      "id": "uuid",
      "sender_type": "bot",
      "content": "Hello! How can I help you?",
      "created_at": "2026-02-07T21:30:50Z"
    }
  ]
}
```

## Troubleshooting

### "Mistral AI service is not available"
- Check if Ollama container is running: `docker ps | grep ollama`
- Restart Ollama: `docker-compose restart ollama`
- Check Ollama logs: `docker logs proof-ollama`
- Verify connectivity: `curl http://localhost:11434/api/tags`

### "Request to Mistral AI timed out"
- Ollama might be processing a large request
- Try again in a few moments
- Check system resources (CPU, RAM)
- Increase timeout if needed in the code

### Model not found
- Pull the model: `docker exec proof-ollama ollama pull mistral`
- List available models: `curl http://localhost:11434/api/tags`
- Update bot config with correct model name

## Implementation Details

### Files Modified:
1. **backend/src/services/botService.js**
   - Implemented `getMistralResponse()` using Ollama API
   - Updated `getOpenAIResponse()` to fall back to Ollama if no API key
   - Added comprehensive error handling for local service

2. **backend/db/bot_system_migration.sql**
   - Updated default Mistral bot config to use Ollama settings
   - Removed API key requirement

### Key Features:
- ✅ Self-hosted Mistral AI via Ollama
- ✅ No API keys or external dependencies
- ✅ Configurable model and temperature
- ✅ 60-second timeout for longer responses
- ✅ Specific error messages for debugging
- ✅ Support for both authenticated and public endpoints
- ✅ Conversation history tracking
- ✅ OpenAI fallback to Ollama if no API key configured

## Adding More Models

To use different models with Ollama:

```bash
# Pull a new model
docker exec proof-ollama ollama pull neural-chat

# Update bot config in database
UPDATE bots 
SET config = jsonb_set(config, '{model}', '"neural-chat"')
WHERE name = 'Mistral';
```

Available models: `mistral`, `neural-chat`, `dolphin-mixtral`, `llama2`, `orca-mini`, etc.

## Performance Tips

1. **Adjust temperature** based on use case:
   - Lower (0.3-0.5): More focused, deterministic responses
   - Higher (0.7-1.0): More creative, varied responses

2. **Monitor system resources**:
   - Ollama uses significant CPU/RAM
   - Check Docker stats: `docker stats proof-ollama`

3. **Optimize response time**:
   - Smaller models are faster (e.g., `orca-mini`)
   - Larger models are more capable (e.g., `mistral`)

## Support

For issues with:
- **Ollama**: Visit [Ollama GitHub](https://github.com/ollama/ollama)
- **Mistral Model**: Check [Ollama Model Library](https://ollama.ai/library)
- **Proof Platform**: Check the main README.md or create an issue on GitHub
