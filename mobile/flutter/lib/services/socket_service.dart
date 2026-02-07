import 'package:socket_io_client/socket_io_client.dart' as IO;
import '../config/socket_config.dart';
import '../models/chat_message_model.dart';

class SocketService {
  static final SocketService _instance = SocketService._internal();

  factory SocketService() {
    return _instance;
  }

  SocketService._internal();

  late IO.Socket _socket;
  final Map<String, Function> _listeners = {};

  Future<void> initialize() async {
    await SocketConfig.initialize();
    _socket = SocketConfig.socket;
    _setupListeners();
  }

  void _setupListeners() {
    _socket.on('message:new', (data) {
      final message = ChatMessage.fromJson(data);
      _notifyListeners('message:new', message);
    });

    _socket.on('typing:start', (data) {
      _notifyListeners('typing:start', data);
    });

    _socket.on('typing:stop', (data) {
      _notifyListeners('typing:stop', data);
    });

    _socket.on('user:online', (data) {
      _notifyListeners('user:online', data);
    });

    _socket.on('user:offline', (data) {
      _notifyListeners('user:offline', data);
    });

    _socket.on('message:ack', (data) {
      _notifyListeners('message:ack', data);
    });

    _socket.on('error', (data) {
      _notifyListeners('error', data);
    });
  }

  void joinThread(String threadId) {
    _socket.emit('thread:join', {'threadId': threadId});
  }

  void leaveThread(String threadId) {
    _socket.emit('thread:leave', {'threadId': threadId});
  }

  void sendMessage(String threadId, String content, String clientMessageId) {
    _socket.emit('message:send', {
      'threadId': threadId,
      'content': content,
      'clientMessageId': clientMessageId,
    });
  }

  void startTyping(String threadId) {
    _socket.emit('typing:start', {'threadId': threadId});
  }

  void stopTyping(String threadId) {
    _socket.emit('typing:stop', {'threadId': threadId});
  }

  void on(String event, Function callback) {
    _listeners[event] = callback;
  }

  void off(String event) {
    _listeners.remove(event);
  }

  void _notifyListeners(String event, dynamic data) {
    if (_listeners.containsKey(event)) {
      _listeners[event]!(data);
    }
  }

  bool get isConnected => _socket.connected;

  void disconnect() {
    SocketConfig.disconnect();
  }

  void reconnect() {
    SocketConfig.reconnect();
  }
}
