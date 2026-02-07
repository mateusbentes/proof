part of 'chat_bloc.dart';

abstract class ChatState extends Equatable {
  const ChatState();

  @override
  List<Object?> get props => [];
}

class ChatInitial extends ChatState {
  const ChatInitial();
}

class ChatLoading extends ChatState {
  const ChatLoading();
}

class ThreadsLoaded extends ChatState {
  final List<ChatThread> threads;

  const ThreadsLoaded({required this.threads});

  @override
  List<Object> get props => [threads];
}

class MessagesLoaded extends ChatState {
  final String threadId;
  final List<ChatMessage> messages;

  const MessagesLoaded({
    required this.threadId,
    required this.messages,
  });

  @override
  List<Object> get props => [threadId, messages];
}

class MessageSent extends ChatState {
  final String threadId;
  final ChatMessage message;

  const MessageSent({
    required this.threadId,
    required this.message,
  });

  @override
  List<Object> get props => [threadId, message];
}

class ThreadCreated extends ChatState {
  final ChatThread thread;

  const ThreadCreated({required this.thread});

  @override
  List<Object> get props => [thread];
}

class ChatError extends ChatState {
  final String message;

  const ChatError({required this.message});

  @override
  List<Object> get props => [message];
}
