import React, { useState, useEffect, useRef } from 'react';
import Sidebar from './Sidebar';
import './Chat.css';

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
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

  const parseCommand = (message) => {
    const command = message.trim().toLowerCase();
    
    if (command === '/communities') {
      return 'Here are available communities: TechHub, AI_Community, WebDev, Gaming. Use /join <name> to join one.';
    }
    if (command.startsWith('/join ')) {
      const name = command.split(' ')[1];
      return `Joined ${name}! Welcome to the community. Use /posts to see posts.`;
    }
    if (command === '/posts') {
      return 'Recent posts: "Hello World" by @user1, "AI is amazing" by @user2. Use /create post to make one.';
    }
    if (command.startsWith('/create post')) {
      return 'Post created! Your message has been shared with the community.';
    }
    if (command === '/profile') {
      return user ? `Profile: @${user.username}\nPosts: 5\nJoined: ${user.joined}` : 'Please login first with /login';
    }
    if (command === '/settings') {
      return 'Settings: Account, Privacy, Notifications. What would you like to update?';
    }
    if (command.startsWith('/chat ')) {
      const targetUser = command.split(' ')[1];
      return `Started chat with ${targetUser}. Say hi!`;
    }
    if (command === '/logout') {
      setIsAuthenticated(false);
      setUser(null);
      setMessages([]);
      return 'Logged out successfully. Use /login or /register to continue.';
    }
    if (command === '/login') {
      return 'Please type: /login username password';
    }
    if (command.startsWith('/login ') && !isAuthenticated) {
      const [_, username, password] = command.split(' ');
      // Simulate auth
      setUser({ username, joined: new Date().toLocaleDateString() });
      setIsAuthenticated(true);
      return `Welcome back, ${username}! You can now chat, join communities, and more. Try /communities`;
    }
    if (command === '/register') {
      return 'Please type: /register username password';
    }
    if (command.startsWith('/register ') && !isAuthenticated) {
      const [_, username, password] = command.split(' ');
      setUser({ username, joined: new Date().toLocaleDateString() });
      setIsAuthenticated(true);
      return `Account created for ${username}! Welcome aboard. Try /communities`;
    }
    
    return null; // Not a command
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const commandResponse = parseCommand(input);
    if (commandResponse) {
      const botMessage = { role: 'bot', content: commandResponse, timestamp: new Date() };
      setMessages(prev => [...prev, { role: 'user', content: input, timestamp: new Date() }, botMessage]);
      setInput('');
    } else {
      sendMessage();
    }
  };

  return (
    <div className="chat-container">
      <Sidebar 
        isAuthenticated={isAuthenticated}
        user={user}
        setIsAuthenticated={setIsAuthenticated}
        setUser={setUser}
        setMessages={setMessages}
      />
      
      <div className="chat-main">
        <div className="chat-messages">
          {!isAuthenticated ? (
            <div className="welcome-screen">
              <div className="welcome-card">
                <h1>🤖 Welcome to SocialChat</h1>
                <p>Chat, join communities, share posts, and more!</p>
                <div className="auth-commands">
                  <code>/login username password</code>
                  <code>/register username password</code>
                </div>
              </div>
            </div>
          ) : (
            messages.map((message, index) => (
              <div key={index} className={`message ${message.role}`}>
                <div className="message-bubble">
                  {message.role === 'user' ? '👤' : '🤖'}
                  <span>{message.content}</span>
                </div>
                <span className="timestamp">
                  {message.timestamp.toLocaleTimeString()}
                </span>
              </div>
            ))
          )}
          {isLoading && (
            <div className="message bot">
              <div className="message-bubble">
                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
        
        <form onSubmit={handleSubmit} className="chat-input-container">
          <div className="chat-input-wrapper">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={isAuthenticated ? "Type a message or command..." : "Get started with /login or /register"}
              className="chat-input"
              disabled={!isAuthenticated && !input.startsWith('/login') && !input.startsWith('/register')}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSubmit(e)}
            />
            <button type="submit" className="send-button" disabled={isLoading || !input.trim()}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M2 21l21-9L2 3v7l15 2-15 2v7z" stroke="currentColor" strokeWidth="2" fill="none"/>
              </svg>
            </button>
          </div>
          <div className="commands-help">
            <small>Commands: /communities /join /posts /profile /settings /chat /logout</small>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Chat;
