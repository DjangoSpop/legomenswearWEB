'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCartStore } from '@/lib/store/cart';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Price from '../components/ui/Price';
import {
  buildWhatsAppMessage,
  getWhatsAppLink,
  copyToClipboard,
  STORE_WHATSAPP_NUMBER,
  generateOrderReference,
} from '@/lib/utils/whatsapp';
import { createOrder } from '@/lib/api/orders';
import type { CreateOrderRequest } from '@/lib/types/api';

export default function CartPage() {
  const { items, removeItem, updateQuantity, clearCart, getTotal } = useCartStore();
  const [showCheckout, setShowCheckout] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [copied, setCopied] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [previewMessage, setPreviewMessage] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [orderReference, setOrderReference] = useState('');
  const [isSavingOrder, setIsSavingOrder] = useState(false);
  const [orderSaveError, setOrderSaveError] = useState<string | null>(null);

  const total = getTotal();

  const handlePreview = () => {
    if (!customerName || !customerPhone) {
      alert('Please enter your name and phone number to preview');
      return;
    }

    const message = buildWhatsAppMessage({
      customerName,
      customerPhone,
      customerAddress,
      items,
      total,
    });

    setPreviewMessage(message);
    setShowPreview(true);
  };

  const handleCheckout = async () => {
    if (!customerName || !customerPhone) {
      alert('Please enter your name and phone number');
      return;
    }

    setIsSavingOrder(true);
    setOrderSaveError(null);

    try {
      // Generate order reference (consistent with WhatsApp message)
      const orderRef = generateOrderReference();
      const orderDate = new Date().toISOString();

      // Calculate item count (total quantity of all items)
      const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

      // Prepare order data for backend (snake_case as per API spec)
      const orderData: CreateOrderRequest = {
        order_reference: orderRef,
        order_date: orderDate,
        customer_name: customerName,
        customer_phone: customerPhone,
        customer_address: customerAddress || undefined,
        items: items.map((item) => ({
          product: item.productId, // UUID of product
          product_name: item.name,
          product_barcode: item.barcode,
          product_image: item.image,
          quantity: item.quantity,
          unit_price: item.unitPrice.toFixed(2), // Send as string decimal
          selected_size: item.selectedSize,
          selected_color: item.selectedColor,
        })),
        total: total.toFixed(2), // Send as string decimal
        item_count: itemCount, // Total quantity of items
      };

      // Save order to backend
      const savedOrder = await createOrder(orderData);
      console.log('Order saved to backend:', savedOrder);

      // Build WhatsApp message with the saved order reference
      const message = buildWhatsAppMessage(
        {
          customerName,
          customerPhone,
          customerAddress,
          items,
          total,
        },
        savedOrder.orderReference // Use backend order reference
      );

      const whatsappUrl = getWhatsAppLink(STORE_WHATSAPP_NUMBER, message);

      // Set order reference for success modal
      setOrderReference(savedOrder.orderReference);

      // Open WhatsApp
      window.open(whatsappUrl, '_blank');

      // Optionally copy to clipboard
      copyToClipboard(message).then((success) => {
        if (success) {
          setCopied(true);
          setTimeout(() => setCopied(false), 3000);
        }
      });

      // Show success modal and clear cart
      setShowSuccessModal(true);

      // Clear the cart after order is sent
      setTimeout(() => {
        clearCart();
        setCustomerName('');
        setCustomerPhone('');
        setCustomerAddress('');
        setShowCheckout(false);
      }, 500);
    } catch (error) {
      console.error('Failed to save order to backend:', error);
      setOrderSaveError(
        'Failed to save order. You can still send via WhatsApp, but please inform the store about this issue.'
      );

      // Allow user to proceed with WhatsApp even if backend fails
      const message = buildWhatsAppMessage({
        customerName,
        customerPhone,
        customerAddress,
        items,
        total,
      });

      const orderRefMatch = message.match(/\*Order Ref:\* ([^\n]+)/);
      const orderRef = orderRefMatch ? orderRefMatch[1] : 'N/A';
      setOrderReference(orderRef);

      const whatsappUrl = getWhatsAppLink(STORE_WHATSAPP_NUMBER, message);
      window.open(whatsappUrl, '_blank');

      // Don't clear cart if backend failed, in case they want to retry
    } finally {
      setIsSavingOrder(false);
    }
  };

  const handleCopyMessage = async () => {
    if (!customerName || !customerPhone) {
      alert('Please enter your name and phone number');
      return;
    }

    const message = buildWhatsAppMessage({
      customerName,
      customerPhone,
      customerAddress,
      items,
      total,
    });

    const success = await copyToClipboard(message);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  if (items.length === 0) {
    return (
      <div className="container-page py-12 text-center">
        <h1 className="text-3xl font-light tracking-tight mb-4">Your cart is empty</h1>
        <p className="text-brand-gray mb-8">Start shopping to add items to your cart</p>
        <Link href="/products" className="btn-primary inline-block">
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="container-page py-8 md:py-12">
      <h1 className="text-3xl md:text-4xl font-light tracking-tight mb-8">Shopping Cart</h1>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <div
              key={`${item.productId}-${item.selectedSize}`}
              className="card p-4 md:p-6 flex gap-4"
            >
              {/* Image */}
              <div className="relative w-24 h-32 md:w-32 md:h-40 flex-shrink-0 bg-brand-lightgray overflow-hidden">
                {item.image && (
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    className="object-cover"
                    sizes="128px"
                  />
                )}
              </div>

              {/* Details */}
              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-medium mb-1">{item.name}</h3>
                  {item.barcode && (
                    <p className="text-caption text-brand-gray font-mono">SKU: {item.barcode}</p>
                  )}
                  {item.category && (
                    <p className="text-caption text-brand-gray">{item.category}</p>
                  )}
                  {item.selectedSize && (
                    <p className="text-caption text-brand-gray">Size: {item.selectedSize}</p>
                  )}
                  {item.selectedColor && (
                    <p className="text-caption text-brand-gray">Color: {item.selectedColor}</p>
                  )}
                  <Price price={item.unitPrice} className="mt-2" />
                </div>

                <div className="flex items-center justify-between mt-4">
                  {/* Quantity */}
                  <div className="flex items-center border border-brand-lightgray">
                    <button
                      type="button"
                      onClick={() =>
                        updateQuantity(item.productId, item.quantity - 1, item.selectedSize)
                      }
                      className="px-3 py-1 hover:bg-brand-offwhite"
                      aria-label="Decrease quantity"
                    >
                      −
                    </button>
                    <span className="px-4 py-1 text-body">{item.quantity}</span>
                    <button
                      type="button"
                      onClick={() =>
                        updateQuantity(item.productId, item.quantity + 1, item.selectedSize)
                      }
                      className="px-3 py-1 hover:bg-brand-offwhite"
                      aria-label="Increase quantity"
                    >
                      +
                    </button>
                  </div>

                  {/* Remove */}
                  <button
                    type="button"
                    onClick={() => removeItem(item.productId, item.selectedSize)}
                    className="text-caption text-brand-gray hover:text-accent-red transition-colors"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={clearCart}
            className="text-caption text-brand-gray hover:text-accent-red transition-colors"
          >
            Clear Cart
          </button>
        </div>

        {/* Checkout Summary */}
        <div className="lg:col-span-1">
          <div className="card p-6 sticky top-24 space-y-6">
            <h2 className="text-xl font-medium">Order Summary</h2>

            <div className="space-y-2 text-body">
              <div className="flex justify-between">
                <span className="text-brand-gray">Subtotal</span>
                <Price price={total} />
              </div>
              <div className="flex justify-between">
                <span className="text-brand-gray">Delivery</span>
                <span>TBD</span>
              </div>
            </div>

            <div className="border-t border-brand-lightgray pt-4">
              <div className="flex justify-between text-lg font-medium">
                <span>Total</span>
                <Price price={total} />
              </div>
            </div>

            {!showCheckout ? (
              <Button
                variant="primary"
                fullWidth
                onClick={() => setShowCheckout(true)}
              >
                Checkout via WhatsApp
              </Button>
            ) : (
              <div className="space-y-4">
                <p className="text-caption text-brand-gray">
                  Enter your details to complete the order via WhatsApp
                </p>

                <Input
                  label="Your Name"
                  placeholder="John Doe"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  required
                />

                <Input
                  label="Phone Number"
                  type="tel"
                  placeholder="+1234567890"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  required
                />

                <Input
                  label="Delivery Address (Optional)"
                  placeholder="123 Main St, City, Country"
                  value={customerAddress}
                  onChange={(e) => setCustomerAddress(e.target.value)}
                />

                <div className="space-y-2">
                  {/* Error Message */}
                  {orderSaveError && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-caption text-red-700">
                      {orderSaveError}
                    </div>
                  )}

                  {/* Preview Button */}
                  <Button
                    variant="secondary"
                    fullWidth
                    onClick={handlePreview}
                    type="button"
                    disabled={isSavingOrder}
                  >
                    👁️ Preview Message
                  </Button>

                  {/* Send to WhatsApp */}
                  <Button
                    variant="primary"
                    fullWidth
                    onClick={handleCheckout}
                    type="button"
                    disabled={isSavingOrder}
                  >
                    {isSavingOrder ? '💾 Saving Order...' : '📱 Send Order via WhatsApp'}
                  </Button>

                  {/* Copy to Clipboard */}
                  <Button
                    variant="outline"
                    fullWidth
                    onClick={handleCopyMessage}
                    type="button"
                    disabled={isSavingOrder}
                  >
                    {copied ? '✓ Copied!' : '📋 Copy Message'}
                  </Button>
                </div>

                <button
                  type="button"
                  onClick={() => setShowCheckout(false)}
                  className="text-caption text-brand-gray hover:text-brand-black transition-colors w-full text-center"
                >
                  Cancel
                </button>
              </div>
            )}

            <p className="text-caption text-brand-gray text-center pt-4 border-t">
              Your order will be confirmed via WhatsApp
            </p>
          </div>
        </div>
      </div>

      {/* Message Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-brand-lightgray">
              <h3 className="text-xl font-medium">WhatsApp Message Preview</h3>
              <button
                type="button"
                onClick={() => setShowPreview(false)}
                className="p-2 hover:bg-brand-offwhite rounded-full transition-colors"
                aria-label="Close preview"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Message Content */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-green-700 mb-1">WhatsApp Message</p>
                    <p className="text-xs text-green-600">This is how it will appear in WhatsApp</p>
                  </div>
                </div>

                <pre className="whitespace-pre-wrap font-sans text-sm text-gray-800 leading-relaxed">
                  {previewMessage}
                </pre>
              </div>

              {/* Info Box */}
              <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  <strong>💡 Tip:</strong> The message includes SKU codes (barcodes) for easy order processing by the store.
                </p>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="p-6 border-t border-brand-lightgray space-y-3">
              <Button
                variant="primary"
                fullWidth
                onClick={() => {
                  setShowPreview(false);
                  setTimeout(() => handleCheckout(), 100);
                }}
                type="button"
              >
                📱 Send via WhatsApp
              </Button>

              <Button
                variant="outline"
                fullWidth
                onClick={async () => {
                  const success = await copyToClipboard(previewMessage);
                  if (success) {
                    setCopied(true);
                    setTimeout(() => setCopied(false), 3000);
                  }
                }}
                type="button"
              >
                {copied ? '✓ Copied!' : '📋 Copy Message'}
              </Button>

              <button
                type="button"
                onClick={() => setShowPreview(false)}
                className="text-caption text-brand-gray hover:text-brand-black transition-colors w-full text-center py-2"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Order Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full overflow-hidden">
            {/* Success Header */}
            <div className="bg-green-500 p-6 text-white text-center">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-2xl font-medium mb-2">Order Sent Successfully!</h3>
              <p className="text-green-100">Your order has been sent via WhatsApp</p>
            </div>

            {/* Success Content */}
            <div className="p-6 space-y-4">
              <div className="bg-brand-offwhite rounded-lg p-4">
                <p className="text-sm text-brand-gray mb-2">Order Reference:</p>
                <p className="text-lg font-mono font-medium">{orderReference}</p>
              </div>

              <div className="space-y-2 text-sm text-brand-gray">
                <p className="flex items-start gap-2">
                  <span className="text-green-500 mt-0.5">✓</span>
                  <span>Your cart has been cleared</span>
                </p>
                <p className="flex items-start gap-2">
                  <span className="text-green-500 mt-0.5">✓</span>
                  <span>Order details sent to WhatsApp</span>
                </p>
                <p className="flex items-start gap-2">
                  <span className="text-green-500 mt-0.5">✓</span>
                  <span>Store will confirm availability and delivery fee</span>
                </p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  <strong>📱 Next Steps:</strong> Please check your WhatsApp for order confirmation from the store within 24 hours.
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="p-6 pt-0 space-y-3">
              <Link href="/products" className="block">
                <Button variant="primary" fullWidth>
                  Continue Shopping
                </Button>
              </Link>

              <button
                type="button"
                onClick={() => setShowSuccessModal(false)}
                className="text-caption text-brand-gray hover:text-brand-black transition-colors w-full text-center py-2"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
