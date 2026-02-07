# Quick Start - Chat & Mobile Apps

Get the chat system and Flutter mobile app running in 30 minutes.

## Prerequisites

- Node.js 16+
- PostgreSQL 13+
- Flutter 3.0+
- Firebase account
- Docker (optional)

## 🚀 30-Minute Setup

### Step 1: Backend Database (5 min)

```bash
# Connect to PostgreSQL
psql -h localhost -U proof -d proof_db

# Run migration
\i backend/db/chat_migration.sql

# Verify tables created
\dt chat_*
```

### Step 2: Backend Dependencies (3 min)

```bash
cd backend
npm install socket.io firebase-admin
```

### Step 3: Environment Configuration (2 min)

Add to `backend/.env`:
```
# Firebase (get from Firebase Console)
FIREBASE_CREDENTIALS='{"type":"service_account","project_id":"...","private_key":"..."}'

# Socket.IO CORS
SOCKET_IO_CORS_ORIGIN=http://localhost:3000
```

### Step 4: Start Backend (1 min)

```bash
cd backend
npm run dev
```

You should see:
```
✓ Database connected
✓ Socket.IO initialized
✓ Server running on http://localhost:3001
```

### Step 5: Flutter Setup (10 min)

```bash
cd mobile/flutter

# Install dependencies
flutter pub get

# Configure Firebase
# 1. Go to https://console.firebase.google.com
# 2. Create new project
# 3. Add iOS and Android apps
# 4. Download credentials:
#    - iOS: GoogleService-Info.plist → ios/Runner/
#    - Android: google-services.json → android/app/

# Update configuration
# Edit lib/config/api_config.dart
# Change: static const String baseUrl = 'http://YOUR_IP:3001/api';

# Edit lib/config/socket_config.dart
# Change: static const String socketUrl = 'http://YOUR_IP:3001';

# Edit lib/firebase_options.dart
# Add your Firebase credentials
```

### Step 6: Run Mobile App (4 min)

```bash
# iOS Simulator
flutter run -d "iPhone 15"

# OR Android Emulator
flutter run -d emulator-5554

# OR Physical Device
flutter run
```

## ✅ Verify Everything Works

### Test Backend API

```bash
# Get auth token first
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password"}'

# List chat threads
curl -X GET http://localhost:3001/api/chat/threads \
  -H "Authorization: Bearer YOUR_TOKEN"

# Create a chat thread
curl -X POST http://localhost:3001/api/chat/threads \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "thread_type":"dm",
    "participant_ids":["user-id-2"]
  }'
```

### Test Mobile App

1. **Login Screen**
   - Enter email and password
   - Click Login or Register

2. **Chat Threads Screen**
   - Should show list of conversations
   - Click on a thread to open chat

3. **Chat Detail Screen**
   - Type a message
   - Click send button
   - Message should appear in real-time

4. **Push Notifications**
   - Send message from another device
   - Should receive notification

## 🔧 Common Issues & Fixes

### "Connection refused" on mobile

**Problem**: App can't connect to backend
**Solution**: 
```bash
# Get your machine's IP
ifconfig | grep "inet " | grep -v 127.0.0.1

# Update in lib/config/api_config.dart
static const String baseUrl = 'http://192.168.1.X:3001/api';
```

### Firebase credentials error

**Problem**: "Invalid Firebase credentials"
**Solution**:
1. Go to Firebase Console
2. Project Settings → Service Accounts
3. Generate new private key
4. Copy JSON and paste in `.env`

### Socket.IO not connecting

**Problem**: Real-time messages not working
**Solution**:
1. Check backend is running: `curl http://localhost:3001/health`
2. Check firewall allows port 3001
3. Verify Socket.IO CORS in `.env`

### Database migration failed

**Problem**: "relation already exists"
**Solution**:
```bash
# Drop existing tables (careful!)
psql -h localhost -U proof -d proof_db
DROP TABLE IF EXISTS chat_messages CASCADE;
DROP TABLE IF EXISTS chat_thread_participants CASCADE;
DROP TABLE IF EXISTS chat_threads CASCADE;
DROP TABLE IF EXISTS user_devices CASCADE;

# Re-run migration
\i backend/db/chat_migration.sql
```

## 📱 Testing Checklist

- [ ] Backend starts without errors
- [ ] Database tables created
- [ ] Mobile app installs
- [ ] Can login/register
- [ ] Can see chat threads
- [ ] Can send message
- [ ] Message appears in real-time
- [ ] Can receive push notification
- [ ] Typing indicator works
- [ ] Unread count updates

## 🎯 Next Steps

1. **Customize Branding**
   - Update app name in `pubspec.yaml`
   - Update colors in `lib/main.dart`
   - Add app icon

2. **Add More Features**
   - Group chat creation
   - User search
   - Message reactions
   - File sharing

3. **Deploy**
   - Backend: Docker or cloud
   - Mobile: App Store & Google Play

4. **Monitor**
   - Set up error tracking
   - Monitor Socket.IO connections
   - Track push notification delivery

## 📚 Full Documentation

- **Backend**: See `IMPLEMENTATION_GUIDE.md`
- **Mobile**: See `mobile/flutter/README.md`
- **API Reference**: See `IMPLEMENTATION_GUIDE.md` → API Endpoints
- **Architecture**: See `CHAT_AND_MOBILE_IMPLEMENTATION.md`

## 🆘 Need Help?

1. Check troubleshooting in `IMPLEMENTATION_GUIDE.md`
2. Review backend logs: `docker logs proof-backend`
3. Check mobile logs: `flutter logs`
4. Open GitHub issue with error details

## 🎉 You're Done!

Your Proof platform now has:
- ✅ Real-time chat (DMs & groups)
- ✅ Push notifications
- ✅ Native mobile apps (iOS & Android)
- ✅ Production-ready backend

**Start building! 🚀**

---

**Questions?** Check the full documentation or open an issue on GitHub.
