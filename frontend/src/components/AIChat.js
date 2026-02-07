import React, { useEffect, useState } from 'react';
import { useChatStore } from '../store/chatStore';
import apiClient from '../api/client';
import MessageInput from './MessageInput';
import './AIChat.css';

function AIChat() {
  const { messages, addMessage } = useChatStore();
  const [loading, setLoading] = useState(false);
  const aiThreadId = 'meta-ai';
  const aiMessages = messages[aiThreadId] || [];

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
    addMessage(aiThreadId, userMessage);

    setLoading(true);
    try {
      const response = await apiClient.post('/ai/chat', {
        message: content.trim(),
      });

      const aiMessage = {
        id: response.data.id || Date.now().toString(),
        sender_id: 'meta-ai',
        username: 'Meta AI',
        content: response.data.content || response.data.message,
        created_at: new Date().toISOString(),
        isUser: false,
      };
      addMessage(aiThreadId, aiMessage);
    } catch (error) {
      console.error('AI chat error:', error);
      const errorMessage = {
        id: Date.now().toString(),
        sender_id: 'meta-ai',
        username: 'Meta AI',
        content: 'Sorry, I encountered an error. Please try again.',
        created_at: new Date().toISOString(),
        isUser: false,
      };
      addMessage(aiThreadId, errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ai-chat">
      <div className="ai-chat-header">
        <div className="ai-avatar">🤖</div>
        <div className="ai-info">
          <h3>Meta AI</h3>
          <p>Ask me anything</p>
        </div>
      </div>

      <div className="ai-messages">
        {aiMessages.length === 0 ? (
          <div className="ai-welcome">
            <div className="ai-welcome-icon">🤖</div>
            <h2>Hi! I'm Meta AI</h2>
            <p>Ask me questions, get help, or just chat!</p>
          </div>
        ) : (
          aiMessages.map((msg) => (
            <div
              key={msg.id}
              className={`ai-message ${msg.isUser ? 'user' : 'ai'}`}
            >
              <div className="ai-message-avatar">
                {msg.isUser ? '👤' : '🤖'}
              </div>
              <div className="ai-message-content">
                <div className="ai-message-text">{msg.content}</div>
                <div className="ai-message-time">
                  {new Date(msg.created_at).toLocaleTimeString()}
                </div>
              </div>
            </div>
          ))
        )}
        {loading && (
          <div className="ai-message ai">
            <div className="ai-message-avatar">🤖</div>
            <div className="ai-message-content">
              <div className="ai-typing">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}
      </div>

      <MessageInput onSendMessage={handleSendMessage} disabled={loading} />
    </div>
  );
}

export default AIChat;
