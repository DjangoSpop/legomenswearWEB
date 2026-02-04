'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  getOrders,
  updateOrderStatus,
  confirmOrder,
} from '@/lib/api/orders';
import type { Order, OrderStatus } from '@/lib/types/api';
import Button from '@/app/components/ui/Button';
import Price from '@/app/components/ui/Price';
import { formatOrderForWhatsApp, getWhatsAppLink, copyToClipboard } from '@/lib/utils/whatsapp';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all');
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const params = statusFilter !== 'all' ? { status: statusFilter } : {};
      const data = await getOrders(params);
      setOrders(data);
    } catch (err) {
      console.error('Failed to fetch orders:', err);
      setError('Failed to load orders. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter]);

  // Fetch orders on mount and when filter changes
  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    try {
      setUpdatingOrderId(orderId);
      const updatedOrder = await updateOrderStatus(orderId, { status: newStatus });
      
      // Update local state
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.id === orderId ? (updatedOrder as unknown as Order) : order
        )
      );
      
      alert(`Order status updated to: ${newStatus}`);
    } catch (err) {
      console.error('Failed to update order status:', err);
      alert('Failed to update order status. Please try again.');
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const handleConfirmOrder = async (orderId: string) => {
    const confirmed = confirm(
      'Confirm this order? This will:\n' +
      '1. Change status to "confirmed"\n' +
      '2. Reduce product stock quantities\n' +
      '\nThis action validates stock availability before confirming.'
    );

    if (!confirmed) return;

    try {
      setUpdatingOrderId(orderId);
      const response = await confirmOrder(orderId);
      
      if (response.success) {
        // Update local state with the transformed order
        setOrders((prevOrders) =>
          prevOrders.map((order) =>
            order.id === orderId ? (response.order as unknown as Order) : order
          )
        );
        
        const stockMsg = response.stockUpdated ? ' Stock has been updated.' : '';
        alert(`Order confirmed successfully!${stockMsg}`);
      } else {
        alert(response.message || 'Failed to confirm order.');
      }
    } catch (err: any) {
      console.error('Failed to confirm order:', err);
      const errorMessage = err.response?.data?.error || err.response?.data?.details?.join(', ') || 'Failed to confirm order. Please try again.';
      alert(errorMessage);
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const toggleOrderDetails = (orderId: string) => {
    setExpandedOrderId(expandedOrderId === orderId ? null : orderId);
  };

  const getStatusColor = (status: OrderStatus): string => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'processing':
        return 'bg-purple-100 text-purple-800';
      case 'shipped':
        return 'bg-indigo-100 text-indigo-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-black mx-auto"></div>
          <p className="mt-4 text-brand-gray">Loading orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <h1 className="text-3xl md:text-4xl font-light tracking-tight mb-4 md:mb-0">
          Order Management
        </h1>
        
        <div className="flex items-center gap-4">
          <select
            title='status'
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as OrderStatus | 'all')}
            className="border border-brand-lightgray px-4 py-2 rounded-lg text-body"
          >
            <option value="all">All Orders</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
          
          <Button variant="secondary" onClick={fetchOrders}>
            🔄 Refresh
          </Button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-red-700">
          {error}
        </div>
      )}

      {orders.length === 0 ? (
        <div className="card p-12 text-center">
          <p className="text-brand-gray text-lg">
            {statusFilter === 'all'
              ? 'No orders found.'
              : `No ${statusFilter} orders found.`}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="card overflow-hidden">
              {/* Order Header */}
              <div
                className="p-6 cursor-pointer hover:bg-brand-offwhite transition-colors"
                onClick={() => toggleOrderDetails(order.id)}
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-mono font-medium text-lg">
                        {order.orderReference}
                      </h3>
                      <span
                        className={`px-3 py-1 rounded-full text-caption font-medium ${getStatusColor(
                          order.status
                        )}`}
                      >
                        {order.status.toUpperCase()}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-body text-brand-gray">
                      <div>
                        <span className="font-medium">Customer:</span> {order.customerName}
                      </div>
                      <div>
                        <span className="font-medium">Phone:</span> {order.customerPhone}
                      </div>
                      <div>
                        <span className="font-medium">Date:</span>{' '}
                        {new Date(order.orderDate).toLocaleString()}
                      </div>
                      <div>
                        <span className="font-medium">Items:</span> {order.itemCount}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-caption text-brand-gray mb-1">Total</p>
                      <Price price={order.total} className="text-xl font-medium" />
                    </div>
                    
                    <svg
                      className={`w-5 h-5 text-brand-gray transition-transform ${
                        expandedOrderId === order.id ? 'rotate-180' : ''
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Order Details (Expandable) */}
              {expandedOrderId === order.id && (
                <div className="border-t border-brand-lightgray p-6 bg-brand-offwhite">
                  {/* Customer Details */}
                  <div className="mb-6">
                    <h4 className="font-medium mb-3">Customer Information</h4>
                    <div className="bg-white rounded-lg p-4 space-y-2 text-body">
                      <div>
                        <span className="text-brand-gray">Name:</span>{' '}
                        <span className="font-medium">{order.customerName}</span>
                      </div>
                      <div>
                        <span className="text-brand-gray">Phone:</span>{' '}
                        <span className="font-medium">{order.customerPhone}</span>
                      </div>
                      {order.customerAddress && (
                        <div>
                          <span className="text-brand-gray">Address:</span>{' '}
                          <span className="font-medium">{order.customerAddress}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="mb-6">
                    <h4 className="font-medium mb-3">Order Items</h4>
                    {order.items && order.items.length > 0 ? (
                      <div className="bg-white rounded-lg overflow-hidden">
                        <table className="w-full text-body">
                          <thead className="bg-brand-lightgray">
                            <tr>
                              <th className="text-left p-3">Product</th>
                              <th className="text-left p-3">SKU</th>
                              <th className="text-left p-3">Details</th>
                              <th className="text-right p-3">Price</th>
                              <th className="text-center p-3">Qty</th>
                              <th className="text-right p-3">Subtotal</th>
                            </tr>
                          </thead>
                          <tbody>
                            {order.items.map((item) => (
                            <tr key={item.id} className="border-t border-brand-lightgray">
                              <td className="p-3">
                                <div className="flex items-center gap-2">
                                  <span>{item.productName || item.product}</span>
                                  {/* Product Link */}
                                  <a
                                    href={`/products/${item.product}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-brand-gray hover:text-brand-black transition-colors"
                                    title="View product"
                                  >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                    </svg>
                                  </a>
                                </div>
                              </td>
                              <td className="p-3 font-mono text-caption">
                                {item.productBarcode || 'N/A'}
                              </td>
                              <td className="p-3 text-caption text-brand-gray">
                                {item.selectedSize && `Size: ${item.selectedSize}`}
                                {item.selectedSize && item.selectedColor && ' | '}
                                {item.selectedColor && `Color: ${item.selectedColor}`}
                              </td>
                              <td className="p-3 text-right">
                                <Price price={item.unitPrice} />
                              </td>
                              <td className="p-3 text-center">{item.quantity}</td>
                              <td className="p-3 text-right">
                                <Price price={item.subtotal} />
                              </td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot className="bg-brand-lightgray font-medium">
                          <tr>
                            <td colSpan={5} className="p-3 text-right">
                              Total:
                            </td>
                            <td className="p-3 text-right">
                              <Price price={order.total} />
                            </td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                    ) : (
                      <div className="bg-white rounded-lg p-6 text-center text-brand-gray">
                        <p className="mb-2">
                          Item details are not available in the list view.
                        </p>
                        <p className="text-caption">
                          Total items: {order.itemCount} | Total: <Price price={order.total} />
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap gap-3">
                    {/* Confirm Order (only for pending orders) */}
                    {order.status === 'pending' && (
                      <Button
                        variant="primary"
                        onClick={() => handleConfirmOrder(order.id)}
                        disabled={updatingOrderId === order.id}
                      >
                        {updatingOrderId === order.id
                          ? '⏳ Confirming...'
                          : '✅ Confirm Order & Reduce Stock'}
                      </Button>
                    )}

                    {/* Status Change Dropdown */}
                    {order.status !== 'cancelled' && order.status !== 'delivered' && (
                      <select
                        value={order.status}
                        aria-label={`Change status for ${order.orderReference}`}
                        onChange={(e) =>
                          handleStatusChange(order.id, e.target.value as OrderStatus)
                        }
                        disabled={updatingOrderId === order.id}
                        className="border border-brand-lightgray px-4 py-2 rounded-lg text-body"
                      >
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    )}

                    {/* Open WhatsApp */}
                    <Button
                      variant="outline"
                      onClick={() => {
                        // Format order message with product links
                        const message = formatOrderForWhatsApp(order);
                        const whatsappUrl = getWhatsAppLink(
                          order.customerPhone,
                          message
                        );
                        window.open(whatsappUrl, '_blank');
                      }}
                    >
                      💬 Contact Customer
                    </Button>

                    {/* Copy Order Details */}
                    <Button
                      variant="outline"
                      onClick={async () => {
                        const message = formatOrderForWhatsApp(order);
                        const success = await copyToClipboard(message);
                        if (success) {
                          alert('Order details copied to clipboard!');
                        } else {
                          alert('Failed to copy. Please try again.');
                        }
                      }}
                    >
                      📋 Copy Details
                    </Button>
                  </div>

                  {/* Timestamps */}
                  <div className="mt-4 pt-4 border-t border-brand-lightgray text-caption text-brand-gray">
                    <span>Created: {new Date(order.createdAt).toLocaleString()}</span>
                    {' • '}
                    <span>Updated: {new Date(order.updatedAt).toLocaleString()}</span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
