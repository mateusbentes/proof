part of 'chat_bloc.dart';

abstract class ChatEvent extends Equatable {
  const ChatEvent();

  @override
  List<Object?> get props => [];
}

class LoadThreadsEvent extends ChatEvent {
  const LoadThreadsEvent();
}

class LoadMessagesEvent extends ChatEvent {
  final String threadId;

  const LoadMessagesEvent({required this.threadId});

  @override
  List<Object> get props => [threadId];
}

class SendMessageEvent extends ChatEvent {
  final String threadId;
  final String content;

  const SendMessageEvent({
    required this.threadId,
    required this.content,
  });

  @override
  List<Object> get props => [threadId, content];
}

class CreateThreadEvent extends ChatEvent {
  final String threadType;
  final List<String> participantIds;
  final String? title;

  const CreateThreadEvent({
    required this.threadType,
    required this.participantIds,
    this.title,
  });

  @override
  List<Object?> get props => [threadType, participantIds, title];
}

class MarkAsReadEvent extends ChatEvent {
  final String threadId;

  const MarkAsReadEvent({required this.threadId});

  @override
  List<Object> get props => [threadId];
}

class ReceiveMessageEvent extends ChatEvent {
  final String threadId;
  final dynamic message;

  const ReceiveMessageEvent({
    required this.threadId,
    required this.message,
  });

  @override
  List<Object> get props => [threadId, message];
}
