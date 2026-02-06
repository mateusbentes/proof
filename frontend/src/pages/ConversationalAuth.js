import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import client from '../api/client';
import './ConversationalAuth.css';

function ConversationalAuth() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const userId = location.state?.userId;

  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [botScore, setBotScore] = useState(0);
  const [status, setStatus] = useState('active');

  useEffect(() => {
    const startConversation = async () => {
      try {
        const response = await client.post('/conversations/start', { userId });
        setMessages([
          {
            sender: 'bot',
            content: response.data.message,
          },
        ]);
        setStep(response.data.step);
      } catch (error) {
        console.error('Failed to start conversation:', error);
      }
    };

    startConversation();
  }, [userId]);

  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!userInput.trim()) return;

    const newMessages = [
      ...messages,
      { sender: 'user', content: userInput },
    ];
    setMessages(newMessages);
    setUserInput('');
    setLoading(true);

    try {
      const response = await client.post('/conversations/message', {
        sessionId,
        userMessage: userInput,
      });

      newMessages.push({
        sender: 'bot',
        content: response.data.botMessage,
      });
      setMessages(newMessages);
      setStep(response.data.step);
      setBotScore(response.data.botScore);
      setStatus(response.data.status);

      if (response.data.status === 'completed') {
        setTimeout(() => {
          navigate('/profile');
        }, 2000);
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      newMessages.push({
        sender: 'bot',
        content: 'Sorry, something went wrong. Please try again.',
      });
      setMessages(newMessages);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="conversation-container">
      <div className="conversation-card">
        <div className="conversation-header">
          <h1>Verify Your Humanity</h1>
          <p>Step {step} of 3</p>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${(step / 3) * 100}%` }} />
          </div>
        </div>

        <div className="messages-container">
          {messages.map((msg, idx) => (
            <div key={idx} className={`message message-${msg.sender}`}>
              <div className="message-content">{msg.content}</div>
            </div>
          ))}
          {loading && (
            <div className="message message-bot">
              <div className="message-content typing">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          )}
        </div>

        {status === 'active' && (
          <form onSubmit={handleSendMessage} className="message-form">
            <input
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder="Type your response..."
              disabled={loading}
              autoFocus
            />
            <button type="submit" disabled={loading || !userInput.trim()}>
              Send
            </button>
          </form>
        )}

        {status === 'completed' && (
          <div className="completion-message">
            <p>✓ Verification complete! Redirecting to your profile...</p>
          </div>
        )}

        {botScore > 0.7 && (
          <div className="warning-message">
            <p>⚠️ Your responses seem generic. Please provide more detailed answers.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default ConversationalAuth;
