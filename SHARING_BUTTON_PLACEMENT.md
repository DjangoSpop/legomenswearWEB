# Sharing Button Placement Guide

## 1. Product Detail Page Layout

```
┌─────────────────────────────────────────────┐
│          Product Detail Page                │
├──────────────────┬──────────────────────────┤
│                  │                          │
│  Image Gallery   │  Product Title           │
│  (Sticky Left)   │  Price & Discount        │
│                  │  ═══════════════════════ │
│                  │                          │
│                  │  Size Selector           │
│                  │  Color Selector          │
│                  │  Quantity Selector       │
│                  │  ═══════════════════════ │
│                  │  Stock Status            │
│                  │  ═══════════════════════ │
│                  │                          │
│                  │  ┌─────────────────────┐ │
│                  │  │ ADD TO BAG│ SHARE   │ │
│                  │  └─────────────────────┘ │
│                  │  ═══════════════════════ │
│                  │                          │
│                  │  Product Details        │
│                  │  Description            │
│                  │                          │
└──────────────────┴──────────────────────────┘
```

## 2. Product Card (Grid) - Hover State

```
┌────────────────────┐
│   Product Image    │
│   (Sale Badge)     │
│                    │     ┌─────────┐
│                    │ ┌──→│ SHARE   │
│   ╱╱╱╱╱╱╱╱╱╱╱╱     │ │   └─────────┘
│   ╱ Hover Area╱╱   │ │
│   ╱╱╱╱╱╱╱╱╱╱╱╱ ────┘ │
│                    │
└────────────────────┘
  Category
  Product Name
  Price
```

## 3. Share Menu Opened

```
┌─────────────────────────────┐
│      SHARE BUTTON           │
└──────────┬──────────────────┘
           │
           ▼
    ┌─────────────────────┐
    │ 🔗 Copy Link        │
    ├─────────────────────┤
    │ 💬 WhatsApp         │
    │ 👍 Facebook         │
    │ 𝕏 Twitter / X       │
    │ ✉️ Email            │
    │ ✈️ Telegram         │
    │ ⋯ More Options      │
    └─────────────────────┘
```

## Responsive Behavior

### Desktop
- **Product Detail**: Share button next to "Add to Bag" (full width layout)
- **Product Grid**: Share button appears on hover over image
- **Button Text**: "SHARE" visible with icon

### Tablet
- **Product Detail**: Same as desktop, responsive layout
- **Product Grid**: Same sharing behavior
- **Button**: Slightly smaller, maintains functionality

### Mobile
- **Product Detail**: Share button stacks below "Add to Bag" (if needed)
- **Product Grid**: Share button on tap/hover
- **Button Text**: Icon only to save space

## User Interactions

### Step-by-Step Usage

1. **User hovers over product image** (Product Card)
   - Share button appears in bottom-right
   - User can click to open share menu

2. **OR User is on Product Detail Page**
   - Share button is always visible next to "Add to Bag"
   - User can click at any time

3. **User clicks Share Button**
   - Menu opens with 6-7 sharing options
   - Menu closes if user clicks outside

4. **User selects platform**
   - WhatsApp/Facebook/Twitter/Telegram: Opens in new window
   - Copy Link: Copies URL, shows "Copied!" feedback
   - Email: Opens email client with pre-filled subject/body
   - More Options: Uses device's native share menu

## Mobile Share Menu Behavior

On mobile devices:
- Share menu appears above the button
- Touch to close outside the menu
- Web Share API integration (if available)
- Falls back to individual platform links

## Analytics Tracking Opportunity

```
Share Clicks → Track which platform
            → Track product ID
            → Track timestamp
            → Track user ID (if available)

Conversion → Track if shared product → purchased
```

## Performance Notes

- ShareButton is a lightweight client component
- No additional dependencies required
- Uses native browser APIs (navigator.share, clipboard)
- Graceful fallback for older browsers
- Menu renders on-demand
