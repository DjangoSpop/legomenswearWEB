/**
 * TypeScript types matching the Django DRF OpenAPI schema
 * CRITICAL: These types MUST match the Flutter Product/User models exactly
 * Key contract: camelCase for discountedPrice, inStock, imagePaths, reviewCount
 */

// ============================================================================
// ENUMS
// ============================================================================

export type CategoryEnum = 'Men' | 'Women' | 'Kids' | 'Accessories' | 'Shoes';

export type RoleEnum = 'buyer' | 'seller' | 'admin';

export type OrderStatus = 
  | 'pending'       // Order created, awaiting admin review
  | 'confirmed'     // Admin confirmed, stock reduced
  | 'processing'    // Order being prepared
  | 'shipped'       // Order dispatched
  | 'delivered'     // Order delivered to customer
  | 'cancelled';    // Order cancelled

// ============================================================================
// PRODUCT TYPES (matching Flutter Product.fromJson())
// ============================================================================

/**
 * Product response from backend
 * Backend returns snake_case but we transform to camelCase for Flutter compatibility
 */
export interface ProductImage {
  id: string;
  image: string; // Absolute URL
  created_at: string;
}

/**
 * Raw product from backend (camelCase from Django serializer with Cloudinary)
 * Backend now returns camelCase fields directly
 */
export interface ProductBackendResponse {
  id: string;
  name: string;
  description: string;
  barcode: string;
  category: CategoryEnum;
  subcategory?: string;
  brand?: string;
  price: number; // Already converted to number by backend
  discountedPrice?: number; // camelCase from backend
  quantity: number;
  inStock: boolean; // camelCase from backend
  sizes: string[]; // JSON array
  colors: string[]; // JSON array
  minQuantity?: number | null;
  sizeQuantities?: Record<string, number> | null;
  rating: number; // Already converted to number by backend
  reviewCount: number; // camelCase from backend
  imagePaths: string[]; // Cloudinary URLs - camelCase from backend
  primaryImage?: string; // First image for quick access
  shareUrl?: string; // Product share URL
  whatsappText?: string; // Pre-formatted WhatsApp message
  created_at?: string; // Optional - may be omitted by backend
  updated_at?: string; // Optional - may be omitted by backend
}

/**
 * Product type for frontend (camelCase - Flutter compatible)
 * This is what components will use
 */
export interface Product {
  id: string;
  name: string;
  description: string;
  barcode: string;
  category: CategoryEnum;
  subcategory?: string;
  brand?: string;
  price: number;
  discountedPrice?: number; // camelCase - Flutter contract
  quantity: number;
  inStock: boolean; // camelCase - Flutter contract
  sizes: string[];
  colors: string[];
  minQuantity?: number | null;
  sizeQuantities?: Record<string, number> | null;
  rating: number;
  reviewCount: number; // camelCase - Flutter contract
  imagePaths: string[]; // Cloudinary URLs - Flutter contract
  primaryImage?: string; // First image for quick access
  shareUrl?: string; // Product share URL
  whatsappText?: string; // Pre-formatted WhatsApp message
  createdAt: string;
  updatedAt: string;
}

/**
 * Request body for creating/updating products (multipart/form-data)
 * Sent to POST /api/products/
 */
export interface ProductCreateRequest {
  name: string;
  description: string;
  barcode: string;
  category: CategoryEnum;
  subcategory?: string;
  brand?: string;
  price: string; // Send as string (decimal)
  discounted_price?: string; // snake_case for backend
  quantity: number;
  in_stock?: boolean;
  sizes?: string; // JSON string: '["S","M","L"]'
  colors?: string; // JSON string: '["Red","Blue"]'
  min_quantity?: number;
  size_quantities?: string; // JSON string: '{"S":10,"M":20}'
  images?: File[]; // Multiple files for multipart upload
}

// ============================================================================
// AUTH TYPES
// ============================================================================

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  access: string;
  refresh: string;
  user?: {
    id: string;
    username: string;
    email: string;
    role: RoleEnum;
    shopname?: string;
    shopdes?: string;
    first_name?: string;
    last_name?: string;
  };
}

export interface TokenRefreshRequest {
  refresh: string;
}

export interface TokenRefreshResponse {
  access: string;
}

export interface UserRegistrationRequest {
  username: string;
  email: string;
  password: string;
  password_confirm: string;
  role?: RoleEnum;
  shopname?: string;
  shopdes?: string;
  first_name?: string;
  last_name?: string;
}

export interface User {
  id: string;
  username: string;
  email: string;
  role: RoleEnum;
  shopname?: string; // Flutter contract
  shopdes?: string; // Flutter contract
  firstName?: string;
  lastName?: string;
}

// ============================================================================
// API QUERY PARAMS
// ============================================================================

export interface ProductListParams {
  category?: CategoryEnum;
  in_stock?: boolean;
  ordering?: 'price' | '-price' | 'created_at' | '-created_at';
  search?: string;
}

// ============================================================================
// CART TYPES (Frontend only)
// ============================================================================

export interface CartItem {
  productId: string;
  name: string;
  barcode?: string; // SKU for order processing
  unitPrice: number;
  quantity: number;
  selectedSize?: string;
  selectedColor?: string;
  image?: string; // Primary image from imagePaths[0]
  category?: string; // Product category for organization
  shareUrl?: string; // Product detail page URL
}

// ============================================================================
// WHATSAPP CHECKOUT
// ============================================================================

export interface WhatsAppCheckoutData {
  customerName: string;
  customerPhone: string;
  customerAddress?: string;
  items: CartItem[];
  total: number;
}

// ============================================================================
// ORDER TYPES (Backend uses snake_case, matching OpenAPI schema)
// ============================================================================

/**
 * Order item as returned from backend (snake_case)
 */
export interface OrderItemBackend {
  id: string;
  product: string; // Product ID (UUID)
  product_name: string; // Denormalized for display
  product_barcode?: string; // SKU/barcode for reference
  product_image?: string; // Product image URL
  quantity: number;
  unit_price: string; // Decimal as string
  selected_size?: string;
  selected_color?: string;
  subtotal: string; // Decimal as string (quantity * unit_price)
}

/**
 * Order as returned from backend (snake_case)
 */
export interface OrderBackend {
  id: string;
  order_reference: string; // LEG-XXXX-XXXX format
  order_date: string; // ISO timestamp
  customer_name: string;
  customer_phone: string;
  customer_address?: string;
  user?: string; // User ID if authenticated (nullable for guest orders)
  status: OrderStatus;
  items?: OrderItemBackend[]; // Optional: only present in detail view
  total: string; // Decimal as string
  item_count: number; // Total quantity of items
  created_at: string;
  updated_at: string;
}

/**
 * Order item for frontend use (camelCase, numbers converted)
 */
export interface OrderItem {
  id: string;
  product: string; // Product ID (UUID)
  productName: string; // Denormalized for display
  productBarcode?: string; // SKU/barcode for reference
  productImage?: string; // Product image URL
  quantity: number;
  unitPrice: number;
  selectedSize?: string;
  selectedColor?: string;
  subtotal: number; // quantity * unitPrice
}

/**
 * Order for frontend use (camelCase, numbers converted)
 */
export interface Order {
  id: string;
  orderReference: string; // LEG-XXXX-XXXX format
  orderDate: string; // ISO timestamp
  customerName: string;
  customerPhone: string;
  customerAddress?: string;
  user?: string; // User ID if authenticated (nullable for guest orders)
  status: OrderStatus;
  items?: OrderItem[]; // Optional: only present in detail view
  total: number;
  itemCount: number; // Total quantity of items
  createdAt: string;
  updatedAt: string;
}

/**
 * Request body for creating a new order (snake_case for backend)
 */
export interface CreateOrderRequest {
  order_reference: string; // Generated on frontend: LEG-{TIMESTAMP}-{RANDOM}
  order_date: string; // ISO timestamp
  customer_name: string;
  customer_phone: string;
  customer_address?: string;
  items: {
    product: string; // Product UUID
    product_name: string;
    product_barcode?: string;
    product_image?: string;
    quantity: number;
    unit_price: string; // Send as string decimal
    selected_size?: string;
    selected_color?: string;
  }[];
  total: string; // Send as string decimal
  item_count: number; // Total quantity of items
}

/**
 * Request body for updating order status (snake_case for backend)
 */
export interface UpdateOrderStatusRequest {
  status: OrderStatus;
}

/**
 * Response from order confirmation (includes stock update results)
 */
export interface ConfirmOrderResponse {
  success: boolean;
  order: OrderBackend; // Backend returns snake_case
  stock_updated?: boolean;
  message?: string;
}

export interface ConfirmOrderResponseTransformed {
  success: boolean;
  order: Order; // Transformed to camelCase
  stockUpdated?: boolean;
  message?: string;
}
