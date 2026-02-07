import 'package:json_annotation/json_annotation.dart';
import 'chat_participant_model.dart';

part 'chat_thread_model.g.dart';

@JsonSerializable()
class ChatThread {
  final String id;
  @JsonKey(name: 'thread_type')
  final String threadType;
  final String? title;
  @JsonKey(name: 'created_at')
  final DateTime createdAt;
  @JsonKey(name: 'updated_at')
  final DateTime updatedAt;
  @JsonKey(name: 'unread_count')
  final int unreadCount;
  final List<ChatParticipant>? participants;
  @JsonKey(name: 'last_message')
  final String? lastMessage;

  ChatThread({
    required this.id,
    required this.threadType,
    this.title,
    required this.createdAt,
    required this.updatedAt,
    this.unreadCount = 0,
    this.participants,
    this.lastMessage,
  });

  factory ChatThread.fromJson(Map<String, dynamic> json) =>
      _$ChatThreadFromJson(json);
  Map<String, dynamic> toJson() => _$ChatThreadToJson(this);

  String getDisplayName(String currentUserId) {
    if (threadType == 'group') {
      return title ?? 'Group Chat';
    }
    
    if (participants != null && participants!.isNotEmpty) {
      final otherParticipant = participants!
          .firstWhere((p) => p.id != currentUserId, orElse: () => participants!.first);
      return otherParticipant.username;
    }
    
    return 'Chat';
  }
}
