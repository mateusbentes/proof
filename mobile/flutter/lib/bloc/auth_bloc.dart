import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:equatable/equatable.dart';
import '../models/user_model.dart';
import '../services/auth_service.dart';

part 'auth_event.dart';
part 'auth_state.dart';

class AuthBloc extends Bloc<AuthEvent, AuthState> {
  final AuthService _authService = AuthService();

  AuthBloc() : super(const AuthInitial()) {
    on<CheckAuthStatusEvent>(_onCheckAuthStatus);
    on<LoginEvent>(_onLogin);
    on<RegisterEvent>(_onRegister);
    on<LogoutEvent>(_onLogout);
  }

  Future<void> _onCheckAuthStatus(
    CheckAuthStatusEvent event,
    Emitter<AuthState> emit,
  ) async {
    emit(const AuthLoading());
    
    final isAuthenticated = await _authService.checkAuthStatus();
    
    if (isAuthenticated) {
      final result = await _authService.getProfile();
      if (result['success']) {
        emit(AuthAuthenticated(user: result['user']));
      } else {
        emit(const AuthUnauthenticated());
      }
    } else {
      emit(const AuthUnauthenticated());
    }
  }

  Future<void> _onLogin(
    LoginEvent event,
    Emitter<AuthState> emit,
  ) async {
    emit(const AuthLoading());
    
    final result = await _authService.login(event.email, event.password);
    
    if (result['success']) {
      emit(AuthAuthenticated(user: result['user']));
    } else {
      emit(AuthError(message: result['error']));
    }
  }

  Future<void> _onRegister(
    RegisterEvent event,
    Emitter<AuthState> emit,
  ) async {
    emit(const AuthLoading());
    
    final result = await _authService.register(event.email, event.password);
    
    if (result['success']) {
      emit(const AuthUnauthenticated());
    } else {
      emit(AuthError(message: result['error']));
    }
  }

  Future<void> _onLogout(
    LogoutEvent event,
    Emitter<AuthState> emit,
  ) async {
    await _authService.logout();
    emit(const AuthUnauthenticated());
  }
}
