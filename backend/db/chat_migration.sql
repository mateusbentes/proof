-- Chat System Migration
-- Creates tables for direct messaging and group chats

-- Chat Threads Table
CREATE TABLE IF NOT EXISTS chat_threads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_type TEXT NOT NULL CHECK (thread_type IN ('dm', 'group')),
  title TEXT,
  created_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_chat_threads_created_at 
  ON chat_threads(created_at DESC);

-- Chat Thread Participants Table
CREATE TABLE IF NOT EXISTS chat_thread_participants (
  thread_id UUID NOT NULL REFERENCES chat_threads(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'member')),
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_read_at TIMESTAMPTZ,
  PRIMARY KEY (thread_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_chat_participants_user 
  ON chat_thread_participants(user_id);

CREATE INDEX IF NOT EXISTS idx_chat_participants_thread 
  ON chat_thread_participants(thread_id);

-- Chat Messages Table
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id UUID NOT NULL REFERENCES chat_threads(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  client_message_id UUID,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  edited_at TIMESTAMPTZ,
  deleted_at TIMESTAMPTZ,
  UNIQUE (thread_id, sender_id, client_message_id)
);

CREATE INDEX IF NOT EXISTS idx_chat_messages_thread_time 
  ON chat_messages(thread_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_chat_messages_sender 
  ON chat_messages(sender_id);

-- User Devices Table (for push notifications)
CREATE TABLE IF NOT EXISTS user_devices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  device_token TEXT NOT NULL,
  platform TEXT NOT NULL CHECK (platform IN ('ios', 'android', 'web')),
  device_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, device_token)
);

CREATE INDEX IF NOT EXISTS idx_user_devices_user 
  ON user_devices(user_id);

-- Trigger to update chat_threads.updated_at
CREATE OR REPLACE FUNCTION update_chat_threads_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE chat_threads SET updated_at = now() WHERE id = NEW.thread_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER chat_messages_update_thread_timestamp
AFTER INSERT ON chat_messages
FOR EACH ROW
EXECUTE FUNCTION update_chat_threads_timestamp();
