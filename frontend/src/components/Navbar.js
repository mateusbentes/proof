import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import './Navbar.css';

function Navbar() {
  const { token, user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          Proof
        </Link>

        <ul className="nav-menu">
          <li className="nav-item">
            <Link to="/communities" className="nav-link">
              Communities
            </Link>
          </li>

          {token ? (
            <>
              <li className="nav-item">
                <Link to="/profile" className="nav-link">
                  {user?.username || 'Profile'}
                </Link>
              </li>
              <li className="nav-item">
                <button onClick={handleLogout} className="nav-button logout">
                  Logout
                </button>
              </li>
            </>
          ) : (
            <>
              <li className="nav-item">
                <Link to="/login" className="nav-link">
                  Login
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/register" className="nav-button register">
                  Register
                </Link>
              </li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
}

export default Navbar;
