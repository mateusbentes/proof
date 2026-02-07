import React, { useEffect, useState } from 'react';
import { useChatStore } from '../store/chatStore';
import apiClient from '../api/client';
import './ChatThreadsList.css';

function ChatThreadsList() {
  const { threads, selectedThread, setSelectedThread, loadThreads, loading } = useChatStore();
  const [bots, setBots] = useState([]);
  const [botsLoading, setBotsLoading] = useState(false);

  useEffect(() => {
    loadThreads();
    loadBots();
  }, [loadThreads]);

  const loadBots = async () => {
    setBotsLoading(true);
    try {
      const response = await apiClient.get('/bots');
      setBots(response.data.bots || []);
    } catch (error) {
      console.error('Failed to load bots:', error);
    } finally {
      setBotsLoading(false);
    }
  };

  const handleBotClick = (bot) => {
    const botThread = {
      id: bot.id,
      thread_type: 'bot',
      title: bot.name,
      bot_id: bot.id,
      avatar: bot.avatar,
      description: bot.description,
      getDisplayName: () => bot.name,
    };
    setSelectedThread(botThread);
  };

  const handleNewChat = () => {
    // Show a simple prompt to get username
    const username = prompt('Enter username to start a conversation:');
    if (username && username.trim()) {
      // Create a temporary thread object for new conversation
      const newThread = {
        id: `temp-${Date.now()}`,
        thread_type: 'dm',
        title: username,
        participants: [{ username, avatar_url: null }],
        lastMessage: 'New conversation',
        unreadCount: 0,
        getDisplayName: () => username,
      };
      setSelectedThread(newThread);
    }
  };

  if (loading || botsLoading) {
    return <div className="threads-list loading">Loading conversations...</div>;
  }

  return (
    <div className="threads-list">
      <div className="threads-header">
        <h2>Messages</h2>
        <button className="new-chat-btn" onClick={handleNewChat}>+</button>
      </div>
      <div className="threads-container">
        {/* Bots Section */}
        {bots.length > 0 && (
          <>
            <div className="threads-section-header">Bots</div>
            {bots.map((bot) => (
              <div
                key={bot.id}
                className={`thread-item bot-thread ${selectedThread?.id === bot.id ? 'active' : ''}`}
                onClick={() => handleBotClick(bot)}
              >
                <div className="thread-avatar bot">{bot.avatar || '🤖'}</div>
                <div className="thread-info">
                  <div className="thread-name">{bot.name}</div>
                  <div className="thread-preview">{bot.description || 'Chat with AI'}</div>
                </div>
              </div>
            ))}
          </>
        )}

        {/* Users Section */}
        {threads.length > 0 && <div className="threads-section-header">Conversations</div>}
        {threads.length === 0 && bots.length === 0 ? (
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
