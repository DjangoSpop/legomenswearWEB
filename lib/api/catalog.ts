/**
 * Catalog API endpoints for products
 * Handles product CRUD operations with proper type transformations
 */

import apiClient, { handleApiError } from './client';
import {
  Product,
  ProductBackendResponse,
  ProductCreateRequest,
  ProductListParams,
} from '@/lib/types/api';

// ============================================================================
// TRANSFORMERS - Backend snake_case to Frontend camelCase
// ============================================================================

/**
 * Transform backend product response to frontend Product type
 * Backend now returns camelCase directly with Cloudinary URLs
 */
export const transformProduct = (raw: any): Product => {
  // Backend now sends camelCase fields directly
  // imagePaths contains Cloudinary URLs
  const imagePaths = raw.imagePaths || [];
  
  console.log('Product:', raw.name, 'Cloudinary URLs:', imagePaths.length);

  return {
    id: raw.id,
    name: raw.name,
    description: raw.description,
    barcode: raw.barcode,
    category: raw.category,
    subcategory: raw.subcategory,
    brand: raw.brand,
    price: raw.price, // Already a number from backend
    discountedPrice: raw.discountedPrice,
    quantity: raw.quantity || 0,
    inStock: raw.inStock !== undefined ? raw.inStock : true,
    sizes: raw.sizes || [],
    colors: raw.colors || [],
    minQuantity: raw.minQuantity,
    sizeQuantities: raw.sizeQuantities,
    rating: raw.rating || 0,
    reviewCount: raw.reviewCount || 0,
    imagePaths, // Cloudinary URLs
    primaryImage: raw.primaryImage, // First image
    shareUrl: raw.shareUrl, // Share URL
    whatsappText: raw.whatsappText, // WhatsApp message
    createdAt: raw.created_at || new Date().toISOString(),
    updatedAt: raw.updated_at || new Date().toISOString(),
  };
};

// ============================================================================
// CATALOG API FUNCTIONS
// ============================================================================

/**
 * Get all products with optional filtering
 * GET /api/products/
 * PUBLIC ENDPOINT - No authentication required
 */
export const getProducts = async (params?: ProductListParams): Promise<Product[]> => {
  try {
    const response = await apiClient.get<ProductBackendResponse[]>('/api/products/', {
      params,
    });

    // Add defensive check for response data
    if (!response.data) {
      console.error('API returned no data:', response);
      return [];
    }

    // Ensure response.data is an array
    if (!Array.isArray(response.data)) {
      console.error('API response is not an array:', response.data);
      return [];
    }

    console.log(`Fetched ${response.data.length} products from API`);
    return response.data.map(transformProduct);
  } catch (error) {
    console.error('Error fetching products:', error);
    throw handleApiError(error);
  }
};

/**
 * Get single product by ID
 * GET /api/products/{id}/
 * PUBLIC ENDPOINT - No authentication required
 */
export const getProductById = async (id: string): Promise<Product> => {
  try {
    const response = await apiClient.get<ProductBackendResponse>(`/api/products/${id}/`);

    if (!response.data) {
      throw new Error('Product not found');
    }

    console.log('Fetched product:', response.data.name);
    return transformProduct(response.data);
  } catch (error) {
    console.error(`Error fetching product ${id}:`, error);
    throw handleApiError(error);
  }
};

/**
 * Create new product with multipart image upload
 * POST /api/products/
 *
 * IMPORTANT: Handles multipart/form-data with multiple images
 */
export const createProduct = async (data: ProductCreateRequest): Promise<Product> => {
  try {
    const formData = new FormData();

    // Add text fields
    formData.append('name', data.name);
    formData.append('description', data.description);
    formData.append('barcode', data.barcode);
    formData.append('category', data.category);
    formData.append('price', data.price);
    formData.append('quantity', data.quantity.toString());

    // Optional fields
    if (data.subcategory) formData.append('subcategory', data.subcategory);
    if (data.brand) formData.append('brand', data.brand);
    if (data.discounted_price) formData.append('discounted_price', data.discounted_price);
    if (data.in_stock !== undefined) formData.append('in_stock', String(data.in_stock));
    if (data.min_quantity !== undefined) formData.append('min_quantity', String(data.min_quantity));

    // JSON fields - send as JSON strings to match mobile contract
    if (data.sizes) {
      formData.append('sizes', data.sizes);
    }
    if (data.colors) {
      formData.append('colors', data.colors);
    }
    if (data.size_quantities) {
      formData.append('size_quantities', data.size_quantities);
    }

    // Images - append multiple files
    // Backend expects 'uploaded_images' field name for Cloudinary upload
    if (data.images && data.images.length > 0) {
      data.images.forEach((image) => {
        formData.append('uploaded_images', image);
      });
    }

    const response = await apiClient.post<ProductBackendResponse>('/api/products/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    console.log('Product created with Cloudinary images:', response.data.imagePaths);
    return transformProduct(response.data);
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Update product (full update)
 * PUT /api/products/{id}/
 */
export const updateProduct = async (
  id: string,
  data: Partial<ProductCreateRequest>
): Promise<Product> => {
  try {
    const formData = new FormData();

    // Add fields that are present
    Object.entries(data).forEach(([key, value]) => {
      if (value === undefined || value === null) return;

      if (key === 'images' && Array.isArray(value)) {
        // Append images with 'uploaded_images' field name for Cloudinary
        value.forEach((image: File) => {
          formData.append('uploaded_images', image);
        });
      } else {
        formData.append(key, String(value));
      }
    });

    const response = await apiClient.put<ProductBackendResponse>(
      `/api/products/${id}/`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    return transformProduct(response.data);
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Delete product
 * DELETE /api/products/{id}/
 */
export const deleteProduct = async (id: string): Promise<void> => {
  try {
    await apiClient.delete(`/api/products/${id}/`);
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Search products by name or description
 */
export const searchProducts = async (query: string): Promise<Product[]> => {
  return getProducts({ search: query });
};

/**
 * Get products by category
 */
export const getProductsByCategory = async (category: string): Promise<Product[]> => {
  return getProducts({ category: category as any });
};

/**
 * Get products on sale (discounted_price > 0)
 */
export const getSaleProducts = async (): Promise<Product[]> => {
  const allProducts = await getProducts();
  return allProducts.filter((p) => p.discountedPrice && p.discountedPrice > 0);
};

/**
 * Get featured/new products (sorted by created_at desc)
 */
export const getFeaturedProducts = async (limit: number = 8): Promise<Product[]> => {
  const products = await getProducts({ ordering: '-created_at' });
  return products.slice(0, limit);
};
