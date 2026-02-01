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
