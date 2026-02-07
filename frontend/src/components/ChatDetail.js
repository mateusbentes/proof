import React, { useEffect, useRef } from 'react';
import { useChatStore } from '../store/chatStore';
import ChatBubble from './ChatBubble';
import MessageInput from './MessageInput';
import './ChatDetail.css';

function ChatDetail() {
  const { selectedThread, messages, loading, error, loadMessages, sendMessage } = useChatStore();
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (selectedThread) {
      loadMessages(selectedThread.id);
    }
  }, [selectedThread, loadMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!selectedThread) {
    return (
      <div className="chat-detail empty">
        <div className="empty-state">
          <p>Select a conversation to start chatting</p>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-detail">
      <div className="chat-header">
        <h2>{selectedThread.getDisplayName('current_user_id')}</h2>
      </div>

      <div className="messages-container">
        {loading ? (
          <div className="loading">Loading messages...</div>
        ) : error ? (
          <div className="error">{error}</div>
        ) : messages.length === 0 ? (
          <div className="no-messages">No messages yet. Start the conversation!</div>
        ) : (
          messages.map((message) => (
            <ChatBubble key={message.id} message={message} />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <MessageInput
        threadId={selectedThread.id}
        onSendMessage={(content) => sendMessage(selectedThread.id, content)}
      />
    </div>
  );
}

export default ChatDetail;
