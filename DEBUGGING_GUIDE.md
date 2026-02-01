# Debugging Guide - "Cannot read properties of undefined (reading 'map')" Error

## 🔍 What Was Fixed

### Problem
The error `Cannot read properties of undefined (reading 'map')` occurs when the API response is `undefined` or `null`, and the code tries to call `.map()` on it.

### Root Causes
1. **Missing ProductCard component** - The component was imported but never created
2. **API response handling** - No defensive checks for undefined/null responses
3. **Auth token on public endpoints** - JWT token was being sent even for public GET requests
4. **Image loading** - Next.js Image component needs proper configuration for remote images

---

## ✅ Fixes Applied

### 1. Created ProductCard Component
**File:** `app/components/product/ProductCard.tsx`

```typescript
// Now properly handles:
- Missing images (shows "No Image" placeholder)
- Sale badges for discounted products
- Out of stock overlay
- Hover effects and transitions
```

### 2. Updated API Client - Public Endpoints
**File:** `lib/api/client.ts`

```typescript
// Public endpoints that DON'T require authentication:
const PUBLIC_ENDPOINTS = [
  { method: 'GET', path: '/api/products/' },
  { method: 'GET', path: /^\/api\/products\/[^/]+\/$/ },
];

// JWT token is NOT sent for public GET requests
```

### 3. Defensive Error Handling
**File:** `lib/api/catalog.ts`

```typescript
export const getProducts = async (params?: ProductListParams): Promise<Product[]> => {
  try {
    const response = await apiClient.get('/api/products/', { params });

    // ✅ Defensive checks added:
    if (!response.data) return [];
    if (!Array.isArray(response.data)) return [];

    console.log(`Fetched ${response.data.length} products`);
    return response.data.map(transformProduct);
  } catch (error) {
    console.error('Error fetching products:', error);
    throw handleApiError(error);
  }
};
```

### 4. Page-Level Error Handling
**Files:** `app/page.tsx`, `app/products/page.tsx`

```typescript
// Added:
- Console logging for debugging
- Defensive checks for array data
- Better error messages with context
- Empty array fallback on error
```

### 5. Next.js Image Configuration
**File:** `next.config.mjs`

```javascript
images: {
  remotePatterns: [
    { protocol: 'https', hostname: 'lego-menswear-backend-abf196114bd9.herokuapp.com' },
    { protocol: 'https', hostname: '**.herokuapp.com' },
  ],
}
```

---

## 🧪 Testing the Fix

### Step 1: Run the API Test Page

Navigate to: **http://localhost:3000/api-test**

This page will:
- ✅ Test direct fetch to your API
- ✅ Test axios connection
- ✅ Test app API client
- ✅ Test single product fetch
- ✅ Show environment variables
- ✅ Display detailed error messages

### Step 2: Check Browser Console

Open DevTools (F12) and look for:

```
✅ "Fetching featured products..."
✅ "Featured products loaded: 3"
✅ "Fetched 3 products from API"
```

If you see errors instead:
```
❌ "Error fetching products: [error message]"
❌ Check the full error details below
```

### Step 3: Manual API Test

Open browser console and run:

```javascript
fetch('https://lego-menswear-backend-abf196114bd9.herokuapp.com/api/products/')
  .then(r => r.json())
  .then(data => {
    console.log('✅ Response type:', Array.isArray(data) ? 'array' : typeof data);
    console.log('✅ Product count:', data.length);
    console.log('✅ First product:', data[0]);
  })
  .catch(err => console.error('❌ Error:', err));
```

Expected output:
```
✅ Response type: array
✅ Product count: 3
✅ First product: { id: "...", name: "...", ... }
```

---

## 🔧 Common Issues & Solutions

### Issue 1: Still Getting "Cannot read properties of undefined"

**Check:**
```typescript
// In browser console:
const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;
console.log('API Base:', API_BASE);
```

**Solution:**
1. Restart dev server: `npm run dev`
2. Clear browser cache (Ctrl+Shift+R)
3. Check `.env.local` exists and has correct URL

---

### Issue 2: CORS Error

**Error:**
```
Access to fetch at '...' from origin 'http://localhost:3000'
has been blocked by CORS policy
```

**Solution:**
Backend needs CORS configuration. In Django `settings.py`:

```python
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "https://your-frontend-domain.com",
]
```

---

### Issue 3: Images Not Loading

**Error:**
```
Invalid src prop on `next/image`, hostname is not configured
```

**Solution:**
Already fixed in `next.config.mjs`. If still failing:

1. Restart dev server
2. Check image URL format in API response:
   ```javascript
   // Should be absolute URL:
   "https://lego-menswear-backend-abf196114bd9.herokuapp.com/media/products/image.jpg"
   ```

---

### Issue 4: Empty Array Returned

**Symptom:** No error, but products array is empty `[]`

**Debug:**
```javascript
// Check API directly:
fetch('https://lego-menswear-backend-abf196114bd9.herokuapp.com/api/products/')
  .then(r => r.json())
  .then(console.log);
```

**Possible causes:**
1. Backend database is empty (add products via admin)
2. Backend not returning data (check Django logs)
3. Response transformation issue (check console logs)

---

### Issue 5: TypeError on transformProduct

**Error:**
```
Cannot read property 'image' of undefined
```

**Solution:**
Backend response might have different structure. Check:

```javascript
fetch('YOUR_API/api/products/')
  .then(r => r.json())
  .then(data => {
    console.log('Response structure:', data[0]);
    console.log('Images field:', data[0].images);
  });
```

Expected structure:
```json
{
  "id": "uuid",
  "name": "Product Name",
  "images": [
    {
      "id": "uuid",
      "image": "https://...",
      "created_at": "..."
    }
  ]
}
```

---

## 📊 Debugging Checklist

Run through this checklist:

- [ ] `.env.local` exists with `NEXT_PUBLIC_API_BASE_URL`
- [ ] Dev server restarted after .env changes
- [ ] Backend API is accessible (test with curl/browser)
- [ ] Products exist in backend database
- [ ] Browser console shows no CORS errors
- [ ] API test page shows successful tests
- [ ] Home page console shows "Fetched X products"
- [ ] ProductCard component exists at `app/components/product/ProductCard.tsx`
- [ ] Images load (check Network tab in DevTools)

---

## 🚀 Quick Fix Commands

```bash
# 1. Restart dev server
npm run dev

# 2. Clear Next.js cache
rm -rf .next

# 3. Reinstall dependencies (if needed)
rm -rf node_modules package-lock.json
npm install

# 4. Test API connection
curl https://lego-menswear-backend-abf196114bd9.herokuapp.com/api/products/
```

---

## 📞 Still Having Issues?

### Check These Files

1. **API Client:** [lib/api/client.ts](lib/api/client.ts)
   - Line 50: Public endpoints list
   - Line 62: Request interceptor

2. **Catalog API:** [lib/api/catalog.ts](lib/api/catalog.ts)
   - Line 52: getProducts defensive checks
   - Line 36: transformProduct function

3. **Home Page:** [app/page.tsx](app/page.tsx)
   - Line 17: useEffect with error handling

4. **Environment:** [.env.local](.env.local)
   - Should contain: `NEXT_PUBLIC_API_BASE_URL=https://lego-menswear-backend-abf196114bd9.herokuapp.com`

### Enable Verbose Logging

All API calls now log to console:
- ✅ Request start
- ✅ Response received
- ✅ Data validation
- ❌ Errors with full details

Open browser console (F12) to see all logs.

---

## ✅ Success Indicators

You'll know it's working when:

1. **Home page loads** with products grid
2. **Console shows:**
   ```
   Fetching featured products...
   Fetched 3 products from API
   Featured products loaded: 3
   ```
3. **Product cards show** images, names, prices
4. **No red errors** in console
5. **API test page** shows all green checkmarks

---

**Last Updated:** After implementing all defensive error handling and public endpoint fixes.
