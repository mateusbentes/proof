import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { apiClient } from '../api/client';
import './AIConversationalHome.css';

function AIConversationalHome() {
  const navigate = useNavigate();
  const { token, setToken, setUser } = useAuthStore();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [stage, setStage] = useState('greeting'); // greeting, conversation, analysis, creation, complete
  const [userProfile, setUserProfile] = useState({
    username: '',
    email: '',
    displayName: '',
    bio: '',
    avatarPrompt: '',
    conversationHistory: [],
  });
  const [conversationCount, setConversationCount] = useState(0);
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

  // Initialize with greeting
  useEffect(() => {
    const greetingMsg = {
      id: 1,
      sender: 'bot',
      text: "👋 Welcome to Proof! I'm an AI assistant. Just chat with me naturally about yourself, your interests, and your experience. I'll learn who you are and create your account automatically. No passwords needed!\n\nLet's start: Tell me about yourself and what brings you here?",
      timestamp: new Date(),
    };
    setMessages([greetingMsg]);
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

  const analyzeUserProfile = async (conversationHistory) => {
    try {
      setLoading(true);
      addMessage('bot', '🤖 Analyzing your profile...');

      // Call AI analysis endpoint
      const analysisResponse = await apiClient.post('/ai/analyze-profile', {
        conversationHistory,
      });

      if (analysisResponse.status === 200) {
        const analysis = analysisResponse.data;
        
        setUserProfile(prev => ({
          ...prev,
          displayName: analysis.displayName || 'Community Member',
          bio: analysis.bio || 'Passionate about open-source and community',
          avatarPrompt: analysis.avatarPrompt || 'A friendly avatar',
          username: analysis.username,
          email: analysis.email,
        }));

        addMessage('bot', `✨ I've analyzed our conversation!\n\nI think you're: ${analysis.displayName}\n\nBio: ${analysis.bio}\n\nAvatar: ${analysis.avatarPrompt}\n\nLet me create your account...`);
        
        setStage('creation');
        await createAccountFromAnalysis(analysis);
      }
    } catch (error) {
      addMessage('bot', `❌ Analysis error: ${error.message}`);
      setLoading(false);
    }
  };

  const createAccountFromAnalysis = async (analysis) => {
    try {
      // Create account with AI-generated data
      const registerResponse = await apiClient.post('/auth/ai-register', {
        username: analysis.username,
        email: analysis.email,
        displayName: analysis.displayName,
        bio: analysis.bio,
        avatarPrompt: analysis.avatarPrompt,
        conversationAnalysis: analysis,
      });

      if (registerResponse.status === 201) {
        const { token: newToken, user } = registerResponse.data;
        
        setToken(newToken);
        setUser(user);
        
        setStage('complete');
        addMessage('bot', `🎉 Welcome, ${analysis.displayName}!\n\n✅ Your account has been created automatically!\n✅ Your profile is set up\n✅ Your avatar is being generated\n\nYou're all set to explore communities! 🚀`);
        
        // Redirect after 2 seconds
        setTimeout(() => {
          navigate('/communities');
        }, 2000);
      }
    } catch (error) {
      addMessage('bot', `❌ Account creation failed: ${error.message}`);
      setLoading(false);
    }
  };

  const handleUserMessage = async (userInput) => {
    addMessage('user', userInput);
    setConversationCount(prev => prev + 1);

    // Store conversation
    const updatedHistory = [
      ...userProfile.conversationHistory,
      { role: 'user', content: userInput },
    ];
    setUserProfile(prev => ({
      ...prev,
      conversationHistory: updatedHistory,
    }));

    // After 3-5 messages, analyze and create account
    if (conversationCount >= 2) {
      setLoading(true);
      addMessage('bot', '💭 Let me understand you better...');
      
      setTimeout(() => {
        analyzeUserProfile(updatedHistory);
      }, 1000);
    } else {
      // Continue conversation
      setLoading(true);
      
      try {
        const conversationResponse = await apiClient.post('/ai/continue-conversation', {
          conversationHistory: updatedHistory,
          messageCount: conversationCount,
        });

        if (conversationResponse.status === 200) {
          const botResponse = conversationResponse.data.response;
          addMessage('bot', botResponse);
        }
      } catch (error) {
        addMessage('bot', `I'm having trouble understanding. Could you tell me more about yourself?`);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userInput = input.trim();
    setInput('');

    if (stage === 'greeting' || stage === 'conversation') {
      handleUserMessage(userInput);
    } else if (stage === 'complete') {
      navigate('/communities');
    }
  };

  return (
    <div className="ai-conversational-home">
      <div className="chat-container">
        <div className="chat-header">
          <h2>🤖 AI Onboarding Assistant</h2>
          <p>No passwords. No forms. Just conversation.</p>
        </div>

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
          {stage !== 'complete' && (
            <form className="chat-input-form" onSubmit={handleSubmit}>
              <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="Just chat naturally..."
                disabled={loading}
                autoFocus
              />
              <button type="submit" disabled={loading || !input.trim()}>
                {loading ? '⏳' : '→'}
              </button>
            </form>
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
                👤 View My Profile
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="chat-info">
        <h2>Proof</h2>
        <p>Revolutionary Social Network</p>
        <ul className="info-list">
          <li>🤖 AI-Powered Onboarding</li>
          <li>🔓 No Passwords Needed</li>
          <li>💬 Just Chat Naturally</li>
          <li>✨ Auto-Profile Creation</li>
          <li>🎨 AI Avatar Generation</li>
          <li>🔒 Privacy First</li>
        </ul>
        
        <div className="progress-section">
          <h3>Conversation Progress</h3>
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${Math.min((conversationCount / 3) * 100, 100)}%` }}
            ></div>
          </div>
          <p className="progress-text">
            {conversationCount < 3 
              ? `${3 - conversationCount} more messages to analyze` 
              : 'Analyzing your profile...'}
          </p>
        </div>
      </div>
    </div>
  );
}

export default AIConversationalHome;
