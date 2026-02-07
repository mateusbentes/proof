import React from 'react';
import { useNavigate } from 'react-router-dom';

const Sidebar = ({ isAuthenticated, user, setIsAuthenticated, setUser, setMessages }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUser(null);
    setMessages([]);
    navigate('/');
  };

  const handleNav = (section) => {
    const message = `/ ${section}`;
    // This will be handled by command parsing in Chat.js
    // For now, just navigate or trigger command
    window.postMessage({ type: 'CHAT_COMMAND', command: message }, '*');
  };

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h2>🌐 SocialChat</h2>
      </div>
      
      <nav className="sidebar-nav">
        <button className="nav-item" onClick={() => handleNav('communities')}>
          💬 Communities
        </button>
        <button className="nav-item" onClick={() => handleNav('posts')}>
          📝 Posts
        </button>
        {isAuthenticated && (
          <>
            <button className="nav-item" onClick={() => handleNav('profile')}>
              👤 Profile
            </button>
            <button className="nav-item" onClick={() => handleNav('settings')}>
              ⚙️ Settings
            </button>
            <button className="nav-item" onClick={() => handleNav('chat')}>
              💌 Messages
            </button>
          </>
        )}
      </nav>
      
      <div className="sidebar-footer">
        {isAuthenticated ? (
          <div className="user-info">
            <img src="/api/avatar" alt="avatar" className="avatar" />
            <span>@{user?.username}</span>
            <button className="logout-btn" onClick={handleLogout}>
              🚪 Logout
            </button>
          </div>
        ) : (
          <div className="auth-prompt">
            <p>Not signed in</p>
            <small>Use /login or /register</small>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
