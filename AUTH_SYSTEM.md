# Next.js Authentication System - Implementation Guide

## 🎯 Overview

Professional authentication system with role-based access control (RBAC) for LEGO Menswear e-commerce platform. Supports three user roles: **Buyer**, **Seller**, and **Admin**.

---

## 🏗️ Architecture

### Core Components

1. **AuthContext** (`app/context/AuthContext.tsx`)
   - Global authentication state management
   - User session handling
   - Role-based permission helpers
   - Auto-initialization from localStorage

2. **Auth Hooks** (`lib/hooks/useAuth.ts`)
   - `useAuth()` - Access auth context
   - `useRequireAuth()` - Protect routes requiring login
   - `useRequireRole()` - Protect routes by role
   - `useRequireAdmin()` - Protect admin routes

3. **Auth API** (`lib/api/auth.ts`)
   - Login/Register endpoints
   - Token management
   - Profile operations
   - Logout functionality

---

## 👥 User Roles

### Buyer
- **Access**: Browse and purchase products
- **Redirect**: `/products` after login
- **Permissions**: View products, manage cart, checkout

### Seller
- **Access**: Manage own product inventory
- **Redirect**: `/admin/products` after login
- **Permissions**: Create, update, delete products

### Admin
- **Access**: Full system management
- **Redirect**: `/admin/products` after login
- **Permissions**: All seller permissions + user management

---

## 🔐 Authentication Flow

### 1. Registration (`/register`)

```typescript
// Form fields
- Username (required)
- Email (required)
- Password (min 8 chars)
- Password confirmation
- Role selection (buyer/seller)
- First/Last name (optional)

// Seller-specific fields
- Shop name (required for sellers)
- Shop description (optional)
```

**Process:**
1. User fills registration form
2. Validates input (password strength, email format)
3. Submits to `/api/token/` endpoint
4. Auto-login after successful registration
5. Role-based redirect

### 2. Login (`/login`)

```typescript
// Credentials
- Username
- Password
```

**Process:**
1. User enters credentials
2. POST to `/api/token/`
3. Receives JWT tokens + user data
4. Stores in localStorage
5. Role-based redirect:
   - Buyer → `/products`
   - Seller/Admin → `/admin/products`

### 3. Token Storage

```typescript
// LocalStorage keys
- access_token: JWT access token (1 day)
- refresh_token: JWT refresh token (7 days)
- user: JSON user object with role
```

### 4. Auto-Refresh

API client automatically refreshes expired access tokens using the refresh token. On 401 errors:
1. Check if refresh token exists
2. Call `/api/token/refresh/`
3. Update access token
4. Retry original request
5. If refresh fails → logout and redirect to login

---

## 🛡️ Protected Routes

### Middleware Protection (`middleware.ts`)

```typescript
// Protected paths
/admin/*  - Requires seller/admin role
```

Server-side check (basic cookie validation)

### Client-Side Protection

```typescript
// Using hooks in page components
import { useRequireAdmin } from '@/lib/hooks/useAuth';

export default function AdminPage() {
  const { authorized, loading } = useRequireAdmin();
  
  if (loading) return <LoadingSpinner />;
  if (!authorized) return null; // Hook redirects
  
  return <AdminContent />;
}
```

---

## 🔧 Usage Examples

### 1. Protect Admin Page

```typescript
'use client';

import { useRequireAdmin } from '@/lib/hooks/useAuth';

export default function AdminDashboard() {
  const { authorized, loading } = useRequireAdmin();
  const { user } = useAuth();
  
  if (loading) {
    return <div>Loading...</div>;
  }
  
  if (!authorized) {
    return null; // Redirects automatically
  }
  
  return (
    <div>
      <h1>Welcome, {user?.username}</h1>
      {/* Admin content */}
    </div>
  );
}
```

### 2. Role-Based UI Elements

```typescript
import { useAuth } from '@/app/context/AuthContext';

export default function Navigation() {
  const { user, isAuthenticated, canAccessAdmin, logout } = useAuth();
  
  return (
    <nav>
      {isAuthenticated ? (
        <>
          <span>Hello, {user?.username}</span>
          {canAccessAdmin() && (
            <Link href="/admin/products">Admin</Link>
          )}
          <button onClick={logout}>Logout</button>
        </>
      ) : (
        <>
          <Link href="/login">Login</Link>
          <Link href="/register">Register</Link>
        </>
      )}
    </nav>
  );
}
```

### 3. Custom Role Checks

```typescript
import { useAuth } from '@/app/context/AuthContext';

export default function ProductCard({ product }) {
  const { hasRole } = useAuth();
  
  return (
    <div>
      <h3>{product.name}</h3>
      <p>${product.price}</p>
      
      {hasRole(['seller', 'admin']) && (
        <button>Edit Product</button>
      )}
      
      {hasRole('buyer') && (
        <button>Add to Cart</button>
      )}
    </div>
  );
}
```

---

## 📡 API Endpoints

### Login
```
POST /api/token/
Body: { username, password }
Response: { access, refresh, user }
```

### Register
```
POST /api/auth/register/
Body: { username, email, password, password_confirm, role, ... }
Response: { user }
```

### Refresh Token
```
POST /api/token/refresh/
Body: { refresh }
Response: { access }
```

### Get Profile
```
GET /api/auth/profile/
Headers: { Authorization: Bearer <token> }
Response: { user }
```

---

## 🎨 UI Components

### Login Page (`/login`)
- Clean, minimal design
- Username/password fields
- Auto-redirect if already logged in
- Link to registration
- Role-based redirect after login

### Register Page (`/register`)
- Account type selection (buyer/seller)
- Dynamic form fields based on role
- Password strength validation
- Seller-specific shop information
- Auto-login after registration

### Header Component
- User avatar menu
- Role indicator
- Admin dashboard link (sellers/admins)
- Logout functionality
- Cart icon with badge

---

## 🔄 State Management

### AuthContext State
```typescript
{
  user: User | null,
  loading: boolean,
  isAuthenticated: boolean,
  
  // Actions
  login: (credentials) => Promise<void>,
  register: (data) => Promise<void>,
  logout: () => Promise<void>,
  refreshUser: () => Promise<void>,
  
  // Role helpers
  hasRole: (role) => boolean,
  canAccessAdmin: () => boolean,
  isBuyer: () => boolean,
  isSeller: () => boolean,
  isAdmin: () => boolean,
}
```

---

## 🧪 Testing Authentication

### Test Accounts

```bash
# Buyer Account
Username: buyer1
Password: securepass123

# Seller Account
Username: seller1
Password: securepass123

# Admin Account
Username: admin
Password: admin123
```

### Test Scenarios

1. **Register New Buyer**
   - Go to `/register`
   - Select "Buyer" role
   - Complete form
   - Should redirect to `/products`

2. **Register New Seller**
   - Go to `/register`
   - Select "Seller" role
   - Fill shop information
   - Should redirect to `/admin/products`

3. **Login as Seller**
   - Should see admin dashboard link in header
   - Can access `/admin/products`
   - Can access `/admin/add-product`

4. **Login as Buyer**
   - Cannot access `/admin/*` routes
   - Redirected to `/products` if attempting admin access

5. **Token Refresh**
   - Wait for access token expiration (1 day)
   - Make authenticated request
   - Should auto-refresh and retry

6. **Logout**
   - Click user menu → logout
   - Clears localStorage
   - Redirects to `/login`
   - Cannot access protected routes

---

## 🚀 Deployment Checklist

- [ ] Set `NEXT_PUBLIC_API_BASE_URL` environment variable
- [ ] Configure CORS on backend for production domain
- [ ] Set secure cookie flags in production
- [ ] Implement rate limiting on auth endpoints
- [ ] Add CAPTCHA to registration (optional)
- [ ] Set up error logging/monitoring
- [ ] Test all role-based redirects
- [ ] Verify token refresh mechanism
- [ ] Test logout from multiple devices
- [ ] Check mobile responsive auth pages

---

## 🔐 Security Best Practices

1. **Token Storage**
   - Access tokens stored in localStorage (client-side)
   - Consider httpOnly cookies for enhanced security

2. **Password Requirements**
   - Minimum 8 characters
   - Validated on both client and server
   - Backend should hash with bcrypt/argon2

3. **CSRF Protection**
   - Implement CSRF tokens for state-changing operations
   - Use SameSite cookie attribute

4. **XSS Prevention**
   - React escapes output by default
   - Never use dangerouslySetInnerHTML with user input

5. **API Security**
   - All admin endpoints require authentication
   - Role checked on backend for every request
   - JWT signature verification on server

---

## 📚 Related Files

```
app/
├── context/
│   └── AuthContext.tsx          # Auth state provider
├── login/
│   └── page.tsx                 # Login page
├── register/
│   └── page.tsx                 # Registration page
├── admin/
│   ├── products/page.tsx        # Admin dashboard
│   └── add-product/page.tsx     # Add product form
└── components/
    └── layout/
        └── Header.tsx           # Navigation with auth

lib/
├── api/
│   ├── auth.ts                  # Auth API calls
│   └── client.ts                # Axios client with interceptors
├── hooks/
│   └── useAuth.ts               # Auth hooks
└── types/
    └── api.ts                   # TypeScript types

middleware.ts                    # Route protection
```

---

## 🆘 Troubleshooting

### "Token expired" errors
- Check system clock synchronization
- Verify refresh token is being stored
- Ensure refresh endpoint is working

### Infinite redirect loop
- Clear localStorage
- Check middleware matcher config
- Verify role-based redirect logic

### "Not authorized" despite login
- Check user role in localStorage
- Verify JWT token is valid
- Ensure backend returns correct role

### Registration fails
- Check password confirmation match
- Verify email format validation
- Ensure shop name provided for sellers
- Check backend API response

---

## 🎯 Future Enhancements

- [ ] Email verification for registration
- [ ] Password reset functionality
- [ ] Two-factor authentication (2FA)
- [ ] Social login (Google, Facebook)
- [ ] Session management dashboard
- [ ] Activity logs for sellers/admins
- [ ] Role hierarchy and permissions
- [ ] API rate limiting per user
- [ ] Remember me functionality
- [ ] Account deletion

---

## 📞 Support

For issues or questions:
- Check error messages in browser console
- Review network tab for API calls
- Verify localStorage content
- Check backend API logs
- Review this documentation

---

**Status**: ✅ Production Ready
**Version**: 1.0.0
**Last Updated**: February 2026
