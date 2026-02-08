import React, { useState, useEffect, useRef } from 'react';
import { useAuthStore } from '../store/authStore';
import apiClient from '../api/client';
import ChatThreadsList from '../components/ChatThreadsList';
import './Chat.css';

const Chat = () => {
  const { user } = useAuthStore();
  const [activeChat, setActiveChat] = useState('mistral'); // 'mistral' or user ID
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [mistralBotId, setMistralBotId] = useState(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load Mistral bot ID on mount
  useEffect(() => {
    const loadMistralBot = async () => {
      try {
        const botsResponse = await apiClient.get('/bots');
        const mistralBot = botsResponse.data.bots.find(b => b.type === 'mistral');
        if (mistralBot) {
          setMistralBotId(mistralBot.id);
        }
      } catch (error) {
        console.error('Error loading Mistral bot:', error);
      }
    };
    loadMistralBot();
  }, []);

  // Initialize with greeting when switching to Mistral
  useEffect(() => {
    if (activeChat === 'mistral' && messages.length === 0) {
      const greeting = {
        role: 'bot',
        content: `Welcome back, ${user?.username}! 👋 I'm Mistral, your AI assistant. Feel free to chat with me about anything!`,
        timestamp: new Date()
      };
      setMessages([greeting]);
    }
  }, [activeChat, user, messages.length]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = { role: 'user', content: input, timestamp: new Date() };
    setMessages(prev => [...prev, userMessage]);
    const userInput = input;
    setInput('');
    setIsLoading(true);

    try {
      if (activeChat === 'mistral') {
        // Send to Mistral bot
        if (!mistralBotId) {
          throw new Error('Mistral bot not found');
        }

        const response = await apiClient.post(`/bots/${mistralBotId}/chat`, {
          message: userInput
        });

        const botMessage = {
          role: 'bot',
          content: response.data.message?.content || 'I understand. How can I help you further?',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, botMessage]);
      } else {
        // Send to user (future implementation for user-to-user chat)
        console.log('User-to-user chat not yet implemented');
      }
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage = {
        role: 'bot',
        content: error.response?.data?.error || 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="chat-page">
      <div className="chat-container">
        {/* Sidebar with chat threads */}
        <div className="chat-sidebar">
          <div className="chat-header">
            <h2>Chats</h2>
          </div>
          
          {/* Mistral Bot */}
          <div 
            className={`chat-thread ${activeChat === 'mistral' ? 'active' : ''}`}
            onClick={() => {
              setActiveChat('mistral');
              setMessages([]);
            }}
          >
            <div className="chat-thread-avatar">🤖</div>
            <div className="chat-thread-info">
              <div className="chat-thread-name">Mistral Bot</div>
              <div className="chat-thread-preview">AI Assistant</div>
            </div>
          </div>

          {/* User threads will go here */}
          <ChatThreadsList onSelectThread={(userId) => {
            setActiveChat(userId);
            setMessages([]);
          }} />
        </div>

        {/* Main chat area */}
        <div className="chat-main">
          <div className="chat-header">
            <h2>
              {activeChat === 'mistral' ? '🤖 Mistral Bot' : `Chat with ${activeChat}`}
            </h2>
          </div>

          <div className="chat-messages">
            {messages.map((msg, idx) => (
              <div key={idx} className={`message ${msg.role}`}>
                <div className="message-content">
                  <span className="message-avatar">
                    {msg.role === 'bot' ? '🤖' : '👤'}
                  </span>
                  <span className="message-text">{msg.content}</span>
                </div>
                <div className="message-time">
                  {msg.timestamp.toLocaleTimeString()}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <div className="chat-input-area">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              disabled={isLoading}
              rows="3"
            />
            <button onClick={sendMessage} disabled={isLoading || !input.trim()}>
              {isLoading ? 'Sending...' : 'Send'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;
