import 'package:dio/dio.dart';
import '../config/api_config.dart';
import '../models/chat_thread_model.dart';
import '../models/chat_message_model.dart';

class ChatService {
  static final ChatService _instance = ChatService._internal();

  factory ChatService() {
    return _instance;
  }

  ChatService._internal();

  Future<List<ChatThread>> getThreads({int limit = 20, int offset = 0}) async {
    try {
      final response = await ApiConfig.dio.get(
        '/chat/threads',
        queryParameters: {'limit': limit, 'offset': offset},
      );

      final threads = (response.data['threads'] as List)
          .map((t) => ChatThread.fromJson(t))
          .toList();

      return threads;
    } on DioException catch (e) {
      print('Error fetching threads: ${e.message}');
      return [];
    }
  }

  Future<List<ChatMessage>> getMessages(
    String threadId, {
    int limit = 50,
    int offset = 0,
  }) async {
    try {
      final response = await ApiConfig.dio.get(
        '/chat/threads/$threadId/messages',
        queryParameters: {'limit': limit, 'offset': offset},
      );

      final messages = (response.data['messages'] as List)
          .map((m) => ChatMessage.fromJson(m))
          .toList();

      return messages;
    } on DioException catch (e) {
      print('Error fetching messages: ${e.message}');
      return [];
    }
  }

  Future<ChatMessage?> sendMessage(String threadId, String content) async {
    try {
      final response = await ApiConfig.dio.post(
        '/chat/threads/$threadId/messages',
        data: {'content': content},
      );

      return ChatMessage.fromJson(response.data);
    } on DioException catch (e) {
      print('Error sending message: ${e.message}');
      return null;
    }
  }

  Future<ChatThread?> createThread({
    required String threadType,
    required List<String> participantIds,
    String? title,
  }) async {
    try {
      final response = await ApiConfig.dio.post(
        '/chat/threads',
        data: {
          'thread_type': threadType,
          'participant_ids': participantIds,
          'title': title,
        },
      );

      return ChatThread.fromJson(response.data);
    } on DioException catch (e) {
      print('Error creating thread: ${e.message}');
      return null;
    }
  }

  Future<bool> markAsRead(String threadId) async {
    try {
      await ApiConfig.dio.post('/chat/threads/$threadId/read');
      return true;
    } on DioException catch (e) {
      print('Error marking as read: ${e.message}');
      return false;
    }
  }

  Future<bool> leaveThread(String threadId) async {
    try {
      await ApiConfig.dio.delete('/chat/threads/$threadId');
      return true;
    } on DioException catch (e) {
      print('Error leaving thread: ${e.message}');
      return false;
    }
  }

  Future<bool> registerDevice(String deviceToken, String platform) async {
    try {
      await ApiConfig.dio.post(
        '/chat/devices',
        data: {
          'device_token': deviceToken,
          'platform': platform,
        },
      );
      return true;
    } on DioException catch (e) {
      print('Error registering device: ${e.message}');
      return false;
    }
  }
}
