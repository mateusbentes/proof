import React, { useEffect } from 'react';
import { useChatStore } from '../store/chatStore';
import './ChatThreadsList.css';

function ChatThreadsList() {
  const { threads, selectedThread, setSelectedThread, loadThreads, loading } = useChatStore();

  useEffect(() => {
    loadThreads();
  }, [loadThreads]);

  if (loading) {
    return <div className="threads-list loading">Loading conversations...</div>;
  }

  return (
    <div className="threads-list">
      <div className="threads-header">
        <h2>Messages</h2>
        <button className="new-chat-btn">+</button>
      </div>
      <div className="threads-container">
        {threads.length === 0 ? (
          <div className="no-threads">No conversations yet</div>
        ) : (
          threads.map((thread) => (
            <div
              key={thread.id}
              className={`thread-item ${selectedThread?.id === thread.id ? 'active' : ''}`}
              onClick={() => setSelectedThread(thread)}
            >
              <div className="thread-avatar">
                {thread.getDisplayName('current_user_id')[0].toUpperCase()}
              </div>
              <div className="thread-info">
                <div className="thread-name">{thread.getDisplayName('current_user_id')}</div>
                <div className="thread-preview">{thread.lastMessage || 'No messages'}</div>
              </div>
              {thread.unreadCount > 0 && (
                <div className="unread-badge">{thread.unreadCount}</div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default ChatThreadsList;
