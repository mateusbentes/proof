import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import './Navbar.css';

const Navbar = ({ onMenuClick }) => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <button className="menu-btn" onClick={onMenuClick}>
          ☰
        </button>
        <h1 className="navbar-title">🌐 Proof</h1>
      </div>

      <div className="navbar-center">
        <button className="nav-link" onClick={() => navigate('/')}>
          🏠 Home
        </button>
        <button className="nav-link" onClick={() => navigate('/communities')}>
          💬 Communities
        </button>
        <button className="nav-link" onClick={() => navigate('/chat')}>
          💌 Messages
        </button>
      </div>

      <div className="navbar-right">
        <button className="nav-link" onClick={() => navigate('/profile')}>
          👤 {user?.username || 'Profile'}
        </button>
        <button className="logout-btn" onClick={handleLogout}>
          🚪 Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
