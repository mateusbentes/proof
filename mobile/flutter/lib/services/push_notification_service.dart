import 'package:firebase_messaging/firebase_messaging.dart';
import 'chat_service.dart';

class PushNotificationService {
  static final FirebaseMessaging _firebaseMessaging =
      FirebaseMessaging.instance;

  static Future<void> initialize() async {
    try {
      final settings = await _firebaseMessaging.requestPermission(
        alert: true,
        announcement: false,
        badge: true,
        carPlay: false,
        criticalAlert: false,
        provisional: false,
        sound: true,
      );

      if (settings.authorizationStatus == AuthorizationStatus.authorized) {
        print('✓ Push notifications authorized');

        final token = await _firebaseMessaging.getToken();
        if (token != null) {
          await ChatService().registerDevice(token, 'mobile');
          print('✓ Device registered for push notifications');
        }

        FirebaseMessaging.onMessage.listen(_handleForegroundMessage);
        FirebaseMessaging.onMessageOpenedApp.listen(_handleMessageOpenedApp);
      }
    } catch (e) {
      print('Error initializing push notifications: $e');
    }
  }

  static void _handleForegroundMessage(RemoteMessage message) {
    print('Foreground message: ${message.notification?.title}');
    print('Body: ${message.notification?.body}');
    print('Data: ${message.data}');
  }

  static void _handleMessageOpenedApp(RemoteMessage message) {
    print('Message opened app: ${message.notification?.title}');
    final threadId = message.data['threadId'];
    if (threadId != null) {
      print('Navigate to thread: $threadId');
    }
  }
}
