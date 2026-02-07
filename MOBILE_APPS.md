# Proof Mobile Apps - Android & iOS

Complete guide for building and deploying native mobile applications for Proof platform.

## Overview

Proof mobile apps provide native experiences for Android and iOS users with the same AI-powered conversational onboarding and community features as the web platform.

## Licensing

Both mobile apps use the same dual-licensing model as the web platform:

### Android App (MIT License)
- Location: `mobile/android/`
- License: MIT
- Permissive, community-friendly
- Can be forked and modified
- Commercial use allowed

### iOS App (MIT License)
- Location: `mobile/ios/`
- License: MIT
- Permissive, community-friendly
- Can be forked and modified
- Commercial use allowed

**Note:** Mobile apps use MIT (not Apache 2.0) because:
- Mobile apps are client-side code (like frontend)
- Simpler licensing for app store distribution
- Easier for community developers
- Consistent with web frontend

---

## Technology Stack

### Android App
- **Language:** Kotlin (recommended) or Java
- **Framework:** Android Jetpack
- **UI:** Jetpack Compose (modern) or XML layouts
- **HTTP Client:** Retrofit + OkHttp
- **State Management:** ViewModel + LiveData
- **Database:** Room
- **Authentication:** JWT tokens
- **Minimum SDK:** Android 8.0 (API 26)
- **Target SDK:** Android 14+ (API 34+)

### iOS App
- **Language:** Swift
- **Framework:** SwiftUI (modern) or UIKit
- **HTTP Client:** URLSession or Alamofire
- **State Management:** Combine or SwiftUI State
- **Database:** Core Data or SQLite
- **Authentication:** JWT tokens
- **Minimum iOS:** iOS 14.0+
- **Target iOS:** iOS 17+

---

## Project Structure

```
proof/
├── mobile/
│   ├── android/
│   │   ├── app/
│   │   │   ├── src/
│   │   │   │   ├── main/
│   │   │   │   │   ├── java/com/proof/
│   │   │   │   │   │   ├── ui/
│   │   │   │   │   │   │   ├── screens/
│   │   │   │   │   │   │   │   ├── OnboardingScreen.kt
│   │   │   │   │   │   │   │   ├── ChatScreen.kt
│   │   │   │   │   │   │   │   ├── CommunitiesScreen.kt
│   │   │   │   │   │   │   │   └── ProfileScreen.kt
│   │   │   │   │   │   │   └── components/
│   │   │   │   │   │   ├── viewmodel/
│   │   │   │   │   │   │   ├── AuthViewModel.kt
│   │   │   │   │   │   │   ├── ChatViewModel.kt
│   │   │   │   │   │   │   └── CommunityViewModel.kt
│   │   │   │   │   │   ├── data/
│   │   │   │   │   │   │   ├── api/
│   │   │   │   │   │   │   │   └── ProofApiService.kt
│   │   │   │   │   │   │   ├── db/
│   │   │   │   │   │   │   │   └── ProofDatabase.kt
│   │   │   │   │   │   │   └── repository/
│   │   │   │   │   │   │       ├── AuthRepository.kt
│   │   │   │   │   │   │       └── CommunityRepository.kt
│   │   │   │   │   │   └── MainActivity.kt
│   │   │   │   │   └── res/
│   │   │   │   │       ├── layout/
│   │   │   │   │       ├── drawable/
│   │   │   │   │       └── values/
│   │   │   ├── build.gradle.kts
│   │   │   └── AndroidManifest.xml
│   │   ├── build.gradle.kts
│   │   ├── settings.gradle.kts
│   │   └── README.md
│   │
│   └── ios/
│       ├── Proof/
│       │   ├── Proof.xcodeproj/
│       │   ├── Proof/
│       │   │   ├── App/
│       │   │   │   └── ProofApp.swift
│       │   │   ├── Views/
│       │   │   │   ├── OnboardingView.swift
│       │   │   │   ├── ChatView.swift
│       │   │   │   ├── CommunitiesView.swift
│       │   │   │   └── ProfileView.swift
│       │   │   ├── ViewModels/
│       │   │   │   ├── AuthViewModel.swift
│       │   │   │   ├── ChatViewModel.swift
│       │   │   │   └── CommunityViewModel.swift
│       │   │   ├── Models/
│       │   │   │   ├── User.swift
│       │   │   │   ├── Community.swift
│       │   │   │   └── Message.swift
│       │   │   ├── Services/
│       │   │   │   ├── APIService.swift
│       │   │   │   ├── AuthService.swift
│       │   │   │   └── StorageService.swift
│       │   │   └── Assets.xcassets/
│       │   ├── ProofTests/
│       │   └── ProofUITests/
│       ├── Podfile
│       └── README.md
│
└── LICENSE.md (covers all: frontend, backend, android, ios)
```

---

## Features

### Onboarding (Conversational)
- Chat-based registration
- AI-powered authentication
- Profile setup
- Avatar generation
- Community discovery

### Communities
- Browse communities
- Join communities
- View community posts
- Community details
- Member list

### Posts & Comments
- Create posts
- Create comments
- Upvote/downvote
- View post details
- Comment threads

### User Profile
- View profile
- Edit profile
- Change avatar
- Update bio
- View activity

### Messaging (Future)
- Direct messages
- Group chats
- Notifications
- Message history

---

## Development Setup

### Android Development

#### Prerequisites
- Android Studio (latest)
- JDK 11+
- Android SDK 26+
- Kotlin 1.9+

#### Setup
```bash
# Clone repository
git clone https://github.com/mateusbentes/proof.git
cd proof/mobile/android

# Open in Android Studio
# File → Open → Select android folder

# Build
./gradlew build

# Run on emulator
./gradlew installDebug
```

#### Key Dependencies
```gradle
// Jetpack
implementation 'androidx.compose.ui:ui:1.5.0'
implementation 'androidx.lifecycle:lifecycle-viewmodel:2.6.0'

// Networking
implementation 'com.squareup.retrofit2:retrofit:2.9.0'
implementation 'com.squareup.okhttp3:okhttp:4.11.0'

// Database
implementation 'androidx.room:room-runtime:2.5.2'

// JSON
implementation 'com.google.code.gson:gson:2.10.1'
```

### iOS Development

#### Prerequisites
- Xcode 15+
- Swift 5.9+
- iOS 14.0+ deployment target
- CocoaPods or SPM

#### Setup
```bash
# Clone repository
git clone https://github.com/mateusbentes/proof.git
cd proof/mobile/ios

# Install dependencies
pod install

# Open workspace
open Proof.xcworkspace

# Build
xcodebuild -workspace Proof.xcworkspace -scheme Proof -configuration Debug

# Run on simulator
xcodebuild -workspace Proof.xcworkspace -scheme Proof -configuration Debug -destination 'platform=iOS Simulator,name=iPhone 15'
```

#### Key Dependencies
```swift
// Networking
Alamofire or URLSession

// State Management
Combine or SwiftUI

// Database
Core Data or SQLite

// JSON
Codable (built-in)
```

---

## API Integration

Both apps connect to the same backend API:

```
Base URL: https://api.proof.local/api
```

### Authentication
```
Header: Authorization: Bearer {jwt_token}
```

### Key Endpoints
```
POST   /auth/register              - Register user
POST   /auth/login                 - Login user
GET    /users/profile              - Get user profile
PUT    /users/:id/profile          - Update profile
POST   /users/:id/avatar           - Generate avatar
GET    /communities                - List communities
POST   /communities/:id/join       - Join community
GET    /communities/:id/posts      - Get posts
POST   /posts                      - Create post
POST   /posts/:id/comments         - Create comment
POST   /posts/:id/upvote           - Upvote post
```

---

## Building for Production

### Android Release Build

```bash
# Generate signing key
keytool -genkey -v -keystore proof-release.keystore \
  -keyalg RSA -keysize 2048 -validity 10000 \
  -alias proof-key

# Build release APK
./gradlew assembleRelease

# Build release AAB (for Play Store)
./gradlew bundleRelease

# Output: app/build/outputs/bundle/release/app-release.aab
```

### iOS Release Build

```bash
# Archive for App Store
xcodebuild -workspace Proof.xcworkspace \
  -scheme Proof \
  -configuration Release \
  -archivePath build/Proof.xcarchive \
  archive

# Export for App Store
xcodebuild -exportArchive \
  -archivePath build/Proof.xcarchive \
  -exportOptionsPlist ExportOptions.plist \
  -exportPath build/Release
```

---

## App Store Distribution

### Google Play Store

1. **Create Developer Account**
   - Visit: https://play.google.com/console
   - Pay $25 one-time fee
   - Complete business information

2. **Prepare App**
   - Build release AAB
   - Create app listing
   - Add screenshots (5-8)
   - Write description
   - Set privacy policy
   - Set content rating

3. **Submit for Review**
   - Upload AAB
   - Review guidelines
   - Submit for review
   - Wait 2-7 days for approval

4. **Launch**
   - Set release date
   - Monitor reviews
   - Track analytics

### Apple App Store

1. **Create Developer Account**
   - Visit: https://developer.apple.com
   - Pay $99/year
   - Complete business information
   - Set up signing certificates

2. **Prepare App**
   - Build release archive
   - Create app listing
   - Add screenshots (2-5 per device)
   - Write description
   - Set privacy policy
   - Set content rating

3. **Submit for Review**
   - Upload archive via Xcode
   - Complete app review information
   - Submit for review
   - Wait 1-3 days for approval

4. **Launch**
   - Set release date
   - Monitor reviews
   - Track analytics

---

## Testing

### Android Testing

```bash
# Unit tests
./gradlew test

# Instrumented tests
./gradlew connectedAndroidTest

# UI tests with Espresso
./gradlew connectedAndroidTest -Pandroid.testInstrumentationRunnerArguments.class=com.proof.ui.ChatScreenTest
```

### iOS Testing

```bash
# Unit tests
xcodebuild -workspace Proof.xcworkspace -scheme Proof -configuration Debug test

# UI tests
xcodebuild -workspace Proof.xcworkspace -scheme ProofUITests -configuration Debug test
```

---

## Versioning

### Version Format
```
MAJOR.MINOR.PATCH
Example: 1.0.0
```

### Release Schedule
- **Major**: Quarterly (new features)
- **Minor**: Monthly (improvements)
- **Patch**: Weekly (bug fixes)

### Version Tracking
```
Android: versionCode (integer), versionName (string)
iOS: CFBundleShortVersionString (string), CFBundleVersion (integer)
```

---

## Licensing Headers

### Android Files
```kotlin
/*
 * Proof - AI-Powered Community Platform
 * Copyright (c) 2026 Mateus Bentes
 * 
 * Licensed under the MIT License
 * See LICENSE.md for details
 */
```

### iOS Files
```swift
/*
 * Proof - AI-Powered Community Platform
 * Copyright (c) 2026 Mateus Bentes
 * 
 * Licensed under the MIT License
 * See LICENSE.md for details
 */
```

---

## Security

### Data Storage
- Encrypt sensitive data (passwords, tokens)
- Use secure storage (Keychain on iOS, Keystore on Android)
- Clear data on logout
- Implement certificate pinning

### Network Security
- Use HTTPS only
- Implement certificate pinning
- Validate SSL certificates
- Use secure headers

### Authentication
- Store JWT tokens securely
- Refresh tokens before expiry
- Clear tokens on logout
- Implement biometric authentication (optional)

---

## Performance

### Optimization Tips
- Lazy load images
- Cache API responses
- Minimize network requests
- Optimize database queries
- Use pagination for lists
- Implement infinite scroll

### Monitoring
- Track app crashes
- Monitor API response times
- Track user engagement
- Monitor battery usage
- Track data usage

---

## Roadmap

### Phase 1 (MVP)
- ✅ Onboarding (conversational)
- ✅ Communities
- ✅ Posts & Comments
- ✅ User Profile

### Phase 2 (v1.1)
- Direct messaging
- Notifications
- Push notifications
- Offline mode

### Phase 3 (v1.2)
- Advanced search
- Trending posts
- User recommendations
- Community recommendations

### Phase 4 (v2.0)
- Video support
- Live streaming
- Voice messages
- Advanced moderation

---

## Contributing

To contribute to mobile apps:

1. Fork the repository
2. Create feature branch: `git checkout -b feature/your-feature`
3. Commit changes: `git commit -am 'Add feature'`
4. Push to branch: `git push origin feature/your-feature`
5. Submit pull request

All contributions must:
- Follow code style guidelines
- Include tests
- Update documentation
- Be licensed under MIT

---

## Support

- **Issues**: GitHub Issues
- **Discussions**: GitHub Discussions
- **Documentation**: See README.md in each app folder
- **License**: MIT (see LICENSE.md)

---

## License

Both Android and iOS apps are licensed under the MIT License.

See [LICENSE.md](./LICENSE.md) for full details.

---

**Proof Mobile Apps - Open Source, Community-Driven, MIT Licensed**
