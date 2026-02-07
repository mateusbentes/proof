import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:equatable/equatable.dart';
import 'dart:math';

abstract class ChatEvent extends Equatable {
  @override
  List&lt;Object&gt; get props =&gt; [];
}

class ChatMessageSent extends ChatEvent {
  final String message;
  ChatMessageSent(this.message);
  @override
  List&lt;Object&gt; get props =&gt; [message];
}

class ChatCommand extends ChatEvent {
  final String command;
  ChatCommand(this.command);
  @override
  List&lt;Object&gt; get props =&gt; [command];
}

class ChatState extends Equatable {
  final List&lt;Map&lt;String, String&gt;&gt; messages;
  final bool isAuthenticated;
  final String? userId;
  final String? currentCommunity;

  const ChatState({
    this.messages = const [],
    this.isAuthenticated = false,
    this.userId,
    this.currentCommunity,
  });

  ChatState copyWith({
    List&lt;Map&lt;String, String&gt;&gt;? messages,
    bool? isAuthenticated,
    String? userId,
    String? currentCommunity,
  }) {
    return ChatState(
      messages: messages ?? this.messages,
      isAuthenticated: isAuthenticated ?? this.isAuthenticated,
      userId: userId ?? this.userId,
      currentCommunity: currentCommunity ?? this.currentCommunity,
    );
  }

  @override
  List&lt;Object?&gt; get props =&gt; [
    messages,
    isAuthenticated,
    userId,
    currentCommunity,
  ];
}

class ChatBloc extends Bloc&lt;ChatEvent, ChatState&gt; {
  ChatBloc() : super(ChatState()) {
    on&lt;ChatMessageSent&gt;(_onMessageSent);
    on&lt;ChatCommand&gt;(_onCommand);
  }

  void _onMessageSent(ChatMessageSent event, Emitter&lt;ChatState&gt; emit) {
    final newMessages = [
      ...state.messages,
      {'role': 'user', 'content': event.message},
    ];

    emit(state.copyWith(messages: newMessages));

    // Simulate AI response with command parsing
    Future.delayed(Duration(milliseconds: 800), () {
      final response = _parseCommand(event.message);
      add(ChatMessageSent(response));
    });
  }

  void _onCommand(ChatCommand event, Emitter&lt;ChatState&gt; emit) {
    final response = _parseCommand(event.command);
    final newMessages = [
      ...state.messages,
      {'role': 'user', 'content': event.command},
      {'role': 'assistant', 'content': response},
    ];
    emit(state.copyWith(messages: newMessages));
  }

  String _parseCommand(String input) {
    if (!state.isAuthenticated) {
      if (input.toLowerCase().contains('login') || 
          input.toLowerCase().contains('register') ||
          input.toLowerCase().contains('sign')) {
        return '✅ Authenticated successfully! Welcome to AI Chat Social.\\n\\nAvailable commands:\\n/communities - Browse communities\\n/join &lt;name&gt; - Join community\\n/posts - View posts\\n/profile - Your profile\\n/settings - Account settings\\n/chat &lt;user&gt; - DM someone\\n\\nOr just chat with me! 😊';
      }
      return '👋 Hello! Please login or register first.\\nJust type "login", "register", or "sign up" to get started!';
    }

    input = input.toLowerCase().trim();

    if (input == '/communities') {
      return '🌐 **Popular Communities:**\\n• Flutter Devs (5.2k members)\\n• AI Enthusiasts (12.3k)\\n• Mobile Makers (8.7k)\\n• Dart Developers (3.1k)\\n\\n💡 Use `/join Flutter Devs` to join any community!';
    }
    else if (input.startsWith('/join ')) {
      final name = input.substring(6).trim();
      return '✅ Successfully joined **$name** community!\\n\\nNow try `/posts` to see community posts.';
    }
    else if (input == '/posts') {
      return '📝 **Recent Posts:**\\n• "Best Flutter state management" by @dev123\\n• "AI-powered mobile apps" by @ai_guru\\n• "Material 3 design tips" by @designer\\n\\n✨ Use `/create post` to share your own!';
    }
    else if (input.startsWith('/create post ')) {
      final postContent = input.substring(13);
      return '✅ **Post created successfully!**\\n\\n"$postContent"\\n\\n👍 12 likes • 3 comments • 2h ago';
    }
    else if (input == '/create post') {
      return '✨ **Post created!**\\n"Your thoughts have been shared with the community."\\n\\n💬 5 likes • 2 comments';
    }
    else if (input == '/profile') {
      return '👤 **Your Profile:**\\n\\n@yourusername\\nJoined: Today\\nPosts: 3\\nFollowers: 42 • Following: 28\\n\\n📱 iOS • Flutter Developer\\n\\n🔧 `/settings` to update profile';
    }
    else if (input == '/settings') {
      return '⚙️ **Settings:**\\n\\n• 👤 Account Settings\\n• 🛡️ Privacy & Safety\\n• 🔔 Notifications\\n• 🎨 Appearance\\n• 🚪 Logout (/logout)\\n\\nTap any option or use commands!';
    }
    else if (input.startsWith('/chat ')) {
      final user = input.substring(6).trim();
      return '💬 **Direct Message Started:**\\n\\nHey @$user! 👋\\n\\nType your message below...';
    }
    else if (input == '/logout') {
      return '👋 **Logged out successfully!**\\n\\nType "login" or "register" to sign back in.';
    }
    else if (input.startsWith('/')) {
      return '❓ **Unknown command.**\\n\\nAvailable commands:\\n• /communities\\n• /join &lt;name&gt;\\n• /posts\\n• /profile\\n• /settings\\n• /chat &lt;user&gt;\\n• /logout';
    }

    // Normal conversational response
    return _generateAIResponse(input);
  }

  String _generateAIResponse(String input) {
    final responses = [
      "That's a great point! What specifically interests you about that?",
      "Interesting perspective! Have you tried implementing that in Flutter?",
      "I love that idea! Need any code examples or design suggestions?",
      "Perfect! Flutter makes that super easy. Want to see some sample code?",
      "Absolutely! AI + mobile development is such an exciting space right now.",
      "Good question! Let me break that down for you...",
    ];
    return responses[Random().nextInt(responses.length)];
  }
}
