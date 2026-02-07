import React from 'react';
import ChatThreadsList from '../components/ChatThreadsList';
import ChatDetail from '../components/ChatDetail';
import './Chat.css';

const Chat = () => {
  return (
    <div className="chat-page">
      <div className="chat-container">
        <ChatThreadsList />
        <ChatDetail />
      </div>
    </div>
  );
};

export default Chat;
