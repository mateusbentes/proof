import 'package:dio/dio.dart';
import 'package:shared_preferences/shared_preferences.dart';

class ApiConfig {
  static late Dio _dio;
  static late SharedPreferences _prefs;
  
  static const String baseUrl = 'http://localhost:3001/api';
  
  static Future<void> initialize() async {
    _prefs = await SharedPreferences.getInstance();
    
    _dio = Dio(
      BaseOptions(
        baseUrl: baseUrl,
        connectTimeout: const Duration(seconds: 30),
        receiveTimeout: const Duration(seconds: 30),
        contentType: 'application/json',
      ),
    );
    
    _dio.interceptors.add(
      InterceptorsWrapper(
        onRequest: (options, handler) async {
          final token = getToken();
          if (token != null) {
            options.headers['Authorization'] = 'Bearer $token';
          }
          return handler.next(options);
        },
        onError: (error, handler) {
          if (error.response?.statusCode == 401) {
            clearToken();
          }
          return handler.next(error);
        },
      ),
    );
  }
  
  static Dio get dio => _dio;
  
  static String? getToken() {
    return _prefs.getString('auth_token');
  }
  
  static Future<void> setToken(String token) async {
    await _prefs.setString('auth_token', token);
  }
  
  static Future<void> clearToken() async {
    await _prefs.remove('auth_token');
  }
  
  static String? getUser() {
    return _prefs.getString('user_id');
  }
  
  static Future<void> setUser(String userId) async {
    await _prefs.setString('user_id', userId);
  }
}
