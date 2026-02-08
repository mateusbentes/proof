-- Bot System Migration
-- Creates tables for managing bots and bot conversations

-- Create bots table
CREATE TABLE IF NOT EXISTS bots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL UNIQUE,
  type VARCHAR(50) NOT NULL, -- 'mistral', 'openai', 'custom', etc.
  description TEXT,
  avatar VARCHAR(255),
  config JSONB DEFAULT '{}', -- Store API keys, model names, parameters
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create bot_conversations table
CREATE TABLE IF NOT EXISTS bot_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bot_id UUID NOT NULL REFERENCES bots(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create bot_messages table
CREATE TABLE IF NOT EXISTS bot_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES bot_conversations(id) ON DELETE CASCADE,
  sender_type VARCHAR(20) NOT NULL CHECK (sender_type IN ('user', 'bot')),
  content TEXT NOT NULL,
  metadata JSONB DEFAULT '{}', -- Store tokens, model info, etc.
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_bots_is_active ON bots(is_active);
CREATE INDEX IF NOT EXISTS idx_bots_type ON bots(type);
CREATE INDEX IF NOT EXISTS idx_bot_conversations_bot_id ON bot_conversations(bot_id);
CREATE INDEX IF NOT EXISTS idx_bot_conversations_user_id ON bot_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_bot_conversations_bot_user ON bot_conversations(bot_id, user_id);
CREATE INDEX IF NOT EXISTS idx_bot_messages_conversation_id ON bot_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_bot_messages_sender_type ON bot_messages(sender_type);
CREATE INDEX IF NOT EXISTS idx_bot_messages_created_at ON bot_messages(created_at);

-- Insert default bots
INSERT INTO bots (name, type, description, avatar, config, is_active)
VALUES
  (
    'Mistral',
    'mistral',
    'Mistral AI - Open source language model (via Ollama)',
    '🤖',
    '{"model": "neural-chat", "temperature": 0.7}',
    true
  )
ON CONFLICT (name) DO NOTHING;
