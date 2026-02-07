import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:equatable/equatable.dart';
import 'package:uuid/uuid.dart';
import '../models/chat_thread_model.dart';
import '../models/chat_message_model.dart';
import '../services/chat_service.dart';
import '../services/socket_service.dart';

part 'chat_event.dart';
part 'chat_state.dart';

class ChatBloc extends Bloc<ChatEvent, ChatState> {
  final ChatService _chatService = ChatService();
  final SocketService _socketService = SocketService();

  ChatBloc() : super(const ChatInitial()) {
    on<LoadThreadsEvent>(_onLoadThreads);
    on<LoadMessagesEvent>(_onLoadMessages);
    on<SendMessageEvent>(_onSendMessage);
    on<CreateThreadEvent>(_onCreateThread);
    on<MarkAsReadEvent>(_onMarkAsRead);
    on<ReceiveMessageEvent>(_onReceiveMessage);

    _setupSocketListeners();
  }

  void _setupSocketListeners() {
    _socketService.on('message:new', (data) {
      if (data is Map) {
        add(ReceiveMessageEvent(
          threadId: data['threadId'],
          message: data,
        ));
      }
    });
  }

  Future<void> _onLoadThreads(
    LoadThreadsEvent event,
    Emitter<ChatState> emit,
  ) async {
    emit(const ChatLoading());

    try {
      final threads = await _chatService.getThreads();
      emit(ThreadsLoaded(threads: threads));
    } catch (e) {
      emit(ChatError(message: 'Failed to load threads: $e'));
    }
  }

  Future<void> _onLoadMessages(
    LoadMessagesEvent event,
    Emitter<ChatState> emit,
  ) async {
    emit(const ChatLoading());

    try {
      _socketService.joinThread(event.threadId);
      final messages = await _chatService.getMessages(event.threadId);
      emit(MessagesLoaded(threadId: event.threadId, messages: messages));
    } catch (e) {
      emit(ChatError(message: 'Failed to load messages: $e'));
    }
  }

  Future<void> _onSendMessage(
    SendMessageEvent event,
    Emitter<ChatState> emit,
  ) async {
    try {
      const uuid = Uuid();
      final clientMessageId = uuid.v4();

      _socketService.sendMessage(
        event.threadId,
        event.content,
        clientMessageId,
      );

      final message = await _chatService.sendMessage(
        event.threadId,
        event.content,
      );

      if (message != null) {
        emit(MessageSent(threadId: event.threadId, message: message));
      }
    } catch (e) {
      emit(ChatError(message: 'Failed to send message: $e'));
    }
  }

  Future<void> _onCreateThread(
    CreateThreadEvent event,
    Emitter<ChatState> emit,
  ) async {
    try {
      final thread = await _chatService.createThread(
        threadType: event.threadType,
        participantIds: event.participantIds,
        title: event.title,
      );

      if (thread != null) {
        emit(ThreadCreated(thread: thread));
      }
    } catch (e) {
      emit(ChatError(message: 'Failed to create thread: $e'));
    }
  }

  Future<void> _onMarkAsRead(
    MarkAsReadEvent event,
    Emitter<ChatState> emit,
  ) async {
    try {
      await _chatService.markAsRead(event.threadId);
    } catch (e) {
      emit(ChatError(message: 'Failed to mark as read: $e'));
    }
  }

  Future<void> _onReceiveMessage(
    ReceiveMessageEvent event,
    Emitter<ChatState> emit,
  ) async {
    if (state is MessagesLoaded) {
      final currentState = state as MessagesLoaded;
      if (currentState.threadId == event.threadId) {
        final message = ChatMessage.fromJson(event.message);
        final updatedMessages = [...currentState.messages, message];
        emit(MessagesLoaded(
          threadId: event.threadId,
          messages: updatedMessages,
        ));
      }
    }
  }
}
