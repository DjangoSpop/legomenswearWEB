/**
 * WhatsApp checkout utilities
 * Generates formatted messages and deep links
 */

import { WhatsAppCheckoutData } from '@/lib/types/api';

/**
 * Generate order reference number
 */
export const generateOrderReference = (): string => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `LEG-${timestamp}-${random}`;
};

/**
 * Build WhatsApp message from cart data
 * Professional format optimized for store order processing
 * @param data - Order data including customer info and items
 * @param customOrderRef - Optional pre-generated order reference (e.g., from backend)
 */
export const buildWhatsAppMessage = (
  data: WhatsAppCheckoutData,
  customOrderRef?: string
): string => {
  const { customerName, customerPhone, customerAddress, items, total } = data;

  // Use custom order reference if provided, otherwise generate one
  const orderRef = customOrderRef || generateOrderReference();
  const orderDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  let message = `╔═══════════════════════════╗\n`;
  message += `   *LEGO MENS WEAR*\n`;
  message += `   📦 NEW ORDER REQUEST\n`;
  message += `╚═══════════════════════════╝\n\n`;

  message += `*Order Ref:* ${orderRef}\n`;
  message += `*Date:* ${orderDate}\n\n`;

  message += `┌─ 👤 CUSTOMER INFO ─────────┐\n`;
  message += `│ Name:    ${customerName}\n`;
  message += `│ Phone:   ${customerPhone}\n`;
  if (customerAddress) {
    message += `│ Address: ${customerAddress}\n`;
  }
  message += `└────────────────────────────┘\n\n`;

  message += `┌─ 📋 ORDER ITEMS ───────────┐\n`;
  items.forEach((item, index) => {
    message += `│\n`;
    message += `│ ${index + 1}. *${item.name}*\n`;

    // SKU/Barcode - CRITICAL for store processing
    if (item.barcode) {
      message += `│    📌 SKU: *${item.barcode}*\n`;
    }

    // Product ID (canonical UUID)
    message += `│    🔑 ID: ${item.productId}\n`;

    // Primary image URL
    if (item.image) {
      message += `│    🖼️ Image: ${item.image}\n`;
    }

    // Product share URL
    if (item.shareUrl) {
      message += `│    🔗 Link: ${item.shareUrl}\n`;
    }

    // Variant info (size, color)
    if (item.selectedSize) {
      message += `│    📏 Size: ${item.selectedSize}\n`;
    }
    if (item.selectedColor) {
      message += `│    🎨 Color: ${item.selectedColor}\n`;
    }

    // Pricing
    message += `│    💰 Price: $${item.unitPrice.toFixed(2)} × ${item.quantity}\n`;
    message += `│    💵 Subtotal: $${(item.quantity * item.unitPrice).toFixed(2)}\n`;
  });
  message += `│\n`;
  message += `└────────────────────────────┘\n\n`;

  // Order summary
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  message += `┌─ 💳 ORDER SUMMARY ─────────┐\n`;
  message += `│ Total Items:  ${itemCount}\n`;
  message += `│ Subtotal:     $${total.toFixed(2)}\n`;
  message += `│ Delivery:     TBD\n`;
  message += `│ ────────────────────────\n`;
  message += `│ *TOTAL:       $${total.toFixed(2)}*\n`;
  message += `└────────────────────────────┘\n\n`;

  message += `📝 *Next Steps:*\n`;
  message += `1. Confirm product availability\n`;
  message += `2. Calculate delivery fee\n`;
  message += `3. Send final invoice\n`;
  message += `4. Process payment\n\n`;

  message += `⏰ Please confirm within 24 hours.\n`;
  message += `Thank you for choosing LEGO Mens Wear! 🎉`;

  return message;
};

/**
 * Generate WhatsApp Web deep link
 * @param phoneNumber - Store phone number (with country code, no +)
 * @param message - Pre-filled message
 */
export const getWhatsAppLink = (phoneNumber: string, message: string): string => {
  const encodedMessage = encodeURIComponent(message);
  // Remove all non-numeric characters from phone number
  const cleanPhone = phoneNumber.replace(/\D/g, '');
  return `https://wa.me/${cleanPhone}?text=${encodedMessage}`;
};

/**
 * Copy text to clipboard
 */
export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    } else {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        document.execCommand('copy');
        textArea.remove();
        return true;
      } catch (error) {
        console.error('Fallback: Oops, unable to copy', error);
        textArea.remove();
        return false;
      }
    }
  } catch (error) {
    console.error('Failed to copy:', error);
    return false;
  }
};

/**
 * Default store WhatsApp number
 * Update this with actual store number
 */
export const STORE_WHATSAPP_NUMBER = '+201550881556'; // Replace with actual number

/**
 * Format order confirmation message for WhatsApp
 * Used by admin/seller to contact customer about their order
 * @param order - Order data from the system
 * @param baseUrl - Base URL of the application (e.g., https://yourapp.com)
 */
export const formatOrderForWhatsApp = (order: {
  orderReference: string;
  orderDate: string;
  customerName: string;
  total: number;
  itemCount: number;
  status: string;
  items?: Array<{
    id: string;
    product: string;
    productName?: string;
    productBarcode?: string;
    quantity: number;
    unitPrice: number;
    selectedSize?: string;
    selectedColor?: string;
  }>;
}, baseUrl: string = typeof window !== 'undefined' ? window.location.origin : ''): string => {
  const orderDate = new Date(order.orderDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  let message = `╔═══════════════════════════╗\n`;
  message += `   *LEGO MENS WEAR*\n`;
  message += `   📦 ORDER CONFIRMATION\n`;
  message += `╚═══════════════════════════╝\n\n`;

  message += `Hello *${order.customerName}*! 👋\n\n`;
  message += `Thank you for your order!\n\n`;

  message += `*Order Reference:* ${order.orderReference}\n`;
  message += `*Date:* ${orderDate}\n`;
  message += `*Status:* ${order.status.toUpperCase()}\n\n`;

  // If items are available, show detailed list
  if (order.items && order.items.length > 0) {
    message += `┌─ 📋 YOUR ORDER ITEMS ──────┐\n`;
    order.items.forEach((item, index) => {
      message += `│\n`;
      message += `│ ${index + 1}. *${item.productName || item.product}*\n`;
      
      // Product link
      const productUrl = `${baseUrl}/products/${item.product}`;
      message += `│    🔗 View: ${productUrl}\n`;

      // SKU/Barcode
      if (item.productBarcode) {
        message += `│    📌 SKU: ${item.productBarcode}\n`;
      }

      // Variant info
      if (item.selectedSize) {
        message += `│    📏 Size: ${item.selectedSize}\n`;
      }
      if (item.selectedColor) {
        message += `│    🎨 Color: ${item.selectedColor}\n`;
      }

      // Pricing
      message += `│    💰 Price: $${item.unitPrice.toFixed(2)} × ${item.quantity}\n`;
      message += `│    💵 Subtotal: $${(item.quantity * item.unitPrice).toFixed(2)}\n`;
    });
    message += `│\n`;
    message += `└────────────────────────────┘\n\n`;
  } else {
    // Fallback when items are not loaded
    message += `📦 *Order Summary:*\n`;
    message += `Total Items: ${order.itemCount}\n\n`;
  }

  // Order total
  message += `┌─ 💳 ORDER TOTAL ───────────┐\n`;
  message += `│ *TOTAL: $${order.total.toFixed(2)}*\n`;
  message += `└────────────────────────────┘\n\n`;

  message += `📝 *Next Steps:*\n`;
  message += `• We'll confirm product availability\n`;
  message += `• Calculate delivery fee to your location\n`;
  message += `• Send you final invoice\n`;
  message += `• Arrange payment & delivery\n\n`;

  message += `If you have any questions about your order, please reply to this message.\n\n`;
  message += `Thank you for choosing LEGO Mens Wear! 🎉`;

  return message;
};
