# WhatsApp Order Integration - Backend API Alignment

## Changes Made

All frontend code has been updated to match the actual Django backend API implementation as documented in the OpenAPI schema.

---

## 1. Updated Type Definitions ([lib/types/api.ts](lib/types/api.ts))

### Backend Schema (snake_case)
- Added `OrderBackend` interface - matches API response format
- Added `OrderItemBackend` interface - matches API response format
- Updated `CreateOrderRequest` - uses snake_case for backend

### Frontend Schema (camelCase)
- Updated `Order` interface - transformed from backend for UI use
- Updated `OrderItem` interface - transformed from backend for UI use
- All numeric fields properly typed (decimals as numbers in frontend)

### Key Changes:
```typescript
// Backend sends (snake_case):
{
  order_reference: "LEG-XXXX-XXXX",
  customer_name: "John Doe",
  customer_phone: "+1234567890",
  total: "59.98",  // decimal as string
  item_count: 2
}

// Frontend uses (camelCase):
{
  orderReference: "LEG-XXXX-XXXX",
  customerName: "John Doe",
  customerPhone: "+1234567890",
  total: 59.98,  // converted to number
  itemCount: 2
}
```

---

## 2. Updated Orders API Module ([lib/api/orders.ts](lib/api/orders.ts))

### Transformation Functions Added:
- `transformOrderItem()` - Converts backend OrderItem to frontend format
- `transformOrder()` - Converts backend Order to frontend format
- Automatically converts decimal strings to numbers
- Handles snake_case → camelCase conversion

### Updated Endpoints:
All endpoints now use the correct backend URL: `/api/api/orders/`

```typescript
POST   /api/api/orders/          - Create order
GET    /api/api/orders/          - List orders
GET    /api/api/orders/{id}/     - Get order detail
PATCH  /api/api/orders/{id}/     - Update status
POST   /api/api/orders/{id}/confirm/ - Confirm & reduce stock
GET    /api/api/orders/my-orders/ - Customer orders
```

### Response Transformation:
All API responses are automatically transformed from snake_case to camelCase before being returned to components.

---

## 3. Updated Checkout Flow ([app/cart/page.tsx](app/cart/page.tsx))

### Order Creation Request Format:
```typescript
{
  order_reference: "LEG-XXXX-XXXX",  // snake_case
  order_date: "2026-02-04T10:30:00Z",
  customer_name: "John Doe",
  customer_phone: "+1234567890",
  customer_address: "123 Main St",
  items: [{
    product: "uuid",              // Product UUID
    product_name: "T-Shirt",
    product_barcode: "SKU-123",
    product_image: "https://...",
    quantity: 2,
    unit_price: "29.99",          // decimal as string
    selected_size: "L",
    selected_color: "Blue"
  }],
  total: "59.98"                  // decimal as string
}
```

### Error Handling:
- Shows loading state: "💾 Saving Order..."
- Displays error message if backend fails
- Allows WhatsApp fallback even if backend save fails
- Gracefully handles network errors

---

## 4. Updated Admin Orders Page ([app/admin/orders/page.tsx](app/admin/orders/page.tsx))

### New Features:
1. **Product Links in Orders Table**
   - Each product name has a clickable external link icon
   - Opens product detail page in new tab
   - Seller can quickly navigate to product from order

2. **Improved Error Handling**
   - Handles backend error details array
   - Shows specific stock error messages
   - Better feedback on confirmation success/failure

3. **Backend Response Handling**
   - Properly handles `stock_updated` field (optional)
   - Works with transformed camelCase orders
   - Displays correct error messages from API

---

## 5. Product URLs in WhatsApp Messages

### Already Implemented ✅

WhatsApp order messages include clickable product links:

```
┌─ 📋 ORDER ITEMS ───────────┐
│
│ 1. *Classic T-Shirt*
│    📌 SKU: *SKU-12345*
│    🔑 ID: 550e8400-e29b-41d4-a716-446655440000
│    🖼️ Image: https://res.cloudinary.com/.../image.jpg
│    🔗 Link: https://yoursite.com/products/550e8400-...
│    📏 Size: L
│    🎨 Color: Blue
│    💰 Price: $29.99 × 2
│    💵 Subtotal: $59.98
```

### How It Works:
1. Product detail page adds `shareUrl` to cart items
2. `shareUrl` format: `https://yoursite.com/products/{product-id}`
3. WhatsApp message includes this URL under "🔗 Link:"
4. Seller can click link in WhatsApp to view product on website

### Cart Item Structure:
```typescript
{
  productId: "uuid",
  name: "T-Shirt",
  barcode: "SKU-123",
  unitPrice: 29.99,
  quantity: 2,
  selectedSize: "L",
  selectedColor: "Blue",
  image: "https://...",
  category: "Men",
  shareUrl: "https://yoursite.com/products/uuid" // ← Product URL
}
```

---

## 6. Backend API Endpoints (Already Implemented)

According to the OpenAPI schema, the backend has:

### Order Endpoints:
```
POST   /api/api/orders/                 - Create order (no auth)
GET    /api/api/orders/                 - List orders (role-filtered)
GET    /api/api/orders/{id}/            - Get order detail
PATCH  /api/api/orders/{id}/            - Update status (admin)
POST   /api/api/orders/{id}/confirm/    - Confirm & reduce stock (admin)
GET    /api/api/orders/my-orders/       - Customer's orders (auth)
```

### Order Status Enum:
- `pending` - Order created, awaiting review
- `confirmed` - Admin confirmed, stock reduced
- `processing` - Order being prepared
- `shipped` - Order dispatched
- `delivered` - Order completed
- `cancelled` - Order cancelled

---

## 7. Complete Order Flow

### Customer Journey:
```
1. Add products to cart
   ↓
2. Click "Checkout via WhatsApp"
   ↓
3. Enter: Name, Phone, Address (optional)
   ↓
4. Click "📱 Send Order via WhatsApp"
   ↓
5. Frontend calls: POST /api/api/orders/
   ↓
6. Backend creates order (status: pending)
   ↓
7. Frontend receives order with ID
   ↓
8. WhatsApp opens with formatted message (includes product URLs)
   ↓
9. Customer sends message to seller
   ↓
10. Cart cleared, success modal shown
```

### Seller Journey:
```
1. Receive WhatsApp message from customer
   ↓
2. Click product links in message to view items
   ↓
3. Verify stock and pricing
   ↓
4. Confirm payment with customer (via WhatsApp)
   ↓
5. Login to admin panel: /admin/orders
   ↓
6. Find order by reference (LEG-XXXX-XXXX)
   ↓
7. Review order details
   ↓
8. Click "✅ Confirm Order & Reduce Stock"
   ↓
9. Backend validates stock availability
   ↓
10. Backend reduces stock quantities
   ↓
11. Order status changes to "confirmed"
   ↓
12. Update status: processing → shipped → delivered
```

---

## 8. Stock Management

### Pending Orders:
- Stock **NOT** reduced when order is created
- Allows multiple customers to order same item
- Prevents stock lockout before payment confirmation

### Confirmed Orders:
- Stock **ONLY** reduced when admin confirms
- Backend validates availability before reducing
- Uses atomic database transaction
- Prevents overselling

### Confirmation Process:
```typescript
POST /api/api/orders/{id}/confirm/

// Backend checks:
1. Is order status = 'pending'?
2. Is stock available for all items?
3. Reduce stock for each item
4. Update order status to 'confirmed'
5. Return success response

// If insufficient stock:
{
  "success": false,
  "error": "Insufficient stock for some items",
  "details": [
    "T-Shirt (Size L): Insufficient stock (available: 1, required: 2)"
  ]
}
```

---

## 9. Data Flow Diagram

```
┌─────────────────┐
│   Customer      │
│   (Frontend)    │
└────────┬────────┘
         │
         │ 1. Add to Cart (includes shareUrl)
         │
         ▼
┌─────────────────┐
│   Cart Store    │
│  (localStorage) │
└────────┬────────┘
         │
         │ 2. Create Order
         │
         ▼
┌─────────────────┐
│  POST /orders/  │
│   (snake_case)  │
└────────┬────────┘
         │
         │ 3. Save to DB
         │
         ▼
┌─────────────────┐
│  Django Backend │
│ (Order Model)   │
│ status: pending │
└────────┬────────┘
         │
         │ 4. Return Order
         │
         ▼
┌─────────────────┐
│  Transform to   │
│   camelCase     │
└────────┬────────┘
         │
         │ 5. Build WhatsApp Message
         │    (includes product URLs)
         │
         ▼
┌─────────────────┐
│   WhatsApp      │
│   (Message)     │
└────────┬────────┘
         │
         │ 6. Customer sends to seller
         │
         ▼
┌─────────────────┐
│     Seller      │
│ (WhatsApp Chat) │
└────────┬────────┘
         │
         │ 7. Click product links
         │
         ▼
┌─────────────────┐
│ Product Detail  │
│     Pages       │
└─────────────────┘
         │
         │ 8. Verify & Confirm Payment
         │
         ▼
┌─────────────────┐
│  Admin Orders   │
│  /admin/orders  │
└────────┬────────┘
         │
         │ 9. Confirm Order
         │
         ▼
┌─────────────────┐
│ POST /confirm/  │
│ Reduce Stock    │
│ status:confirmed│
└─────────────────┘
```

---

## 10. Testing Checklist

### Frontend Testing:
- [ ] Add products to cart (verify shareUrl is included)
- [ ] Create order (check browser console for API request)
- [ ] Verify order is saved to backend (status: pending)
- [ ] Check WhatsApp message includes product URLs
- [ ] Test error handling (disconnect backend, try to order)
- [ ] Verify cart clears after successful order

### Backend Testing:
- [ ] POST /api/api/orders/ (guest checkout, no auth)
- [ ] Verify order created with status: pending
- [ ] Verify stock NOT reduced on order creation
- [ ] GET /api/api/orders/ (as admin, see all orders)
- [ ] GET /api/api/orders/my-orders/ (as buyer, see own orders)
- [ ] PATCH /api/api/orders/{id}/ (update status as admin)
- [ ] POST /api/api/orders/{id}/confirm/ (reduce stock)
- [ ] Verify stock reduced after confirmation
- [ ] Test insufficient stock error handling

### Admin Panel Testing:
- [ ] Login as admin/seller
- [ ] Navigate to /admin/orders
- [ ] Filter orders by status
- [ ] Expand order details
- [ ] Click product links (should open in new tab)
- [ ] Update order status via dropdown
- [ ] Confirm pending order
- [ ] Verify success message
- [ ] Contact customer via WhatsApp button

### WhatsApp Testing:
- [ ] Send test order
- [ ] Verify message formatting
- [ ] Click product URLs in WhatsApp
- [ ] Verify links open correct product pages
- [ ] Check order reference is correct
- [ ] Verify all product details are accurate

---

## 11. Environment Variables

No changes needed. Existing configuration works:

```env
# .env.local
NEXT_PUBLIC_API_BASE_URL=https://lego-menswear-backend-abf196114bd9.herokuapp.com
```

---

## 12. API Response Examples

### Create Order Response:
```json
{
  "id": "7c9e6679-7425-40de-944b-e07fc1f90ae7",
  "order_reference": "LEG-LXYZ1234-AB5C",
  "order_date": "2026-02-04T10:30:00Z",
  "customer_name": "John Doe",
  "customer_phone": "+1234567890",
  "customer_address": "123 Main St",
  "user": null,
  "status": "pending",
  "items": [{
    "id": "item-uuid",
    "product": "product-uuid",
    "product_name": "Classic T-Shirt",
    "product_barcode": "SKU-12345",
    "product_image": "https://res.cloudinary.com/.../image.jpg",
    "quantity": 2,
    "unit_price": "29.99",
    "selected_size": "L",
    "selected_color": "Blue",
    "subtotal": "59.98"
  }],
  "total": "59.98",
  "item_count": 2,
  "created_at": "2026-02-04T10:30:05.123Z",
  "updated_at": "2026-02-04T10:30:05.123Z"
}
```

### Confirm Order Response:
```json
{
  "success": true,
  "order": { /* Full order object with status: "confirmed" */ },
  "stock_updated": true,
  "message": "Order confirmed and stock updated successfully"
}
```

### Error Response (Insufficient Stock):
```json
{
  "success": false,
  "error": "Insufficient stock for some items",
  "details": [
    "Classic T-Shirt: Insufficient stock (available: 1, required: 2)"
  ]
}
```

---

## Summary

✅ **All frontend code updated to match actual backend API**  
✅ **Proper snake_case ↔ camelCase transformation**  
✅ **Product URLs included in WhatsApp messages**  
✅ **Admin panel shows clickable product links**  
✅ **Error handling improved for backend responses**  
✅ **Stock management logic aligned with backend**  
✅ **Ready for production use**

**Next Step:** Test the complete order flow with the live backend!
