import React from 'react';
import { formatDistanceToNow } from 'date-fns';

const ChatBubble = ({ message }) =&gt; {
  const isOwn = message.senderId === 'current-user'; // Assuming current user identifier
  const timeAgo = formatDistanceToNow(new Date(message.createdAt), { addSuffix: true });

  return (
    &lt;div className={`message-bubble ${isOwn ? 'own' : 'other'}`} key={message.id}&gt;
      {!isOwn &amp;&amp; (
        &lt;div className="message-avatar"&gt;
          {message.sender?.avatar ? (
            &lt;img src={message.sender.avatar} alt={message.sender.name} /&gt;
          ) : (
            &lt;div className="avatar-placeholder"&gt;
              {message.sender?.name?.charAt(0).toUpperCase() || 'U'}
            &lt;/div&gt;
          )}
        &lt;/div&gt;
      )}
      &lt;div className={`bubble-content ${isOwn ? 'own' : 'other'}`}&gt;
        {message.text &amp;&amp; (
          &lt;div className="message-text"&gt;{message.text}&lt;/div&gt;
        )}
        {message.image &amp;&amp; (
          &lt;img src={message.image} alt="Shared image" className="message-image" /&gt;
        )}
        &lt;div className="message-time"&gt;{timeAgo}&lt;/div&gt;
      &lt;/div&gt;
    &lt;/div&gt;
  );
};

export default ChatBubble;
