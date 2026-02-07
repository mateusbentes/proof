import React, { useState } from 'react';
import './MessageInput.css';

function MessageInput({ threadId, onSendMessage }) {
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!message.trim()) return;

    setLoading(true);
    try {
      await onSendMessage(message);
      setMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="message-input">
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyPress={handleKeyPress}
        placeholder="Type a message..."
        disabled={loading}
        rows="3"
      />
      <button
        onClick={handleSend}
        disabled={loading || !message.trim()}
        className="send-btn"
      >
        {loading ? 'Sending...' : 'Send'}
      </button>
    </div>
  );
}

export default MessageInput;
