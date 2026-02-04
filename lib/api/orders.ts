/**
 * Orders API module
 * Handles order creation, retrieval, and management
 * Transforms between backend snake_case and frontend camelCase
 */

import { apiClient } from './client';
import type {
  Order,
  OrderBackend,
  OrderItem,
  OrderItemBackend,
  CreateOrderRequest,
  UpdateOrderStatusRequest,
  ConfirmOrderResponse,
  ConfirmOrderResponseTransformed,
} from '../types/api';

// ============================================================================
// TRANSFORMATION UTILITIES
// ============================================================================

/**
 * Transform backend OrderItem (snake_case) to frontend OrderItem (camelCase)
 */
function transformOrderItem(item: OrderItemBackend): OrderItem {
  return {
    id: item.id,
    product: item.product,
    productName: item.product_name,
    productBarcode: item.product_barcode,
    productImage: item.product_image,
    quantity: item.quantity,
    unitPrice: parseFloat(item.unit_price),
    selectedSize: item.selected_size,
    selectedColor: item.selected_color,
    subtotal: parseFloat(item.subtotal),
  };
}

/**
 * Transform backend Order (snake_case) to frontend Order (camelCase)
 */
function transformOrder(order: OrderBackend): Order {
  return {
    id: order.id,
    orderReference: order.order_reference,
    orderDate: order.order_date,
    customerName: order.customer_name,
    customerPhone: order.customer_phone,
    customerAddress: order.customer_address,
    user: order.user,
    status: order.status,
    items: order.items ? order.items.map(transformOrderItem) : undefined,
    total: parseFloat(order.total),
    itemCount: order.item_count,
    createdAt: order.created_at,
    updatedAt: order.updated_at,
  };
}

// ============================================================================
// ORDER ENDPOINTS
// ============================================================================

/**
 * Create a new order (guest or authenticated)
 * POST /api/api/orders/
 * 
 * @param orderData - Order details including customer info and items (snake_case)
 * @returns Created order with ID (transformed to camelCase)
 */
export async function createOrder(orderData: CreateOrderRequest): Promise<Order> {
  const response = await apiClient.post<OrderBackend>('/api/orders/', orderData);
  return transformOrder(response.data);
}

/**
 * Get all orders (with role-based filtering on backend)
 * - Admin/Seller: Returns all orders
 * - Buyer: Returns only their orders (if authenticated)
 * - Guest: Returns empty array (no auth)
 * 
 * GET /api/api/orders/
 * 
 * @param params - Optional filters (status, date range, etc.)
 * @returns Array of orders (transformed to camelCase)
 */
export async function getOrders(params?: {
  status?: string;
  ordering?: string;
  search?: string;
}): Promise<Order[]> {
  const response = await apiClient.get<OrderBackend[]>('/api/orders/', { params });
  return response.data.map(transformOrder);
}

/**
 * Get customer's order history (requires authentication)
 * GET /api/api/orders/my-orders/
 * 
 * @returns Array of user's orders (transformed to camelCase)
 */
export async function getMyOrders(): Promise<Order[]> {
  const response = await apiClient.get<OrderBackend[]>('/api/orders/my-orders/');
  return response.data.map(transformOrder);
}

/**
 * Get order details by ID
 * GET /api/api/orders/{id}/
 * 
 * @param orderId - Order UUID
 * @returns Order details with items (transformed to camelCase)
 */
export async function getOrderById(orderId: string): Promise<Order> {
  const response = await apiClient.get<OrderBackend>(`/api/orders/${orderId}/`);
  return transformOrder(response.data);
}

/**
 * Update order status (admin/seller only)
 * PATCH /api/api/orders/{id}/
 * 
 * @param orderId - Order UUID
 * @param statusData - New status
 * @returns Updated order (transformed to camelCase)
 */
export async function updateOrderStatus(
  orderId: string,
  statusData: UpdateOrderStatusRequest
): Promise<Order> {
  const response = await apiClient.patch<OrderBackend>(
    `/api/api/orders/${orderId}/`,
    statusData
  );
  return transformOrder(response.data);
}

/**
 * Confirm order and reduce stock (admin/seller only)
 * POST /api/api/orders/{id}/confirm/
 * 
 * This endpoint:
 * 1. Changes order status to 'confirmed'
 * 2. Reduces stock quantity for each product in the order
 * 3. Validates stock availability before confirming
 * 
 * @param orderId - Order UUID
 * @returns Confirmation response with stock update status (order transformed to camelCase)
 */
export async function confirmOrder(orderId: string): Promise<ConfirmOrderResponseTransformed> {
  const response = await apiClient.post<ConfirmOrderResponse>(
    `/api/orders/${orderId}/confirm/`
  );
  
  // Transform the order in the response
  if (response.data.order) {
    return {
      success: response.data.success,
      order: transformOrder(response.data.order),
      stockUpdated: response.data.stock_updated,
      message: response.data.message,
    };
  }
  
  return {
    success: response.data.success,
    order: transformOrder(response.data.order),
    stockUpdated: response.data.stock_updated,
    message: response.data.message,
  };
}

/**
 * Cancel an order
 * PATCH /api/orders/{id}/
 * 
 * @param orderId - Order UUID
 * @returns Updated order
 */
export async function cancelOrder(orderId: string): Promise<Order> {
  return updateOrderStatus(orderId, { status: 'cancelled' });
}
