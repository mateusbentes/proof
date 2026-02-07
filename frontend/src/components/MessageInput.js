import React, { useState, useRef, useEffect } from 'react';
import { useChatStore } from '../store/chatStore';

const MessageInput = () =&gt; {
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const { activeThreadId, sendMessage } = useChatStore();
  const inputRef = useRef(null);
  const fileInputRef = useRef(null);

  const handleSubmit = async (e) =&gt; {
    e.preventDefault();
    if (!text.trim() || !activeThreadId || sending) return;

    setSending(true);
    try {
      await sendMessage(activeThreadId, { text: text.trim() });
      setText('');
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setSending(false);
    }
  };

  const handleImageUpload = (e) =&gt; {
    const file = e.target.files[0];
    if (file &amp;&amp; activeThreadId) {
      sendMessage(activeThreadId, { image: file });
    }
  };

  useEffect(() =&gt; {
    inputRef.current?.focus();
  }, [activeThreadId]);

  if (!activeThreadId) return null;

  return (
    &lt;form className="message-input-container" onSubmit={handleSubmit}&gt;
      &lt;button
        type="button"
        className="image-upload-btn"
        onClick={() =&gt; fileInputRef.current?.click()}
        disabled={sending}
        title="Send image"
      &gt;
        📷
      &lt;/button&gt;
      &lt;input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        style={{ display: 'none' }}
      /&gt;
      &lt;input
        ref={inputRef}
        type="text"
        value={text}
        onChange={(e) =&gt; setText(e.target.value)}
        placeholder="Type a message..."
        className="message-input"
        disabled={sending}
        maxLength={1000}
      /&gt;
      &lt;button type="submit" className="send-btn" disabled={!text.trim() || sending}&gt;
        {sending ? '...' : 'Send'}
      &lt;/button&gt;
    &lt;/form&gt;
  );
};

export default MessageInput;
