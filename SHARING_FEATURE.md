# Product Sharing Feature

## Overview
A comprehensive product sharing feature has been added to LEGO Menswear to boost CTA (Call To Action) and customer retention through social sharing capabilities.

## Features Added

### 1. **ShareButton Component** (`app/components/product/ShareButton.tsx`)
- Reusable component with multiple sharing options
- Supports the following platforms:
  - **WhatsApp** - Share via WhatsApp messages
  - **Facebook** - Share on Facebook
  - **Twitter/X** - Tweet about the product
  - **Telegram** - Share via Telegram
  - **Email** - Share via email
  - **Copy Link** - Copy product link to clipboard
  - **Native Share** - Uses device's native share menu (when available)

### 2. **Product Detail Page Integration** (`app/products/[id]/page.tsx`)
- Share button placed next to "Add to Bag" button
- Displays product name, price, and URL in shares
- Fully responsive design

### 3. **Product Card Integration** (`app/components/product/ProductCard.tsx`)
- Share button appears on hover in product grid
- Allows quick sharing without navigating to product detail
- Maintains design consistency

## How It Works

### Share Button Behavior
1. **Click the SHARE button** - Opens a menu with sharing options
2. **Copy Link** - Instantly copies the product URL to clipboard
3. **Social Platforms** - Opens a new window with the share dialog for each platform
4. **Feedback** - "Copied!" indicator appears when link is copied

### Share Data Included
- Product name
- Product price
- Full product URL
- Custom message: "Check out [Product Name] - $[Price] at LEGO Menswear!"

## Technical Details

### Component Props
```typescript
interface ShareButtonProps {
  productName: string;      // Product title
  productUrl: string;       // Relative or absolute URL
  productImage?: string;    // Product image (optional)
  price?: number;           // Product price (optional)
}
```

### Key Features
- ✅ **Click-outside detection** - Menu closes when clicking outside
- ✅ **Mobile-friendly** - Works on all devices
- ✅ **Web Share API support** - Uses native sharing on supported devices
- ✅ **Fallback sharing** - Opens new window for web-based sharing
- ✅ **Accessibility** - Proper ARIA labels and keyboard navigation
- ✅ **Visual feedback** - Tooltip and copied confirmation

## Benefits for Business

1. **Increased Reach** - Customers can easily share products with their networks
2. **Viral Potential** - WhatsApp and social sharing can drive organic traffic
3. **Social Proof** - Friends seeing products creates trust
4. **Higher Conversion** - Shared products have higher intent buyers
5. **Customer Retention** - Builds community and encourages repeat visits

## Usage Examples

### In Product Details Page
```tsx
<ShareButton
  productName={product.name}
  productUrl={`/products/${product.id}`}
  productImage={product.primaryImage}
  price={displayPrice}
/>
```

### In Product Cards
```tsx
<ShareButton
  productName={product.name}
  productUrl={`/products/${product.id}`}
  productImage={imageUrl}
  price={displayPrice}
/>
```

## Sharing Platforms Explained

| Platform | Use Case | Reach |
|----------|----------|-------|
| WhatsApp | Direct messaging to contacts | Personal networks |
| Facebook | Public/semi-public sharing | Broad social audience |
| Twitter | Real-time sharing & discussions | Public conversations |
| Email | Direct communication | Specific recipients |
| Telegram | Encrypted messaging | Tech-savvy users |
| Copy Link | QR codes, messages, etc. | Flexible sharing |

## Future Enhancements

- [ ] Track share analytics (which products are most shared)
- [ ] Share referral links with discount codes
- [ ] Add Pinterest integration for fashion items
- [ ] Instagram Stories direct share
- [ ] Personalized share analytics dashboard
- [ ] Share counter on products
