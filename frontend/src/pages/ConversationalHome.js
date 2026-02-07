import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { apiClient } from '../api/client';
import './ConversationalHome.css';

function ConversationalHome() {
  const navigate = useNavigate();
  const { token, setToken, setUser } = useAuthStore();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [stage, setStage] = useState('welcome'); // welcome, register, login, auth, profile, complete
  const [userData, setUserData] = useState({
    username: '',
    email: '',
    password: '',
    displayName: '',
    bio: '',
    avatarPrompt: '',
  });
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Redirect if already logged in
  useEffect(() => {
    if (token) {
      navigate('/communities');
    }
  }, [token, navigate]);

  // Initialize with welcome message
  useEffect(() => {
    const welcomeMsg = {
      id: 1,
      sender: 'bot',
      text: "👋 Welcome to Proof! I'm your onboarding assistant. I'll help you register, login, and set up your profile. Would you like to:\n\n1️⃣ Create a new account\n2️⃣ Login to existing account",
      timestamp: new Date(),
    };
    setMessages([welcomeMsg]);
  }, []);

  const addMessage = (sender, text) => {
    const newMessage = {
      id: messages.length + 1,
      sender,
      text,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const handleWelcomeChoice = async (choice) => {
    addMessage('user', choice === '1' ? 'Create a new account' : 'Login to existing account');

    if (choice === '1') {
      setStage('register');
      addMessage('bot', "Great! Let's create your account. What username would you like? (3-20 characters, letters and numbers only)");
    } else {
      setStage('login');
      addMessage('bot', "Welcome back! What's your email address?");
    }
  };

  const handleRegisterFlow = async (userInput) => {
    const currentData = userData;

    if (!currentData.username) {
      // Get username
      if (userInput.length < 3 || userInput.length > 20) {
        addMessage('bot', '❌ Username must be 3-20 characters. Try again:');
        return;
      }
      setUserData({ ...currentData, username: userInput });
      addMessage('user', userInput);
      addMessage('bot', 'Nice! Now, what email address would you like to use?');
      return;
    }

    if (!currentData.email) {
      // Get email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(userInput)) {
        addMessage('bot', '❌ Please enter a valid email address:');
        return;
      }
      setUserData({ ...currentData, email: userInput });
      addMessage('user', userInput);
      addMessage('bot', 'Great! Now create a password (at least 8 characters):');
      return;
    }

    if (!currentData.password) {
      // Get password
      if (userInput.length < 8) {
        addMessage('bot', '❌ Password must be at least 8 characters. Try again:');
        return;
      }
      setUserData({ ...currentData, password: userInput });
      addMessage('user', '••••••••');
      addMessage('bot', '⏳ Creating your account...');
      setLoading(true);

      try {
        // Register user
        const registerResponse = await apiClient.post('/auth/register', {
          username: currentData.username,
          email: userInput,
          password: userInput,
        });

        if (registerResponse.status === 201) {
          const { userId, sessionId } = registerResponse.data;
          setUserData(prev => ({ ...prev, userId, sessionId }));
          setStage('auth');
          addMessage('bot', '✅ Account created! Now let\'s complete your profile verification.\n\nTell me: What\'s your experience with open-source software?');
        } else {
          addMessage('bot', `❌ Registration failed: ${registerResponse.data.error}`);
        }
      } catch (error) {
        addMessage('bot', `❌ Error: ${error.message}`);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleLoginFlow = async (userInput) => {
    const currentData = userData;

    if (!currentData.email) {
      // Get email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(userInput)) {
        addMessage('bot', '❌ Please enter a valid email address:');
        return;
      }
      setUserData({ ...currentData, email: userInput });
      addMessage('user', userInput);
      addMessage('bot', 'Now, what\'s your password?');
      return;
    }

    if (!currentData.password) {
      // Get password and login
      setUserData({ ...currentData, password: userInput });
      addMessage('user', '••••••••');
      addMessage('bot', '⏳ Logging you in...');
      setLoading(true);

      try {
        const loginResponse = await apiClient.post('/auth/login', {
          email: currentData.email,
          password: userInput,
        });

        if (loginResponse.status === 200) {
          const { token: newToken, user } = loginResponse.data;
          setToken(newToken);
          setUser(user);
          setUserData(prev => ({ ...prev, userId: user.id }));
          setStage('profile');
          addMessage('bot', `✅ Welcome back, ${user.username}! Let's update your profile.\n\nWhat's your display name?`);
        } else {
          addMessage('bot', `❌ Login failed: ${loginResponse.data.error}`);
          setStage('login');
          setUserData({ email: '', password: '' });
        }
      } catch (error) {
        addMessage('bot', `❌ Error: ${error.message}`);
        setStage('login');
        setUserData({ email: '', password: '' });
      } finally {
        setLoading(false);
      }
    }
  };

  const handleAuthFlow = async (userInput) => {
    const currentData = userData;
    const authResponses = [
      'experience with open-source software',
      'open-source projects',
      'ideal avatar',
    ];

    const currentQuestion = Object.keys(currentData).filter(
      key => ['displayName', 'bio', 'avatarPrompt'].includes(key) && !currentData[key]
    ).length;

    if (currentQuestion === 0) {
      // First auth question - about open-source
      setUserData({ ...currentData, bio: userInput });
      addMessage('user', userInput);
      addMessage('bot', 'Great! What open-source projects have you contributed to?');
      return;
    }

    if (currentQuestion === 1) {
      // Second auth question - projects
      setUserData(prev => ({ ...prev, bio: prev.bio + ' ' + userInput }));
      addMessage('user', userInput);
      addMessage('bot', 'Excellent! Now, what\'s your display name?');
      setStage('profile');
      return;
    }
  };

  const handleProfileFlow = async (userInput) => {
    const currentData = userData;

    if (!currentData.displayName) {
      // Get display name
      setUserData({ ...currentData, displayName: userInput });
      addMessage('user', userInput);
      addMessage('bot', 'Nice! Tell me about yourself (your bio):');
      return;
    }

    if (!currentData.avatarPrompt) {
      // Get bio
      setUserData({ ...currentData, bio: userInput });
      addMessage('user', userInput);
      addMessage('bot', 'Perfect! Describe your ideal avatar (e.g., "A robot with a friendly smile"):');
      return;
    }

    // Get avatar prompt and complete
    setUserData({ ...currentData, avatarPrompt: userInput });
    addMessage('user', userInput);
    addMessage('bot', '⏳ Setting up your profile...');
    setLoading(true);

    try {
      const token = useAuthStore.getState().token;
      
      // Update profile
      await apiClient.put(
        `/users/${currentData.userId}/profile`,
        {
          displayName: currentData.displayName,
          bio: currentData.bio,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Generate avatar
      await apiClient.post(
        `/users/${currentData.userId}/avatar`,
        { prompt: userInput },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setStage('complete');
      addMessage('bot', `✅ All done, ${currentData.displayName}! Your profile is ready.\n\n🎉 Welcome to Proof! You can now:\n\n👥 Join communities\n💬 Start conversations\n🎨 Customize your profile\n\nLet's explore! 🚀`);
    } catch (error) {
      addMessage('bot', `❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userInput = input.trim();
    setInput('');

    if (stage === 'welcome') {
      handleWelcomeChoice(userInput === '1' ? '1' : '2');
    } else if (stage === 'register') {
      await handleRegisterFlow(userInput);
    } else if (stage === 'login') {
      await handleLoginFlow(userInput);
    } else if (stage === 'auth') {
      await handleAuthFlow(userInput);
    } else if (stage === 'profile') {
      await handleProfileFlow(userInput);
    } else if (stage === 'complete') {
      navigate('/communities');
    }
  };

  const handleQuickChoice = (choice) => {
    setInput(choice);
    setTimeout(() => {
      const form = document.querySelector('.chat-input-form');
      if (form) form.dispatchEvent(new Event('submit', { bubbles: true }));
    }, 0);
  };

  return (
    <div className="conversational-home">
      <div className="chat-container">
        <div className="chat-messages">
          {messages.map(msg => (
            <div key={msg.id} className={`message message-${msg.sender}`}>
              <div className="message-content">
                {msg.sender === 'bot' && <span className="bot-avatar">🤖</span>}
                <div className="message-text">{msg.text}</div>
                {msg.sender === 'user' && <span className="user-avatar">👤</span>}
              </div>
            </div>
          ))}
          {loading && (
            <div className="message message-bot">
              <div className="message-content">
                <span className="bot-avatar">🤖</span>
                <div className="message-text typing">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="chat-input-area">
          {stage === 'welcome' && (
            <div className="quick-choices">
              <button
                className="choice-btn"
                onClick={() => handleQuickChoice('1')}
              >
                1️⃣ Create new account
              </button>
              <button
                className="choice-btn"
                onClick={() => handleQuickChoice('2')}
              >
                2️⃣ Login
              </button>
            </div>
          )}

          {stage === 'complete' && (
            <div className="quick-choices">
              <button
                className="choice-btn"
                onClick={() => navigate('/communities')}
              >
                🚀 Explore Communities
              </button>
              <button
                className="choice-btn"
                onClick={() => navigate('/profile')}
              >
                👤 View Profile
              </button>
            </div>
          )}

          {stage !== 'welcome' && stage !== 'complete' && (
            <form className="chat-input-form" onSubmit={handleSubmit}>
              <input
                type={stage === 'login' && userData.password ? 'password' : 'text'}
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="Type your response..."
                disabled={loading}
                autoFocus
              />
              <button type="submit" disabled={loading || !input.trim()}>
                {loading ? '⏳' : '→'}
              </button>
            </form>
          )}
        </div>
      </div>

      <div className="chat-info">
        <h2>Proof</h2>
        <p>A human-centric community platform</p>
        <ul className="info-list">
          <li>✅ No bots. No spam.</li>
          <li>✅ Real conversations only.</li>
          <li>✅ Privacy first.</li>
          <li>✅ Decentralized.</li>
        </ul>
      </div>
    </div>
  );
}

export default ConversationalHome;
