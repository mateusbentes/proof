# Proof Flutter Mobile App

Native mobile application for Proof platform built with Flutter.

## Features

- ✅ Real-time messaging (Socket.IO)
- ✅ Push notifications (Firebase Cloud Messaging)
- ✅ Direct messages (DMs)
- ✅ Group chats
- ✅ User authentication (JWT)
- ✅ Offline message persistence
- ✅ Typing indicators
- ✅ Unread message counts
- ✅ Material 3 design

## Prerequisites

- Flutter 3.0+
- Dart 3.0+
- iOS 14.0+ (for iOS)
- Android 8.0+ (for Android)
- Firebase project setup

## Setup

### 1. Install Flutter

```bash
# macOS
brew install flutter

# Or download from https://flutter.dev/docs/get-started/install
```

### 2. Clone Repository

```bash
git clone https://github.com/mateusbentes/proof.git
cd proof/mobile/flutter
```

### 3. Install Dependencies

```bash
flutter pub get
```

### 4. Configure Firebase

#### iOS
```bash
cd ios
pod install
cd ..
```

#### Android
- Download `google-services.json` from Firebase Console
- Place in `android/app/`

### 5. Update API Configuration

Edit `lib/config/api_config.dart`:
```dart
static const String baseUrl = 'http://YOUR_API_URL:3001/api';
```

### 6. Update Socket Configuration

Edit `lib/config/socket_config.dart`:
```dart
static const String socketUrl = 'http://YOUR_API_URL:3001';
```

### 7. Update Firebase Options

Edit `lib/firebase_options.dart` with your Firebase credentials.

## Development

### Run on iOS Simulator

```bash
flutter run -d "iPhone 15"
```

### Run on Android Emulator

```bash
flutter run -d emulator-5554
```

### Run on Physical Device

```bash
flutter run
```

### Build Runner (for JSON serialization)

```bash
flutter pub run build_runner build
```

## Building for Production

### iOS

```bash
flutter build ios --release
```

Then open in Xcode:
```bash
open ios/Runner.xcworkspace
```

### Android

```bash
flutter build apk --release
flutter build appbundle --release
```

## Project Structure

```
lib/
├── main.dart                 # App entry point
├── config/
│   ├── api_config.dart      # API configuration
│   └── socket_config.dart   # Socket.IO configuration
├── models/
│   ├── user_model.dart
│   ├── chat_thread_model.dart
│   ├── chat_message_model.dart
│   └── chat_participant_model.dart
├── services/
│   ├── auth_service.dart
│   ├── chat_service.dart
│   ├── socket_service.dart
│   └── push_notification_service.dart
├── bloc/
│   ├── auth_bloc.dart
│   ├── auth_event.dart
│   ├── auth_state.dart
│   ├── chat_bloc.dart
│   ├── chat_event.dart
│   └── chat_state.dart
├── screens/
│   ├── login_screen.dart
│   ├── chat_threads_screen.dart
│   └── chat_detail_screen.dart
└── widgets/
    ├── chat_bubble.dart
    ├── message_input.dart
    ├── typing_indicator.dart
    └── thread_list_item.dart
```

## Architecture

### State Management
- **BLoC Pattern** for state management
- **flutter_bloc** for reactive programming
- **Equatable** for value equality

### Networking
- **Dio** for HTTP requests
- **Socket.IO** for real-time messaging
- **Firebase Messaging** for push notifications

### Local Storage
- **SharedPreferences** for token persistence
- **JSON serialization** for model persistence

## Testing

### Unit Tests

```bash
flutter test
```

### Integration Tests

```bash
flutter test integration_test/
```

## Troubleshooting

### Socket.IO Connection Issues

1. Check API URL in `lib/config/socket_config.dart`
2. Ensure backend is running
3. Check firewall settings
4. Verify CORS configuration on backend

### Firebase Issues

1. Verify Firebase project ID
2. Check `google-services.json` (Android)
3. Check `GoogleService-Info.plist` (iOS)
4. Ensure Firebase credentials are valid

### Build Issues

```bash
# Clean build
flutter clean
flutter pub get
flutter pub run build_runner build

# Rebuild
flutter run
```

## Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/your-feature`
3. Commit changes: `git commit -am 'Add feature'`
4. Push to branch: `git push origin feature/your-feature`
5. Submit pull request

## License

MIT License - See LICENSE.md for details

## Support

- **Issues**: GitHub Issues
- **Discussions**: GitHub Discussions
- **Documentation**: See README.md in root directory

---

**Proof Mobile App - Open Source, Community-Driven, MIT Licensed**
