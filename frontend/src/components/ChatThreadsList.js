import React, { useEffect } from 'react';
import { useChatStore } from '../store/chatStore';
import { formatDistanceToNow } from 'date-fns';

const ChatThreadsList = () =&gt; {
  const {
    threads,
    activeThreadId,
    fetchThreads,
    setActiveThread,
    loadingThreads
  } = useChatStore();

  useEffect(() =&gt; {
    fetchThreads();
  }, [fetchThreads]);

  const handleThreadClick = (threadId) =&gt; {
    setActiveThread(threadId);
  };

  if (loadingThreads) {
    return (
      &lt;div className="chat-threads"&gt;
        &lt;div className="loading"&gt;Loading conversations...&lt;/div&gt;
      &lt;/div&gt;
    );
  }

  return (
    &lt;div className="chat-threads"&gt;
      &lt;div className="threads-header"&gt;
        &lt;h3&gt;Conversations&lt;/h3&gt;
      &lt;/div&gt;
      &lt;div className="threads-list"&gt;
        {threads.map((thread) =&gt; (
          &lt;div
            key={thread.id}
            className={`thread-item ${activeThreadId === thread.id ? 'active' : ''}`}
            onClick={() =&gt; handleThreadClick(thread.id)}
          &gt;
            &lt;div className="thread-avatar"&gt;
              {thread.user?.avatar ? (
                &lt;img src={thread.user.avatar} alt={thread.user.name} /&gt;
              ) : (
                &lt;div className="avatar-placeholder"&gt;
                  {thread.user?.name?.charAt(0).toUpperCase() || 'U'}
                &lt;/div&gt;
              )}
            &lt;/div&gt;
            &lt;div className="thread-info"&gt;
              &lt;div className="thread-header"&gt;
                &lt;span className="thread-name"&gt;{thread.user?.name || 'Chat'}&lt;/span&gt;
                &lt;span className="thread-time"&gt;
                  {formatDistanceToNow(new Date(thread.updatedAt), { addSuffix: true })}
                &lt;/span&gt;
              &lt;/div&gt;
              &lt;div className="thread-preview"&gt;
                {thread.lastMessage?.text?.slice(0, 50) || 'No messages yet'}...
              &lt;/div&gt;
              {thread.unreadCount &gt; 0 &amp;&amp; (
                &lt;span className="unread-badge"&gt;{thread.unreadCount}&lt;/span&gt;
              )}
            &lt;/div&gt;
          &lt;/div&gt;
        ))}
      &lt;/div&gt;
    &lt;/div&gt;
  );
};

export default ChatThreadsList;
