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
    if (messages.length === 0) {
      const greeting = {
        role: 'bot',
        content: token 
          ? `Welcome back, ${authUser?.username}! 👋 How can I help you today?`
          : 'Hello! 👋 I\'m Mistral, your AI assistant on Proof. I\'m here to help you prove you\'re human through conversation. Feel free to chat with me, or use /login or /register to access your account. Type /help for commands.',
        timestamp: new Date()
      };
      setMessages([greeting]);
    }
  }, [token, authUser]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;
    
    const userMessage = { role: 'user', content: input, timestamp: new Date() };
    setMessages(prev => [...prev, userMessage]);
    const userInput = input;
    setInput('');
    setIsLoading(true);

    try {
      // Check for special commands
      if (userInput.toLowerCase().startsWith('/login ')) {
        const [_, username, password] = userInput.split(' ');
        if (!username || !password) {
          const errorMsg = {
            role: 'bot',
            content: 'Usage: /login username password',
            timestamp: new Date()
          };
          setMessages(prev => [...prev, errorMsg]);
          setIsLoading(false);
          return;
        }

        try {
          const loginResponse = await apiClient.post('/auth/login', {
            email: `${username}@proof.local`,
            password
          });

          const userData = {
            username: loginResponse.data.user.username,
            userId: loginResponse.data.user.id,
            joined: new Date().toLocaleDateString()
          };
          const newToken = loginResponse.data.token;

          setAuthUser(userData);
          setToken(newToken);

          const successMsg = {
            role: 'bot',
            content: `Welcome back, ${username}! 🎉 You're now logged in. You can now access communities, posts, and manage your account. Type /help for more commands.`,
            timestamp: new Date()
          };
          setMessages(prev => [...prev, successMsg]);
          setTimeout(() => navigate('/'), 2000);
        } catch (error) {
          const errorMsg = {
            role: 'bot',
            content: error.response?.data?.error || 'Login failed. Please check your credentials.',
            timestamp: new Date()
          };
          setMessages(prev => [...prev, errorMsg]);
        }
      } else if (userInput.toLowerCase().startsWith('/register ')) {
        const [_, username, password] = userInput.split(' ');
        if (!username || !password) {
          const errorMsg = {
            role: 'bot',
            content: 'Usage: /register username password',
            timestamp: new Date()
          };
          setMessages(prev => [...prev, errorMsg]);
          setIsLoading(false);
          return;
        }

        try {
          const registerResponse = await apiClient.post('/auth/register', {
            username,
            password,
            email: `${username}@proof.local`
          });

          const userData = {
            username: registerResponse.data.user.username,
            userId: registerResponse.data.user.id,
            joined: new Date().toLocaleDateString()
          };
          const newToken = registerResponse.data.token;

          setAuthUser(userData);
          setToken(newToken);

          const successMsg = {
            role: 'bot',
            content: `Welcome to Proof, ${username}! 🚀 Your account has been created. You now have access to communities, posts, and social features. Type /help for more commands.`,
            timestamp: new Date()
          };
          setMessages(prev => [...prev, successMsg]);
          setTimeout(() => navigate('/'), 2000);
        } catch (error) {
          const errorMsg = {
            role: 'bot',
            content: error.response?.data?.error || 'Registration failed. Please try again.',
            timestamp: new Date()
          };
          setMessages(prev => [...prev, errorMsg]);
        }
      } else if (userInput.toLowerCase() === '/help') {
        const helpMsg = {
          role: 'bot',
          content: token 
            ? 'Commands: /logout - Logout from your account\n\nYou can also access communities, posts, and manage your profile through the navigation menu.'
            : 'Commands:\n/login username password - Login to your account\n/register username password - Create a new account\n\nOr just chat with me to prove you\'re human! 😊',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, helpMsg]);
      } else if (userInput.toLowerCase() === '/logout' && token) {
        setAuthUser(null);
        setToken(null);
        const logoutMsg = {
          role: 'bot',
          content: 'You\'ve been logged out. Type /login or /register to continue.',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, logoutMsg]);
      } else {
        // Send to Mistral bot for intelligent conversation
        try {
          // Get Mistral bot ID first
          const botsResponse = await apiClient.get('/bots');
          const mistralBot = botsResponse.data.bots.find(b => b.type === 'mistral');
          
          if (!mistralBot) {
            throw new Error('Mistral bot not found');
          }

          const response = await apiClient.post(`/bots/${mistralBot.id}/chat`, {
            message: userInput
          });

          const botMessage = {
            role: 'bot',
            content: response.data.message?.content || 'I understand. How can I help you further?',
            timestamp: new Date()
          };
          setMessages(prev => [...prev, botMessage]);
        } catch (error) {
          console.error('Mistral error:', error);
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
