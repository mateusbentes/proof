import 'package:json_annotation/json_annotation.dart';

part 'chat_message_model.g.dart';

@JsonSerializable()
class ChatMessage {
  final String id;
  @JsonKey(name: 'sender_id')
  final String senderId;
  final String username;
  @JsonKey(name: 'avatar_url')
  final String? avatarUrl;
  final String content;
  @JsonKey(name: 'created_at')
  final DateTime createdAt;
  @JsonKey(name: 'edited_at')
  final DateTime? editedAt;
  @JsonKey(name: 'deleted_at')
  final DateTime? deletedAt;
  @JsonKey(name: 'client_message_id')
  final String? clientMessageId;

  ChatMessage({
    required this.id,
    required this.senderId,
    required this.username,
    this.avatarUrl,
    required this.content,
    required this.createdAt,
    this.editedAt,
    this.deletedAt,
    this.clientMessageId,
  });

  factory ChatMessage.fromJson(Map<String, dynamic> json) =>
      _$ChatMessageFromJson(json);
  Map<String, dynamic> toJson() => _$ChatMessageToJson(this);

  bool get isDeleted => deletedAt != null;
}
