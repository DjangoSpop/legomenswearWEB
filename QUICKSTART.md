# Quick Start Guide - LEGO Mens Wear Store

## 🚀 Get Running in 3 Steps

### Step 1: Install Dependencies

```bash
npm install
```

### Step 2: Configure Environment

Create `.env.local`:

```bash
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

Update WhatsApp number in `lib/utils/whatsapp.ts`:

```typescript
export const STORE_WHATSAPP_NUMBER = '1234567890'; // Your store number
```

### Step 3: Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 🧪 Testing the Application

### 1. Test Public Storefront

1. **Home page**: Should load with featured products
2. **Click product**: Opens product detail page
3. **Select size** → **Add to Cart**
4. **View Cart**: See item with quantity controls
5. **Checkout**: Fill form → Click "Send via WhatsApp"
6. **WhatsApp Web** should open with pre-filled message

### 2. Test Admin Features

1. Navigate to `/login`
2. Enter seller/admin credentials (from backend)
3. Click "Add Product" in header
4. Fill form:
   - Name: "Test Product"
   - Description: "Testing multipart upload"
   - Barcode: "TEST001"
   - Category: "Men"
   - Price: "99.99"
   - Quantity: "10"
   - Sizes: Add "S", "M", "L"
   - **Upload multiple images**
5. Click "Create Product"
6. Should redirect to product detail page with uploaded images

### 3. Test API Integration

**Check if backend is running:**

```bash
curl http://localhost:8000/api/products/
```

Should return JSON array of products.

---

## 📁 Key Files to Customize

### Branding

- **Logo/Name**: [app/components/layout/Header.tsx](app/components/layout/Header.tsx:38)
- **Footer**: [app/components/layout/Footer.tsx](app/components/layout/Footer.tsx)
- **Colors**: [tailwind.config.js](tailwind.config.js:10-21)

### API

- **Base URL**: [.env.local](.env.local)
- **Endpoints**: [lib/api/catalog.ts](lib/api/catalog.ts), [lib/api/auth.ts](lib/api/auth.ts)
- **Types**: [lib/types/api.ts](lib/types/api.ts)

### WhatsApp

- **Phone Number**: [lib/utils/whatsapp.ts](lib/utils/whatsapp.ts:90)
- **Message Template**: [lib/utils/whatsapp.ts](lib/utils/whatsapp.ts:10-35)

---

## 🐛 Troubleshooting

### Images not loading

Check Next.js image config in [next.config.mjs](next.config.mjs):

```javascript
images: {
  remotePatterns: [
    { protocol: 'http', hostname: 'localhost' },
    { protocol: 'https', hostname: '**' },
  ],
}
```

### CORS errors

Ensure Django backend allows your frontend origin:

```python
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
]
```

### 401 Unauthorized

1. Check JWT token in localStorage (DevTools → Application → Local Storage)
2. Try logging in again at `/login`
3. Verify backend auth endpoint is working

### Products not appearing

1. Check browser console for errors
2. Verify backend URL in `.env.local`
3. Test API directly: `curl http://localhost:8000/api/products/`

---

## 📚 Documentation

- **Full implementation details**: [IMPLEMENTATION.md](IMPLEMENTATION.md)
- **Project README**: [README.md](README.md)
- **API Schema**: [LEGO Menswear API.yaml](LEGO%20Menswear%20API.yaml)

---

## ✅ Acceptance Checklist

Before deploying, verify:

- [ ] Products load from backend
- [ ] Images display correctly
- [ ] Add to cart works
- [ ] WhatsApp checkout opens with message
- [ ] Admin can login
- [ ] Admin can upload product with multiple images
- [ ] Responsive on mobile
- [ ] No console errors

---

**Need help?** Check [IMPLEMENTATION.md](IMPLEMENTATION.md) for detailed technical documentation.
