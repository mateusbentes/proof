import 'package:socket_io_client/socket_io_client.dart' as IO;
import 'api_config.dart';

class SocketConfig {
  static late IO.Socket _socket;
  static bool _isConnected = false;
  
  static const String socketUrl = 'http://localhost:3001';
  
  static Future<void> initialize() async {
    final token = ApiConfig.getToken();
    
    if (token == null) return;
    
    _socket = IO.io(
      socketUrl,
      IO.OptionBuilder()
        .setTransports(['websocket'])
        .disableAutoConnect()
        .setAuth({'token': token})
        .build(),
    );
    
    _socket.onConnect((_) {
      _isConnected = true;
      print('✓ Socket connected');
    });
    
    _socket.onDisconnect((_) {
      _isConnected = false;
      print('✗ Socket disconnected');
    });
    
    _socket.onError((error) {
      print('Socket error: $error');
    });
    
    _socket.connect();
  }
  
  static IO.Socket get socket => _socket;
  
  static bool get isConnected => _isConnected;
  
  static void disconnect() {
    if (_socket.connected) {
      _socket.disconnect();
    }
  }
  
  static void reconnect() {
    if (!_socket.connected) {
      _socket.connect();
    }
  }
}
