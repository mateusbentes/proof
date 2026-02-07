import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import './Chat.css';

const Chat = () => {
  const navigate = useNavigate();
  const { setToken, setUser: setAuthUser } = useAuthStore();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [authMode, setAuthMode] = useState('login'); // 'login' or 'register'
  const [authInput, setAuthInput] = useState({ username: '', password: '' });
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;
    
    const userMessage = { role: 'user', content: input, timestamp: new Date() };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input, user }),
      });
      
      const data = await response.json();
      const botMessage = { role: 'bot', content: data.response, timestamp: new Date() };
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      const errorMessage = { role: 'bot', content: 'Sorry, something went wrong. Please try again.', timestamp: new Date() };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    if (!authInput.username || !authInput.password) return;

    // Simulate auth - in production, call actual API
    const userData = { 
      username: authInput.username, 
      userId: `user-${Date.now()}`, 
      joined: new Date().toLocaleDateString() 
    };
    const token = `token-${Date.now()}`;
    
    // Update authStore
    setAuthUser(userData);
    setToken(token);
    
    // Update local state
    setUser(userData);
    setIsAuthenticated(true);
    setAuthInput({ username: '', password: '' });
    
    // Navigate to home after a short delay
    setTimeout(() => navigate('/'), 500);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUser(null);
    setMessages([]);
    const { logout } = useAuthStore.getState();
    logout();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage();
  };

  return (
    <div className="chat-container-simple">
      {!isAuthenticated ? (
        // Auth Screen
        <div className="auth-screen">
          <div className="auth-card">
            <div className="auth-header">
              <h1>Proof</h1>
              <p>Chat, communities & social</p>
            </div>

            <form onSubmit={handleAuth} className="auth-form">
              <div className="auth-tabs">
                <button
                  type="button"
                  className={`auth-tab ${authMode === 'login' ? 'active' : ''}`}
                  onClick={() => setAuthMode('login')}
                >
                  Login
                </button>
                <button
                  type="button"
                  className={`auth-tab ${authMode === 'register' ? 'active' : ''}`}
                  onClick={() => setAuthMode('register')}
                >
                  Register
                </button>
              </div>

              <input
                type="text"
                placeholder="Username"
                value={authInput.username}
                onChange={(e) => setAuthInput({ ...authInput, username: e.target.value })}
                className="auth-input"
              />
              <input
                type="password"
                placeholder="Password"
                value={authInput.password}
                onChange={(e) => setAuthInput({ ...authInput, password: e.target.value })}
                className="auth-input"
              />
              <button type="submit" className="auth-button">
                {authMode === 'login' ? 'Login' : 'Register'}
              </button>
            </form>
          </div>
        </div>
      ) : (
        // Chat Screen
        <div className="chat-screen">
          <div className="chat-header-simple">
            <div className="chat-header-left">
              <h2>Proof Chat</h2>
              <p>@{user?.username}</p>
            </div>
            <button className="logout-btn-simple" onClick={handleLogout}>
              Logout
            </button>
          </div>

          <div className="messages-area">
            {messages.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">💬</div>
                <p>Start a conversation</p>
              </div>
            ) : (
              messages.map((message, index) => (
                <div key={index} className={`msg ${message.role}`}>
                  <div className="msg-content">{message.content}</div>
                </div>
              ))
            )}
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
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Message..."
              className="msg-input"
              disabled={isLoading}
            />
            <button type="submit" className="send-btn" disabled={isLoading || !input.trim()}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M16.6915026,12.4744748 L3.50612381,13.2599618 C3.19218622,13.2599618 3.03521743,13.4170592 3.03521743,13.5741566 L1.15159189,20.0151496 C0.8376543,20.8006365 0.99,21.89 1.77946707,22.52 C2.41,22.99 3.50612381,23.1 4.13399899,22.8429026 L21.714504,14.0454487 C22.6563168,13.5741566 23.1272231,12.6315722 22.9702544,11.6889879 L4.13399899,1.16346272 C3.34915502,0.9 2.40734225,1.00636533 1.77946707,1.4776575 C0.994623095,2.10604706 0.837654326,3.0486314 1.15159189,3.99701575 L3.03521743,10.4380088 C3.03521743,10.5951061 3.19218622,10.7522035 3.50612381,10.7522035 L16.6915026,11.5376905 C16.6915026,11.5376905 17.1624089,11.5376905 17.1624089,12.0089827 C17.1624089,12.4744748 16.6915026,12.4744748 16.6915026,12.4744748 Z"/>
              </svg>
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default Chat;
