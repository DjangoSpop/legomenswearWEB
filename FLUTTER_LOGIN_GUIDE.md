# Flutter Login & Role-Based Navigation Guide

This guide shows how to handle user login and role-based navigation in your Flutter app.

---

## ✅ Login Response Format

When a user logs in, the API returns **JWT tokens + complete user data including role**:

### Login Endpoint
```
POST https://lego-menswear-backend-abf196114bd9.herokuapp.com/api/token/
```

### Request Body
```json
{
  "username": "seller1",
  "password": "securepass123"
}
```

### Response (200 OK)
```json
{
  "access": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "username": "seller1",
    "email": "seller1@example.com",
    "role": "seller",
    "shopname": "Elite Menswear",
    "shopdes": "Premium clothing for modern gentlemen",
    "first_name": "John",
    "last_name": "Doe",
    "created_at": "2026-01-31T12:00:00Z",
    "updated_at": "2026-01-31T12:00:00Z"
  }
}
```

**Key Fields:**
- ✅ `access` - Access token (expires in 1 day)
- ✅ `refresh` - Refresh token (expires in 7 days)
- ✅ `user.role` - **"buyer", "seller", or "admin"** ← Use this for navigation!
- ✅ `user.id` - User UUID
- ✅ `user.shopname` - Shop name (for sellers)
- ✅ `user.shopdes` - Shop description (for sellers)

---

## 🎯 Flutter Implementation

### 1. Login Model

```dart
// lib/models/login_response.dart

class LoginResponse {
  final String accessToken;
  final String refreshToken;
  final User user;

  LoginResponse({
    required this.accessToken,
    required this.refreshToken,
    required this.user,
  });

  factory LoginResponse.fromJson(Map<String, dynamic> json) {
    return LoginResponse(
      accessToken: json['access'] as String,
      refreshToken: json['refresh'] as String,
      user: User.fromJson(json['user'] as Map<String, dynamic>),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'access': accessToken,
      'refresh': refreshToken,
      'user': user.toJson(),
    };
  }
}
```

### 2. User Model (with Role)

```dart
// lib/models/user.dart

class User {
  final String id;
  final String username;
  final String email;
  final String role;  // "buyer", "seller", or "admin"
  final String? shopName;
  final String? shopDescription;
  final String? firstName;
  final String? lastName;

  User({
    required this.id,
    required this.username,
    required this.email,
    required this.role,
    this.shopName,
    this.shopDescription,
    this.firstName,
    this.lastName,
  });

  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      id: json['id'] as String,
      username: json['username'] as String,
      email: json['email'] as String,
      role: json['role'] as String,
      // Backend uses snake_case for shop fields
      shopName: json['shopname'] as String?,
      shopDescription: json['shopdes'] as String?,
      firstName: json['first_name'] as String?,
      lastName: json['last_name'] as String?,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'username': username,
      'email': email,
      'role': role,
      'shopname': shopName,
      'shopdes': shopDescription,
      'first_name': firstName,
      'last_name': lastName,
    };
  }

  // Helper methods
  bool get isBuyer => role == 'buyer';
  bool get isSeller => role == 'seller';
  bool get isAdmin => role == 'admin';
  bool get canManageProducts => isSeller || isAdmin;
}
```

### 3. Login Service

```dart
// lib/services/auth_service.dart

import 'dart:convert';
import 'package:http/http.dart' as http;
import '../models/login_response.dart';
import '../models/user.dart';
import '../config/api_config.dart';

class AuthService {
  static const String loginUrl = '${ApiConfig.baseUrl}/api/token/';
  static const String refreshUrl = '${ApiConfig.baseUrl}/api/token/refresh/';

  /// Login user and return tokens + user data with role
  Future<LoginResponse> login(String username, String password) async {
    try {
      final response = await http.post(
        Uri.parse(loginUrl),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'username': username,
          'password': password,
        }),
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        return LoginResponse.fromJson(data);
      } else {
        final error = jsonDecode(response.body);
        throw Exception(error['detail'] ?? 'Login failed');
      }
    } catch (e) {
      throw Exception('Login error: $e');
    }
  }

  /// Refresh access token
  Future<String> refreshToken(String refreshToken) async {
    try {
      final response = await http.post(
        Uri.parse(refreshUrl),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({'refresh': refreshToken}),
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        return data['access'] as String;
      } else {
        throw Exception('Token refresh failed');
      }
    } catch (e) {
      throw Exception('Refresh error: $e');
    }
  }
}
```

### 4. Storage Service (Save Tokens & User)

```dart
// lib/services/storage_service.dart

import 'package:shared_preferences/shared_preferences.dart';
import 'dart:convert';
import '../models/user.dart';

class StorageService {
  static const String _accessTokenKey = 'access_token';
  static const String _refreshTokenKey = 'refresh_token';
  static const String _userKey = 'user_data';

  /// Save login data
  Future<void> saveLoginData({
    required String accessToken,
    required String refreshToken,
    required User user,
  }) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_accessTokenKey, accessToken);
    await prefs.setString(_refreshTokenKey, refreshToken);
    await prefs.setString(_userKey, jsonEncode(user.toJson()));
  }

  /// Get access token
  Future<String?> getAccessToken() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString(_accessTokenKey);
  }

  /// Get refresh token
  Future<String?> getRefreshToken() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString(_refreshTokenKey);
  }

  /// Get user data
  Future<User?> getUser() async {
    final prefs = await SharedPreferences.getInstance();
    final userJson = prefs.getString(_userKey);
    if (userJson != null) {
      return User.fromJson(jsonDecode(userJson));
    }
    return null;
  }

  /// Clear all data (logout)
  Future<void> clearAll() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.clear();
  }

  /// Check if user is logged in
  Future<bool> isLoggedIn() async {
    final token = await getAccessToken();
    return token != null;
  }
}
```

### 5. Login Screen with Role-Based Navigation

```dart
// lib/screens/login_screen.dart

import 'package:flutter/material.dart';
import '../services/auth_service.dart';
import '../services/storage_service.dart';
import '../models/user.dart';

class LoginScreen extends StatefulWidget {
  @override
  _LoginScreenState createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _formKey = GlobalKey<FormState>();
  final _usernameController = TextEditingController();
  final _passwordController = TextEditingController();
  final _authService = AuthService();
  final _storageService = StorageService();
  bool _isLoading = false;

  @override
  void dispose() {
    _usernameController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  Future<void> _login() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() => _isLoading = true);

    try {
      // Login and get response with user role
      final loginResponse = await _authService.login(
        _usernameController.text.trim(),
        _passwordController.text,
      );

      // Save tokens and user data
      await _storageService.saveLoginData(
        accessToken: loginResponse.accessToken,
        refreshToken: loginResponse.refreshToken,
        user: loginResponse.user,
      );

      // Navigate based on user role
      _navigateBasedOnRole(loginResponse.user);

    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Login failed: $e')),
      );
    } finally {
      setState(() => _isLoading = false);
    }
  }

  void _navigateBasedOnRole(User user) {
    // Clear the navigation stack and navigate based on role
    if (user.role == 'seller' || user.role == 'admin') {
      // Navigate to seller/admin dashboard
      Navigator.of(context).pushReplacementNamed('/seller-dashboard');
    } else if (user.role == 'buyer') {
      // Navigate to buyer home
      Navigator.of(context).pushReplacementNamed('/buyer-home');
    } else {
      // Unknown role - navigate to default home
      Navigator.of(context).pushReplacementNamed('/home');
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('Login')),
      body: Padding(
        padding: EdgeInsets.all(16.0),
        child: Form(
          key: _formKey,
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              TextFormField(
                controller: _usernameController,
                decoration: InputDecoration(labelText: 'Username'),
                validator: (value) =>
                    value?.isEmpty ?? true ? 'Required' : null,
              ),
              SizedBox(height: 16),
              TextFormField(
                controller: _passwordController,
                decoration: InputDecoration(labelText: 'Password'),
                obscureText: true,
                validator: (value) =>
                    value?.isEmpty ?? true ? 'Required' : null,
              ),
              SizedBox(height: 24),
              ElevatedButton(
                onPressed: _isLoading ? null : _login,
                child: _isLoading
                    ? CircularProgressIndicator()
                    : Text('Login'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
```

### 6. App Router with Role-Based Routes

```dart
// lib/router/app_router.dart

import 'package:flutter/material.dart';
import '../screens/login_screen.dart';
import '../screens/buyer_home_screen.dart';
import '../screens/seller_dashboard_screen.dart';
import '../services/storage_service.dart';

class AppRouter {
  static final StorageService _storage = StorageService();

  static Route<dynamic> generateRoute(RouteSettings settings) {
    switch (settings.name) {
      case '/':
        return MaterialPageRoute(
          builder: (_) => FutureBuilder(
            future: _checkAuthAndNavigate(),
            builder: (context, snapshot) {
              if (snapshot.connectionState == ConnectionState.waiting) {
                return Scaffold(
                  body: Center(child: CircularProgressIndicator()),
                );
              }
              return snapshot.data as Widget;
            },
          ),
        );

      case '/login':
        return MaterialPageRoute(builder: (_) => LoginScreen());

      case '/buyer-home':
        return MaterialPageRoute(builder: (_) => BuyerHomeScreen());

      case '/seller-dashboard':
        return MaterialPageRoute(builder: (_) => SellerDashboardScreen());

      default:
        return MaterialPageRoute(
          builder: (_) => Scaffold(
            body: Center(child: Text('Route not found')),
          ),
        );
    }
  }

  static Future<Widget> _checkAuthAndNavigate() async {
    final isLoggedIn = await _storage.isLoggedIn();

    if (!isLoggedIn) {
      return LoginScreen();
    }

    // Get user and navigate based on role
    final user = await _storage.getUser();

    if (user == null) {
      return LoginScreen();
    }

    // Navigate based on role
    if (user.role == 'seller' || user.role == 'admin') {
      return SellerDashboardScreen();
    } else {
      return BuyerHomeScreen();
    }
  }
}
```

---

## 🎯 Role-Based Features

### Check User Role in Widgets

```dart
// Example: Show/hide features based on role

FutureBuilder<User?>(
  future: StorageService().getUser(),
  builder: (context, snapshot) {
    final user = snapshot.data;

    if (user == null) {
      return LoginButton();
    }

    // Show different UI based on role
    if (user.isSeller || user.isAdmin) {
      return Column(
        children: [
          AddProductButton(),
          ManageProductsButton(),
          ViewOrdersButton(),
        ],
      );
    } else {
      return Column(
        children: [
          BrowseProductsButton(),
          MyOrdersButton(),
        ],
      );
    }
  },
)
```

---

## 📊 User Roles & Permissions

| Role | Can View Products | Can Add Products | Can Edit Products | Can Delete Products | Can Place Orders |
|------|------------------|------------------|-------------------|---------------------|------------------|
| **buyer** | ✅ Yes | ❌ No | ❌ No | ❌ No | ✅ Yes |
| **seller** | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Yes |
| **admin** | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Yes |

---

## 🧪 Test Login with Different Roles

### Test Buyer Login
```bash
curl -X POST https://lego-menswear-backend-abf196114bd9.herokuapp.com/api/token/ \
  -H "Content-Type: application/json" \
  -d '{"username":"buyer1","password":"password123"}'
```

**Response includes:** `"role": "buyer"`

### Test Seller Login
```bash
curl -X POST https://lego-menswear-backend-abf196114bd9.herokuapp.com/api/token/ \
  -H "Content-Type: application/json" \
  -d '{"username":"seller1","password":"password123"}'
```

**Response includes:** `"role": "seller"` + `shopname` + `shopdes`

### Test Admin Login
```bash
curl -X POST https://lego-menswear-backend-abf196114bd9.herokuapp.com/api/token/ \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

**Response includes:** `"role": "admin"`

---

## ✅ Summary

**Your login endpoint already returns:**
- ✅ Access token
- ✅ Refresh token
- ✅ Complete user data
- ✅ **User role** ("buyer", "seller", "admin")
- ✅ Shop information (for sellers)

**Flutter app should:**
1. Call `/api/token/` with username/password
2. Extract `user.role` from response
3. Save tokens and user data in SharedPreferences
4. Navigate to appropriate screen based on role
5. Use role to show/hide features

---

**Login endpoint is ready! Use the code examples above in your Flutter app! 🚀**
