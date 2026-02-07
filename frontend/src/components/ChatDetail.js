import React from 'react';
import { useChatStore } from '../store/chatStore';
import ChatBubble from './ChatBubble';
import MessageInput from './MessageInput';

const ChatDetail = () =&gt; {
  const {
    activeThreadId,
    messages,
    loadingMessages,
    error,
    fetchMessages,
    sendMessage
  } = useChatStore();

  React.useEffect(() =&gt; {
    if (activeThreadId) {
      fetchMessages(activeThreadId);
    }
  }, [activeThreadId, fetchMessages]);

  if (!activeThreadId) {
    return (
      &lt;div className="chat-detail"&gt;
        &lt;div className="no-chat-selected"&gt;
          &lt;h3&gt;Select a conversation&lt;/h3&gt;
          &lt;p&gt;Choose a conversation from the list to start chatting&lt;/p&gt;
        &lt;/div&gt;
      &lt;/div&gt;
    );
  }

  return (
    &lt;div className="chat-detail"&gt;
      {loadingMessages &amp;&amp; messages.length === 0 ? (
        &lt;div className="loading"&gt;Loading messages...&lt;/div&gt;
      ) : error ? (
        &lt;div className="error"&gt;
          &lt;p&gt;{error}&lt;/p&gt;
          &lt;button onClick={() =&gt; fetchMessages(activeThreadId)}&gt;Retry&lt;/button&gt;
        &lt;/div&gt;
      ) : (
        &lt;&gt;
          &lt;div className="messages-container"&gt;
            {messages.map((message) =&gt; (
              &lt;ChatBubble key={message.id} message={message} /&gt;
            ))}
          &lt;/div&gt;
          &lt;MessageInput /&gt;
        &lt;/&gt;
      )}
    &lt;/div&gt;
  );
};

export default ChatDetail;
