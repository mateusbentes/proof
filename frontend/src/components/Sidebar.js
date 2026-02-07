import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

const Sidebar = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const handleNavigation = (path) => {
    navigate(path);
    onClose();
  };

  const handleLogout = () => {
    logout();
    navigate('/');
    onClose();
  };

  return (
    <>
      {isOpen && <div className="sidebar-overlay" onClick={onClose} />}
      <div className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <h2>🌐 Proof</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>
        
        <nav className="sidebar-nav">
          <button className="nav-item" onClick={() => handleNavigation('/')}>
            🏠 Home
          </button>
          <button className="nav-item" onClick={() => handleNavigation('/communities')}>
            💬 Communities
          </button>
          <button className="nav-item" onClick={() => handleNavigation('/chat')}>
            💌 Messages
          </button>
          <button className="nav-item" onClick={() => handleNavigation('/profile')}>
            👤 Profile
          </button>
        </nav>
        
        <div className="sidebar-footer">
          {user && (
            <div className="user-info">
              <span>@{user.username}</span>
              <button className="logout-btn" onClick={handleLogout}>
                🚪 Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Sidebar;
