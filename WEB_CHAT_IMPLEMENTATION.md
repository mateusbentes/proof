# Web Chat Implementation - React Frontend

Complete chat functionality for the Proof web platform.

## 📋 Overview

The web chat system provides real-time messaging for the React frontend, matching the mobile app functionality with a responsive, modern UI.

## ✨ Features

### Chat Functionality
- ✅ Direct messages (DMs)
- ✅ Group chats
- ✅ Real-time messaging (Socket.IO)
- ✅ Typing indicators
- ✅ Online/offline status
- ✅ Unread message counts
- ✅ Message history with pagination
- ✅ Image sharing
- ✅ Optimistic message sending

### UI/UX
- ✅ Split-view layout (threads + messages)
- ✅ Responsive design (mobile/tablet/desktop)
- ✅ Dark mode support
- ✅ Loading states
- ✅ Error handling
- ✅ Smooth animations
- ✅ Avatar display
- ✅ Timestamps

## 📁 Files Created

### Pages (2 files)
```
frontend/src/pages/
├── Chat.js                    # Main chat page
└── Chat.css                   # Chat styling
```

### Components (4 files)
```
frontend/src/components/
├── ChatThreadsList.js         # Threads list
├── ChatDetail.js              # Message view
├── ChatBubble.js              # Message bubble
├── MessageInput.js            # Input field
├── ChatThreadsList.css        # Threads styling
├── ChatDetail.css             # Detail styling
├── ChatBubble.css             # Bubble styling
└── MessageInput.css           # Input styling
```

### Services (2 files)
```
frontend/src/services/
├── chatService.js             # Chat API
└── socketService.js           # Socket.IO
```

### State Management (1 file)
```
frontend/src/store/
└── chatStore.js               # Zustand store
```

## 🚀 Quick Start

### 1. Install Dependencies

The chat uses existing dependencies. No new packages needed:
- `axios` - Already installed
- `zustand` - Already installed
- `socket.io-client` - Add if not present

```bash
cd frontend
npm install socket.io-client
```

### 2. Update App.js

Already done! Chat route added:
```javascript
<Route path="/chat" element={token ? <Chat /> : <Navigate to="/" />} />
```

### 3. Update Navbar

Already done! Messages link added:
```javascript
<Link to="/chat" className="nav-link">
  💬 Messages
</Link>
```

### 4. Start the App

```bash
npm start
```

Visit: http://localhost:3000/chat

## 🎯 Usage

### For Users

1. **Access Chat**
   - Click "💬 Messages" in navbar
   - Or navigate to `/chat`

2. **View Conversations**
   - Left panel shows all chat threads
   - Click a thread to open conversation

3. **Send Message**
   - Type in message input
   - Click send or press Enter
   - Message appears in real-time

4. **Share Images**
   - Click image icon in input
   - Select image from device
   - Image uploads and sends

5. **See Typing**
   - See "User is typing..." indicator
   - Disappears when user stops typing

### For Developers

#### Using Chat Service

```javascript
import { chatService } from '../services/chatService';

// Get threads
const threads = await chatService.getThreads();

// Get messages
const messages = await chatService.getMessages(threadId);

// Send message
const message = await chatService.sendMessage(threadId, content);

// Create thread
const thread = await chatService.createThread({
  threadType: 'dm',
  participantIds: ['user-id'],
  title: 'Optional title'
});

// Mark as read
await chatService.markAsRead(threadId);
```

#### Using Socket Service

```javascript
import { socketService } from '../services/socketService';

// Initialize
socketService.initialize();

// Join thread
socketService.joinThread(threadId);

// Send message
socketService.sendMessage(threadId, content, clientMessageId);

// Typing indicators
socketService.startTyping(threadId);
socketService.stopTyping(threadId);

// Listen to events
socketService.on('message:new', (message) => {
  console.log('New message:', message);
});

socketService.on('typing:start', (user) => {
  console.log('User typing:', user);
});
```

#### Using Chat Store

```javascript
import { useChatStore } from '../store/chatStore';

function MyComponent() {
  const {
    threads,
    messages,
    selectedThread,
    loading,
    error,
    setSelectedThread,
    addMessage,
    updateThreads
  } = useChatStore();

  return (
    // Use store state and actions
  );
}
```

## 🏗️ Architecture

### Component Hierarchy

```
Chat (Page)
├── ChatThreadsList
│   └── ThreadListItem (for each thread)
└── ChatDetail
    ├── MessageList
    │   └── ChatBubble (for each message)
    └── MessageInput
```

### Data Flow

```
User Input
  ↓
MessageInput component
  ↓
chatStore.addMessage()
  ↓
chatService.sendMessage() (REST)
  ↓
socketService.sendMessage() (Real-time)
  ↓
Backend processes
  ↓
Socket.IO broadcasts to room
  ↓
socketService listener
  ↓
chatStore.receiveMessage()
  ↓
ChatBubble re-renders
```

### State Management

Using Zustand with persistence:

```javascript
const chatStore = create(
  persist(
    (set, get) => ({
      threads: [],
      messages: {},
      selectedThread: null,
      loading: false,
      error: null,
      
      // Actions
      setSelectedThread: (threadId) => set({ selectedThread: threadId }),
      addMessage: (threadId, message) => { /* ... */ },
      updateThreads: (threads) => set({ threads }),
      // ... more actions
    }),
    {
      name: 'chat-store',
      partialize: (state) => ({
        selectedThread: state.selectedThread
      })
    }
  )
);
```

## 🔌 API Integration

### REST Endpoints Used

```
GET    /api/chat/threads                    List threads
POST   /api/chat/threads                    Create thread
GET    /api/chat/threads/:id/messages       Get messages
POST   /api/chat/threads/:id/messages       Send message
POST   /api/chat/threads/:id/read           Mark as read
PUT    /api/chat/threads/:id                Update thread
DELETE /api/chat/threads/:id                Leave thread
POST   /api/chat/threads/:id/participants   Add participant
DELETE /api/chat/threads/:id/participants/:userId  Remove
```

### Socket.IO Events

**Client → Server**
```javascript
socket.emit('thread:join', { threadId })
socket.emit('thread:leave', { threadId })
socket.emit('message:send', { threadId, content, clientMessageId })
socket.emit('typing:start', { threadId })
socket.emit('typing:stop', { threadId })
```

**Server → Client**
```javascript
socket.on('message:new', (message) => {})
socket.on('message:ack', (ack) => {})
socket.on('typing:start', (user) => {})
socket.on('typing:stop', (user) => {})
socket.on('user:online', (user) => {})
socket.on('user:offline', (user) => {})
```

## 🎨 Styling

### CSS Files

- `Chat.css` - Main page layout
- `ChatThreadsList.css` - Threads list styling
- `ChatDetail.css` - Message view styling
- `ChatBubble.css` - Message bubble styling
- `MessageInput.css` - Input field styling

### Responsive Design

- **Desktop** (>1024px): Split view (threads + messages)
- **Tablet** (768px-1024px): Stacked with toggle
- **Mobile** (<768px): Full-width, swipeable

### Color Scheme

Uses existing Proof colors:
- Primary: `#0066cc`
- Background: `#f5f5f5`
- Text: `#333`
- Border: `#ddd`

## 🔐 Security

### Authentication
- JWT token required for all requests
- Token stored in Zustand auth store
- Automatically included in API headers

### Authorization
- Participant verification on backend
- Admin role checks for group operations
- User can only see their own threads

### Data Protection
- HTTPS in production
- Secure WebSocket (WSS)
- Input validation on backend
- SQL injection prevention

## 📱 Responsive Behavior

### Desktop (>1024px)
```
┌─────────────────────────────────┐
│ Navbar                          │
├──────────────┬──────────────────┤
│              │                  │
│  Threads     │   Messages       │
│  List        │   View           │
│              │                  │
│              │   Input          │
└──────────────┴──────────────────┘
```

### Mobile (<768px)
```
┌──────────────────────┐
│ Navbar               │
├──────────────────────┤
│ Threads List         │
│ (or Messages View)   │
│ (toggle button)      │
└──────────────────────┘
```

## 🐛 Troubleshooting

### Messages Not Sending

**Problem**: Message stuck in "sending" state
**Solution**:
1. Check network connection
2. Verify backend is running
3. Check browser console for errors
4. Refresh page and retry

### Socket.IO Not Connecting

**Problem**: Real-time updates not working
**Solution**:
1. Verify backend Socket.IO is running
2. Check firewall allows WebSocket
3. Verify CORS configuration
4. Check browser console for connection errors

### Images Not Uploading

**Problem**: Image upload fails
**Solution**:
1. Check file size (max 10MB)
2. Verify file format (jpg, png, gif)
3. Check backend storage configuration
4. Review browser console for errors

### Unread Counts Not Updating

**Problem**: Unread badge not showing
**Solution**:
1. Refresh page
2. Check Socket.IO connection
3. Verify backend is sending updates
4. Clear browser cache

## 🚀 Deployment

### Production Build

```bash
npm run build
```

### Environment Variables

Add to `.env`:
```
REACT_APP_API_URL=https://api.proof.com
REACT_APP_SOCKET_URL=https://api.proof.com
```

### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## 📊 Performance

### Optimization Tips

1. **Message Pagination**
   - Load 50 messages at a time
   - Load more on scroll up
   - Prevents memory issues

2. **Image Optimization**
   - Compress before upload
   - Use lazy loading
   - Cache in browser

3. **Socket.IO**
   - Reconnect on disconnect
   - Debounce typing indicators
   - Clean up listeners on unmount

4. **State Management**
   - Persist only necessary data
   - Clear old messages periodically
   - Use selectors for derived state

## 🧪 Testing

### Unit Tests

```bash
npm test
```

### Integration Tests

```bash
npm run test:integration
```

### Manual Testing Checklist

- [ ] Can login
- [ ] Can see chat threads
- [ ] Can open thread
- [ ] Can send message
- [ ] Message appears in real-time
- [ ] Can see typing indicator
- [ ] Can upload image
- [ ] Can mark as read
- [ ] Unread count updates
- [ ] Can create new thread
- [ ] Can leave thread
- [ ] Works on mobile
- [ ] Works on tablet
- [ ] Works on desktop

## 📚 Additional Resources

- [React Documentation](https://react.dev)
- [Socket.IO Client](https://socket.io/docs/v4/client-api/)
- [Zustand Documentation](https://github.com/pmndrs/zustand)
- [Axios Documentation](https://axios-http.com)

## 🤝 Contributing

1. Follow existing code style
2. Add tests for new features
3. Update documentation
4. Submit pull request

## 📄 License

MIT License - See LICENSE.md for details

---

**Web Chat Implementation Complete! 🎉**

For questions or issues, check the troubleshooting section or open a GitHub issue.
