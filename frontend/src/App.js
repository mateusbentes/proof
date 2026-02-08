import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ChatPage from './pages/Chat';
import ConversationalChat from './components/Chat';
import Home from './pages/Home';
import Communities from './pages/Communities';
import Profile from './pages/Profile';
import ConversationalHome from './pages/ConversationalHome';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import { useAuthStore } from './store/authStore';
import './App.css';

function App() {
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);
  const [showSidebar, setShowSidebar] = useState(false);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Ensure auth state is loaded from localStorage on mount
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    setIsReady(true);
  }, []);

  const isAuthenticated = !!token && !!user;

  if (!isReady) {
    return <div>Loading...</div>;
  }

  return (
    <Router>
      <div className="App">
        {isAuthenticated && <Navbar onMenuClick={() => setShowSidebar(!showSidebar)} />}
        {isAuthenticated && <Sidebar isOpen={showSidebar} onClose={() => setShowSidebar(false)} />}
        
        <Routes>
          {/* Unauthenticated routes - Chat for auth */}
          {!isAuthenticated && (
            <>
              <Route path="/" element={<ConversationalChat />} />
              <Route path="/chat" element={<ConversationalChat />} />
              <Route path="*" element={<ConversationalChat />} />
            </>
          )}

          {/* Authenticated routes - Social media */}
          {isAuthenticated && (
            <>
              <Route path="/" element={<Home />} />
              <Route path="/home" element={<Home />} />
              <Route path="/communities" element={<Communities />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/chat" element={<ChatPage />} />
              <Route path="/conversational" element={<ConversationalHome />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </>
          )}
        </Routes>
      </div>
    </Router>
  );
}

export default App;
