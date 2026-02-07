import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import apiClient from '../api/client';
import './Chat.css';

const Chat = () => {
  const navigate = useNavigate();
  const { token, user: authUser, setToken, setUser: setAuthUser } = useAuthStore();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [authStep, setAuthStep] = useState('greeting'); // greeting, username, password, setup, complete
  const [tempUser, setTempUser] = useState({ username: '', password: '' });
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize chat with Mistral greeting
  useEffect(() => {
    if (messages.length === 0 && !token) {
      const greeting = {
        role: 'bot',
        content: 'Hello! 👋 I\'m Mistral, your AI assistant. Let\'s get you set up. What\'s your username?',
        timestamp: new Date()
      };
      setMessages([greeting]);
      setAuthStep('username');
    }
  }, []);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;
    
    const userMessage = { role: 'user', content: input, timestamp: new Date() };
    setMessages(prev => [...prev, userMessage]);
    const userInput = input;
    setInput('');
    setIsLoading(true);

    try {
      // Handle authentication flow
      if (!token) {
        if (authStep === 'username') {
          setTempUser({ ...tempUser, username: userInput });
          const response = {
            role: 'bot',
            content: `Nice to meet you, ${userInput}! 😊 Now, please create a password for your account.`,
            timestamp: new Date()
          };
          setMessages(prev => [...prev, response]);
          setAuthStep('password');
        } else if (authStep === 'password') {
          setTempUser({ ...tempUser, password: userInput });
          const response = {
            role: 'bot',
            content: `Great! Your account is being created... ✨\n\nWelcome to Proof, ${tempUser.username}! You now have access to chat, communities, and social features. Let's explore! 🚀`,
            timestamp: new Date()
          };
          setMessages(prev => [...prev, response]);
          
          // Create account
          const userData = {
            username: tempUser.username,
            userId: `user-${Date.now()}`,
            joined: new Date().toLocaleDateString()
          };
          const newToken = `token-${Date.now()}`;
          
          setAuthUser(userData);
          setToken(newToken);
          setAuthStep('complete');
          
          // Redirect after 2 seconds
          setTimeout(() => navigate('/'), 2000);
        }
      } else {
        // User is authenticated, send to Mistral bot
        try {
          const response = await apiClient.post('/bots/mistral-id/chat', {
            message: userInput
          });
          
          const botMessage = {
            role: 'bot',
            content: response.data.message?.content || 'I understand. How can I help you further?',
            timestamp: new Date()
          };
          setMessages(prev => [...prev, botMessage]);
        } catch (error) {
          const errorMessage = {
            role: 'bot',
            content: 'Sorry, I encountered an error. Please try again.',
            timestamp: new Date()
          };
          setMessages(prev => [...prev, errorMessage]);
        }
      }
    } catch (error) {
      const errorMessage = { role: 'bot', content: 'Sorry, something went wrong. Please try again.', timestamp: new Date() };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };



  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage();
  };

  return (
    <div className="chat-container-simple">
      <div className="chat-screen">
        <div className="chat-header-simple">
          <div className="chat-header-left">
            <h2>🤖 Mistral</h2>
            <p>{token ? 'Chat & Social' : 'Authentication'}</p>
          </div>
          {authUser && (
            <div className="user-badge">
              <span>@{authUser.username}</span>
            </div>
          )}
        </div>

        <div className="messages-area">
          {messages.map((message, index) => (
            <div key={index} className={`msg ${message.role}`}>
              <div className="msg-content">
                {message.content.split('\n').map((line, i) => (
                  <div key={i}>{line}</div>
                ))}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="msg bot">
              <div className="msg-content">
                <div className="typing">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSubmit} className="input-area">
          <input
            type={authStep === 'password' ? 'password' : 'text'}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              authStep === 'username' ? 'Enter your username...' :
              authStep === 'password' ? 'Enter your password...' :
              'Message...'
            }
            className="msg-input"
            disabled={isLoading || authStep === 'complete'}
          />
          <button type="submit" className="send-btn" disabled={isLoading || !input.trim() || authStep === 'complete'}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M16.6915026,12.4744748 L3.50612381,13.2599618 C3.19218622,13.2599618 3.03521743,13.4170592 3.03521743,13.5741566 L1.15159189,20.0151496 C0.8376543,20.8006365 0.99,21.89 1.77946707,22.52 C2.41,22.99 3.50612381,23.1 4.13399899,22.8429026 L21.714504,14.0454487 C22.6563168,13.5741566 23.1272231,12.6315722 22.9702544,11.6889879 L4.13399899,1.16346272 C3.34915502,0.9 2.40734225,1.00636533 1.77946707,1.4776575 C0.994623095,2.10604706 0.837654326,3.0486314 1.15159189,3.99701575 L3.03521743,10.4380088 C3.03521743,10.5951061 3.19218622,10.7522035 3.50612381,10.7522035 L16.6915026,11.5376905 C16.6915026,11.5376905 17.1624089,11.5376905 17.1624089,12.0089827 C17.1624089,12.4744748 16.6915026,12.4744748 16.6915026,12.4744748 Z"/>
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
};

export default Chat;
