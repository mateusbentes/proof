import React from 'react';
import ChatThreadsList from '../components/ChatThreadsList';
import ChatDetail from '../components/ChatDetail';
import './Chat.css';

const Chat = () =&gt; {
  return (
    &lt;div className="chat-page"&gt;
      &lt;div className="chat-container"&gt;
        &lt;ChatThreadsList /&gt;
        &lt;ChatDetail /&gt;
      &lt;/div&gt;
    &lt;/div&gt;
  );
};

export default Chat;
