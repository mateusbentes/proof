import 'package:dio/dio.dart';
import '../config/api_config.dart';
import '../models/user_model.dart';

class AuthService {
  static final AuthService _instance = AuthService._internal();

  factory AuthService() {
    return _instance;
  }

  AuthService._internal();

  Future<Map<String, dynamic>> login(String email, String password) async {
    try {
      final response = await ApiConfig.dio.post(
        '/auth/login',
        data: {
          'email': email,
          'password': password,
        },
      );

      final token = response.data['token'];
      final user = User.fromJson(response.data['user']);

      await ApiConfig.setToken(token);
      await ApiConfig.setUser(user.id);

      return {'success': true, 'user': user, 'token': token};
    } on DioException catch (e) {
      return {
        'success': false,
        'error': e.response?.data['error'] ?? 'Login failed'
      };
    }
  }

  Future<Map<String, dynamic>> register(String email, String password) async {
    try {
      final response = await ApiConfig.dio.post(
        '/auth/register',
        data: {
          'email': email,
          'password': password,
        },
      );

      return {'success': true, 'userId': response.data['userId']};
    } on DioException catch (e) {
      return {
        'success': false,
        'error': e.response?.data['error'] ?? 'Registration failed'
      };
    }
  }

  Future<Map<String, dynamic>> getProfile() async {
    try {
      final response = await ApiConfig.dio.get('/users/profile');
      final user = User.fromJson(response.data);
      return {'success': true, 'user': user};
    } on DioException catch (e) {
      return {
        'success': false,
        'error': e.response?.data['error'] ?? 'Failed to fetch profile'
      };
    }
  }

  Future<bool> checkAuthStatus() async {
    final token = ApiConfig.getToken();
    if (token == null) return false;

    try {
      await ApiConfig.dio.get('/users/profile');
      return true;
    } catch (e) {
      await ApiConfig.clearToken();
      return false;
    }
  }

  Future<void> logout() async {
    await ApiConfig.clearToken();
  }
}
