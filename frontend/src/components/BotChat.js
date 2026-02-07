import React, { useEffect, useState, useRef } from 'react';
import { useChatStore } from '../store/chatStore';
import apiClient from '../api/client';
import MessageInput from './MessageInput';
import './BotChat.css';

function BotChat({ bot }) {
  const { messages, addMessage } = useChatStore();
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState(null);
  const messagesEndRef = useRef(null);
  const botMessages = messages[bot.id] || [];

  useEffect(() => {
    loadConversation();
  }, [bot.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [botMessages]);

  const loadConversation = async () => {
    try {
      const response = await apiClient.get(`/bots/${bot.id}/conversations`);
      setConversationId(response.data.conversationId);
      
      // Load existing messages
      if (response.data.messages && response.data.messages.length > 0) {
        response.data.messages.forEach((msg) => {
          addMessage(bot.id, {
            id: msg.id,
            sender_id: msg.sender_type === 'bot' ? bot.id : 'user',
            username: msg.sender_type === 'bot' ? bot.name : 'You',
            content: msg.content,
            created_at: msg.created_at,
            isUser: msg.sender_type === 'user',
          });
        });
      }
    } catch (error) {
      console.error('Failed to load conversation:', error);
    }
  };

  const handleSendMessage = async (content) => {
    if (!content.trim()) return;

    // Add user message immediately
    const userMessage = {
      id: Date.now().toString(),
      sender_id: 'user',
      username: 'You',
      content: content.trim(),
      created_at: new Date().toISOString(),
      isUser: true,
    };
    addMessage(bot.id, userMessage);

    setLoading(true);
    try {
      const response = await apiClient.post(`/bots/${bot.id}/chat`, {
        message: content.trim(),
      });

      const botMessage = {
        id: response.data.message.id,
        sender_id: bot.id,
        username: bot.name,
        content: response.data.message.content,
        created_at: response.data.message.created_at,
        isUser: false,
      };
      addMessage(bot.id, botMessage);
      setConversationId(response.data.conversationId);
    } catch (error) {
      console.error('Bot chat error:', error);
      const errorMessage = {
        id: Date.now().toString(),
        sender_id: bot.id,
        username: bot.name,
        content: 'Sorry, I encountered an error. Please try again.',
        created_at: new Date().toISOString(),
        isUser: false,
      };
      addMessage(bot.id, errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bot-chat">
      <div className="bot-chat-header">
        <div className="bot-avatar">{bot.avatar || '🤖'}</div>
        <div className="bot-info">
          <h3>{bot.name}</h3>
          <p>{bot.description || 'AI Assistant'}</p>
        </div>
      </div>

      <div className="bot-messages">
        {botMessages.length === 0 ? (
          <div className="bot-welcome">
            <div className="bot-welcome-icon">{bot.avatar || '🤖'}</div>
            <h2>Hi! I'm {bot.name}</h2>
            <p>{bot.description || 'Ask me anything!'}</p>
          </div>
        ) : (
          botMessages.map((msg) => (
            <div
              key={msg.id}
              className={`bot-message ${msg.isUser ? 'user' : 'bot'}`}
            >
              <div className="bot-message-avatar">
                {msg.isUser ? '👤' : bot.avatar || '🤖'}
              </div>
              <div className="bot-message-content">
                <div className="bot-message-text">{msg.content}</div>
                <div className="bot-message-time">
                  {new Date(msg.created_at).toLocaleTimeString()}
                </div>
              </div>
            </div>
          ))
        )}
        {loading && (
          <div className="bot-message bot">
            <div className="bot-message-avatar">{bot.avatar || '🤖'}</div>
            <div className="bot-message-content">
              <div className="bot-typing">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <MessageInput onSendMessage={handleSendMessage} disabled={loading} />
    </div>
  );
}

export default BotChat;
