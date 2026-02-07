import 'package:json_annotation/json_annotation.dart';

part 'chat_participant_model.g.dart';

@JsonSerializable()
class ChatParticipant {
  final String id;
  final String username;
  @JsonKey(name: 'avatar_url')
  final String? avatarUrl;
  final String? role;
  @JsonKey(name: 'joined_at')
  final DateTime? joinedAt;

  ChatParticipant({
    required this.id,
    required this.username,
    this.avatarUrl,
    this.role,
    this.joinedAt,
  });

  factory ChatParticipant.fromJson(Map<String, dynamic> json) =>
      _$ChatParticipantFromJson(json);
  Map<String, dynamic> toJson() => _$ChatParticipantToJson(this);
}
