import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import Navbar from './components/Navbar';
import ConversationalHome from './pages/ConversationalHome';
import Home from './pages/Home';
import Register from './pages/Register';
import Login from './pages/Login';
import ConversationalAuth from './pages/ConversationalAuth';
import Communities from './pages/Communities';
import Profile from './pages/Profile';
import './App.css';

function App() {
  const { token } = useAuthStore();

  return (
    <Router>
      <div className="app">
        <Navbar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={!token ? <ConversationalHome /> : <Navigate to="/communities" />} />
            <Route path="/register" element={!token ? <Register /> : <Navigate to="/communities" />} />
            <Route path="/login" element={!token ? <Login /> : <Navigate to="/communities" />} />
            <Route path="/auth/:sessionId" element={<ConversationalAuth />} />
            <Route path="/communities" element={token ? <Communities /> : <Navigate to="/" />} />
            <Route path="/profile" element={token ? <Profile /> : <Navigate to="/" />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
