# 🚀 Auth System Quick Start

## For Developers: Getting Started with the Authentication System

### 1️⃣ Understanding the System

This app now has **professional role-based authentication**:

- **3 Roles**: Buyer, Seller, Admin
- **JWT Tokens**: Secure with auto-refresh
- **Protected Routes**: Middleware + client-side guards
- **Seamless UX**: Auto-redirect based on role

---

## 2️⃣ How to Use in Your Components

### Protect a Page (Require Login)

```tsx
'use client';

import { useRequireAuth } from '@/lib/hooks/useAuth';

export default function MyProtectedPage() {
  const { isAuthenticated, loading } = useRequireAuth();
  
  if (loading) return <div>Loading...</div>;
  
  return <div>Protected content</div>;
}
```

### Protect a Page (Require Admin/Seller Role)

```tsx
'use client';

import { useRequireAdmin } from '@/lib/hooks/useAuth';

export default function AdminPage() {
  const { authorized, loading } = useRequireAdmin();
  
  if (loading) return <div>Loading...</div>;
  if (!authorized) return null; // Auto-redirects
  
  return <div>Admin content</div>;
}
```

### Check Roles in Components

```tsx
'use client';

import { useAuth } from '@/app/context/AuthContext';

export default function MyComponent() {
  const { user, hasRole, canAccessAdmin, logout } = useAuth();
  
  return (
    <div>
      {user && <p>Hello, {user.username}!</p>}
      
      {hasRole('buyer') && <button>Add to Cart</button>}
      
      {canAccessAdmin() && <button>Manage Products</button>}
      
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

---

## 3️⃣ Available Auth Hooks

```tsx
import { useAuth } from '@/app/context/AuthContext';

const {
  // State
  user,              // Current user object
  loading,           // Auth initialization loading
  isAuthenticated,   // Boolean: is user logged in?
  
  // Actions
  login,             // (credentials) => Promise<void>
  register,          // (data) => Promise<void>
  logout,            // () => Promise<void>
  refreshUser,       // () => Promise<void>
  
  // Role Helpers
  hasRole,           // (role | role[]) => boolean
  canAccessAdmin,    // () => boolean
  isBuyer,           // () => boolean
  isSeller,          // () => boolean
  isAdmin,           // () => boolean
} = useAuth();
```

---

## 4️⃣ User Object Structure

```typescript
{
  id: string;
  username: string;
  email: string;
  role: 'buyer' | 'seller' | 'admin';
  shopname?: string;    // For sellers
  shopdes?: string;     // For sellers
  firstName?: string;
  lastName?: string;
}
```

---

## 5️⃣ Testing the System

### Create Test Accounts

1. Go to `http://localhost:3000/register`
2. Try creating:
   - **Buyer account** (no shop info needed)
   - **Seller account** (requires shop name)

### Test Login Redirects

- **Buyer** logs in → redirects to `/products`
- **Seller** logs in → redirects to `/admin/products`

### Test Protected Routes

- Try accessing `/admin/products` without login → redirects to `/login`
- Login as buyer, try `/admin/products` → redirects to `/products`
- Login as seller → can access `/admin/products`

---

## 6️⃣ API Endpoints

All authentication happens through these endpoints:

```bash
# Login
POST /api/token/
Body: { username, password }

# Register
POST /api/auth/register/
Body: { username, email, password, password_confirm, role, shopname?, shopdes? }

# Get Profile
GET /api/auth/profile/
Headers: Authorization: Bearer <token>

# Refresh Token
POST /api/token/refresh/
Body: { refresh }
```

---

## 7️⃣ File Structure

```
app/
├── context/
│   └── AuthContext.tsx        ← Auth state management
├── login/
│   └── page.tsx              ← Login page
├── register/
│   └── page.tsx              ← Registration page
└── admin/
    ├── products/page.tsx     ← Protected admin page
    └── add-product/page.tsx  ← Protected admin page

lib/
├── api/
│   └── auth.ts               ← Auth API calls
├── hooks/
│   └── useAuth.ts            ← Auth hooks
└── types/
    └── api.ts                ← TypeScript types

middleware.ts                 ← Route protection
```

---

## 8️⃣ Common Tasks

### Add a Protected Route

1. Import the hook:
```tsx
import { useRequireAuth } from '@/lib/hooks/useAuth';
```

2. Use in your component:
```tsx
const { isAuthenticated, loading } = useRequireAuth();
```

### Check User Role

```tsx
import { useAuth } from '@/app/context/AuthContext';

const { hasRole } = useAuth();

if (hasRole('seller')) {
  // Show seller features
}
```

### Get Current User Info

```tsx
import { useAuth } from '@/app/context/AuthContext';

const { user } = useAuth();

console.log(user?.username);
console.log(user?.email);
console.log(user?.role);
```

### Manual Logout

```tsx
import { useAuth } from '@/app/context/AuthContext';

const { logout } = useAuth();

<button onClick={logout}>Sign Out</button>
```

---

## 9️⃣ Debugging Tips

### Check Auth State in Browser

```javascript
// In browser console
localStorage.getItem('access_token')
localStorage.getItem('refresh_token')
JSON.parse(localStorage.getItem('user'))
```

### Clear Auth State

```javascript
// In browser console
localStorage.clear()
// Then refresh page
```

### Check Token Expiry

JWT tokens are base64 encoded. Decode to see expiry:
```javascript
// In browser console
const token = localStorage.getItem('access_token');
const payload = JSON.parse(atob(token.split('.')[1]));
console.log('Expires:', new Date(payload.exp * 1000));
```

---

## 🔟 Best Practices

1. **Always use hooks** - Don't manually check localStorage
2. **Handle loading states** - Show spinners while auth initializes
3. **Client-side only** - AuthContext is 'use client', not for SSR
4. **Role checks** - Always verify on backend too (never trust frontend)
5. **Error handling** - Wrap auth calls in try/catch
6. **Type safety** - Use TypeScript types from `@/lib/types/api`

---

## 📝 Examples

### Example 1: Profile Page

```tsx
'use client';

import { useRequireAuth } from '@/lib/hooks/useAuth';
import { useAuth } from '@/app/context/AuthContext';

export default function ProfilePage() {
  const { isAuthenticated, loading } = useRequireAuth();
  const { user, logout } = useAuth();
  
  if (loading) return <div>Loading...</div>;
  
  return (
    <div>
      <h1>My Profile</h1>
      <p>Username: {user?.username}</p>
      <p>Email: {user?.email}</p>
      <p>Role: {user?.role}</p>
      {user?.shopname && <p>Shop: {user.shopname}</p>}
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

### Example 2: Conditional Rendering

```tsx
'use client';

import { useAuth } from '@/app/context/AuthContext';
import Link from 'next/link';

export default function Navigation() {
  const { isAuthenticated, user, canAccessAdmin } = useAuth();
  
  return (
    <nav>
      <Link href="/products">Products</Link>
      
      {isAuthenticated ? (
        <>
          <span>Hi, {user?.username}</span>
          {canAccessAdmin() && (
            <Link href="/admin/products">Dashboard</Link>
          )}
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

### Example 3: Seller-Only Button

```tsx
'use client';

import { useAuth } from '@/app/context/AuthContext';

export default function ProductActions({ productId }) {
  const { isSeller, isAdmin } = useAuth();
  
  const canEdit = isSeller() || isAdmin();
  
  return (
    <div>
      {canEdit && (
        <button onClick={() => editProduct(productId)}>
          Edit Product
        </button>
      )}
    </div>
  );
}
```

---

## ✅ Done!

You now have a **production-ready authentication system** with:

- ✅ Role-based access control
- ✅ JWT with auto-refresh
- ✅ Protected routes
- ✅ Login/Register pages
- ✅ User menu in header
- ✅ Admin dashboard protection

**Full documentation**: See [AUTH_SYSTEM.md](./AUTH_SYSTEM.md)

---

**Questions?** Check the main docs or review the code in:
- `app/context/AuthContext.tsx`
- `lib/hooks/useAuth.ts`
- `lib/api/auth.ts`
