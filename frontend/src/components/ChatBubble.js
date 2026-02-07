import React from 'react';
import './ChatBubble.css';

function ChatBubble({ message, isCurrentUser = false }) {
  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className={`chat-bubble ${isCurrentUser ? 'own' : 'other'}`}>
      {!isCurrentUser && (
        <div className="bubble-avatar">
          {message.username[0].toUpperCase()}
        </div>
      )}
      <div className="bubble-content">
        {!isCurrentUser && <div className="bubble-name">{message.username}</div>}
        <div className="bubble-message">{message.content}</div>
        <div className="bubble-time">{formatTime(message.createdAt)}</div>
      </div>
    </div>
  );
}

export default ChatBubble;
