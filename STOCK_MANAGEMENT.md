# 📦 Stock Management - How It Works

## ✅ Stock Status Logic Fixed

Your products will now show correct stock status based on backend data!

---

## 🔍 How Stock Status is Determined

### Smart 3-Tier Logic

```typescript
// Priority 1: Explicit in_stock flag from backend
if (backend.in_stock !== undefined) {
  use backend.in_stock value
}
// Priority 2: Check quantity
else if (backend.quantity !== undefined) {
  inStock = quantity > 0
}
// Priority 3: Default to available
else {
  inStock = true  // Don't show as out of stock by default
}
```

### Examples

**Example 1: Backend sends explicit flag**
```json
{
  "in_stock": true,
  "quantity": 50
}
```
→ Shows: **"In Stock"** (uses explicit flag)

**Example 2: Backend sends quantity only**
```json
{
  "quantity": 10
}
```
→ Shows: **"In Stock (10 available)"** (calculates from quantity)

**Example 3: Backend sends quantity = 0**
```json
{
  "quantity": 0
}
```
→ Shows: **"Out of Stock"** (quantity-based)

**Example 4: Backend sends no stock data**
```json
{
  "quantity": null
}
```
→ Shows: **"In Stock"** (defaults to available)

---

## 🏷️ Stock Status Badges

### Product Cards (Grid View)

**Out of Stock:**
```
┌─────────────────┐
│    [Image]      │
│                 │
│ OUT OF STOCK    │ ← Overlay covers image
│                 │
└─────────────────┘
```

**Low Stock (1-5 items):**
```
┌─────────────────┐
│ Only 3 Left 🏷️  │ ← Yellow badge
│    [Image]      │
│                 │
└─────────────────┘
```

**Normal Stock (6+ items):**
```
┌─────────────────┐
│    [Image]      │ ← No badge
│                 │
└─────────────────┘
```

**On Sale + Low Stock:**
```
┌─────────────────┐
│ Sale 🏷️  3 Left │ ← Both badges
│    [Image]      │
│                 │
└─────────────────┘
```

---

## 📱 Stock Display Locations

### 1. Product Card (Home/Listing Pages)
- **Out of Stock:** Gray overlay with text
- **Low Stock (1-5):** Yellow "Only X Left" badge
- **In Stock:** No special indicator

### 2. Product Detail Page
- **Out of Stock:** Red text "Out of Stock" + Disabled "Add to Cart" button
- **Low Stock (1-10):** Green text "In Stock (X available)" + Yellow "Low Stock" badge
- **Normal Stock:** Green text "In Stock"

### 3. Cart Page
- Items already in cart (no real-time stock check)
- Could be enhanced with real-time validation

---

## 🧪 How to Test Stock Status

### Test Page: `/stock-check`

Navigate to: **http://localhost:3000/stock-check**

This diagnostic page shows:
- ✅ Backend raw data (what API returns)
- ✅ Frontend transformed data (what app uses)
- ✅ Which logic was applied (explicit flag, quantity-based, or default)
- ✅ Side-by-side comparison
- ✅ Full JSON for debugging

**Use this page to:**
1. See exactly what your backend is sending
2. Verify stock logic is working correctly
3. Debug stock status issues
4. Compare expected vs actual behavior

---

## 🛠️ Managing Stock in Backend

### Via Django Admin

**Add/Edit Product:**
```python
# Explicit control (recommended)
product.in_stock = True  # or False
product.quantity = 50

# Auto-calculated (if in_stock not set)
product.quantity = 10  # Will show as "In Stock"
product.quantity = 0   # Will show as "Out of Stock"
```

### Via API (Admin Panel)

**Create Product:**
```bash
POST /api/products/
{
  "name": "New Product",
  "in_stock": true,    # Explicit flag
  "quantity": 100,     # Quantity
  ...
}
```

**Update Stock:**
```bash
PATCH /api/products/{id}/
{
  "quantity": 5  # Update quantity
}
```

---

## 🎨 Visual Stock Indicators

### Product Card
```html
<!-- Out of Stock -->
<div class="absolute inset-0 bg-white/90">
  <span>OUT OF STOCK</span>
</div>

<!-- Low Stock -->
<div class="absolute top-2 right-2 bg-yellow-500">
  <span>Only 3 Left</span>
</div>
```

### Product Detail
```html
<!-- In Stock with Quantity -->
<span class="text-green-600">
  In Stock (10 available)
</span>
<span class="bg-yellow-100 text-yellow-700">
  LOW STOCK
</span>

<!-- Out of Stock -->
<span class="text-red-600">
  Out of Stock
</span>
<button disabled>Out of Stock</button>
```

---

## 📊 Stock Levels & Colors

| Quantity | Status | Color | Badge |
|----------|--------|-------|-------|
| 0 | Out of Stock | Red | Gray overlay |
| 1-5 | Low Stock | Yellow | "Only X Left" |
| 6-10 | In Stock | Green | Shows quantity |
| 11+ | In Stock | Green | No quantity shown |

---

## 🔧 Customizing Stock Thresholds

Want to change the "low stock" threshold?

**File:** `app/components/product/ProductCard.tsx`

```typescript
// Current: Shows badge when quantity <= 5
{product.inStock && product.quantity > 0 && product.quantity <= 5 && (
  <div className="badge-yellow">
    Only {product.quantity} Left
  </div>
)}

// Change to 10:
{product.inStock && product.quantity > 0 && product.quantity <= 10 && (
  <div className="badge-yellow">
    Only {product.quantity} Left
  </div>
)}
```

**File:** `app/products/[id]/page.tsx`

```typescript
// Current: Shows quantity when <= 10
product.quantity > 0 && product.quantity <= 10 ? (
  `In Stock (${product.quantity} available)`
) : (
  'In Stock'
)

// Change threshold as needed
```

---

## 🚀 Quick Checks

### Verify Stock is Working

1. **Check Stock Diagnostic Page:**
   - Navigate to `/stock-check`
   - See all products with stock status
   - Compare backend vs frontend data

2. **Check Product Cards:**
   - Go to home page
   - Products should NOT all show "Out of Stock"
   - Low stock products show yellow badge

3. **Check Product Detail:**
   - Click any product
   - See stock status in "Availability" section
   - "Add to Cart" button enabled if in stock

4. **Check Backend Data:**
   ```bash
   curl https://lego-menswear-backend-abf196114bd9.herokuapp.com/api/products/ | jq
   ```
   - Look at `in_stock` and `quantity` fields
   - Compare with what shows on frontend

---

## 🐛 Troubleshooting

### All Products Show "Out of Stock"

**Check:**
1. Backend data: `curl YOUR_API/api/products/`
2. Stock diagnostic page: `/stock-check`
3. Browser console for errors

**Common causes:**
- Backend not setting `in_stock` or `quantity`
- Both fields are `null` or `undefined`
- Transformation error (check console)

**Solution:**
- Set `in_stock: true` in backend
- Or set `quantity > 0`
- Or leave both undefined (will default to in stock)

---

### Products Show Wrong Stock Status

**Debug steps:**
1. Go to `/stock-check`
2. Find the problem product
3. Compare "Backend Raw Data" vs "Frontend Transformed"
4. Read "Stock Logic Applied" explanation
5. Check which priority was used

**Fix:**
- If wrong: Update backend `in_stock` flag explicitly
- If correct: Frontend logic is working as designed

---

### Low Stock Badge Not Showing

**Check threshold:**
- Current: Shows when `quantity <= 5`
- Update in `ProductCard.tsx` if needed

**Verify quantity:**
- Check `/stock-check` to see actual quantity
- Ensure `quantity` field is numeric, not null

---

## 📝 Files Modified for Stock Management

| File | Changes |
|------|---------|
| `lib/api/catalog.ts` | Smart stock logic (3-tier priority) |
| `lib/types/api.ts` | Made `in_stock` and `quantity` optional |
| `app/components/product/ProductCard.tsx` | Out of stock overlay + Low stock badge |
| `app/products/[id]/page.tsx` | Enhanced stock display with quantity |
| `app/stock-check/page.tsx` | **NEW** - Diagnostic tool |

---

## ✅ Stock Management Checklist

Before deploying:

- [ ] Test stock diagnostic page (`/stock-check`)
- [ ] Verify products show correct stock status
- [ ] Test low stock badge appears (quantity 1-5)
- [ ] Test out of stock overlay works
- [ ] Test "Add to Cart" disabled when out of stock
- [ ] Backend explicitly sets `in_stock` for critical products
- [ ] Quantity values are accurate in database

---

## 🎯 Best Practices

### For Accurate Stock Management:

1. **Always set explicit `in_stock` flag:**
   ```python
   product.in_stock = True  # Don't rely on auto-calculation
   product.quantity = 50
   ```

2. **Update stock on each sale:**
   ```python
   product.quantity -= 1
   if product.quantity == 0:
       product.in_stock = False
   ```

3. **Reserve stock for pending orders:**
   ```python
   # Don't count pending orders as available stock
   available = product.quantity - pending_orders
   ```

4. **Use low stock threshold strategically:**
   - Show urgency to drive conversions
   - Don't show for high-quantity items
   - Current: Shows when 5 or fewer left

5. **Monitor stock levels:**
   - Use admin panel to check low stock items
   - Set up alerts for out of stock products
   - Restock before hitting zero

---

**Stock management is now smart, flexible, and user-friendly!** 🎉

Your products will display accurate availability based on backend data, with sensible defaults and helpful visual indicators.
