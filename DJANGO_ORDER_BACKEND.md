# Django Backend Order Management Implementation Guide

## Overview

This document specifies the Django backend requirements for implementing order management that integrates with the WhatsApp checkout flow. Orders are created as "pending" and stock is reduced only when an admin confirms the order after payment verification via WhatsApp.

---

## 1. Database Models

Create these models in your Django app (e.g., `orders/models.py`):

### Order Model

```python
from django.db import models
from django.contrib.auth import get_user_model
from products.models import Product
import uuid

User = get_user_model()

class Order(models.Model):
    """
    Order model for WhatsApp-based checkout
    Supports both guest and authenticated user orders
    """
    
    STATUS_CHOICES = [
        ('pending', 'Pending'),         # Order created, awaiting admin review
        ('confirmed', 'Confirmed'),     # Admin confirmed, stock reduced
        ('processing', 'Processing'),   # Order being prepared
        ('shipped', 'Shipped'),         # Order dispatched
        ('delivered', 'Delivered'),     # Order delivered to customer
        ('cancelled', 'Cancelled'),     # Order cancelled
    ]
    
    # Primary fields
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    order_reference = models.CharField(
        max_length=50, 
        unique=True, 
        db_index=True,
        help_text="Order reference number (e.g., LEG-XXXX-XXXX)"
    )
    order_date = models.DateTimeField(help_text="Order creation timestamp from frontend")
    
    # Customer information (required for all orders)
    customer_name = models.CharField(max_length=255)
    customer_phone = models.CharField(max_length=20)
    customer_address = models.TextField(blank=True, null=True)
    
    # Optional user link (for authenticated customers)
    user = models.ForeignKey(
        User, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        related_name='orders',
        help_text="Linked user account (nullable for guest checkout)"
    )
    
    # Order status and totals
    status = models.CharField(
        max_length=20, 
        choices=STATUS_CHOICES, 
        default='pending',
        db_index=True
    )
    total = models.DecimalField(
        max_digits=10, 
        decimal_places=2,
        help_text="Order total (sum of item subtotals)"
    )
    item_count = models.IntegerField(
        help_text="Total quantity of items in order"
    )
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['-created_at']),
            models.Index(fields=['order_reference']),
            models.Index(fields=['status']),
        ]
    
    def __str__(self):
        return f"{self.order_reference} - {self.customer_name} - {self.status}"
    
    def calculate_item_count(self):
        """Calculate total quantity of items"""
        return sum(item.quantity for item in self.items.all())
    
    def calculate_total(self):
        """Calculate order total from item subtotals"""
        return sum(item.subtotal for item in self.items.all())
```

### OrderItem Model

```python
class OrderItem(models.Model):
    """
    Individual items within an order
    Stores product info at time of purchase (denormalized for historical accuracy)
    """
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    # Relationships
    order = models.ForeignKey(
        Order, 
        on_delete=models.CASCADE, 
        related_name='items'
    )
    product = models.ForeignKey(
        Product, 
        on_delete=models.PROTECT,  # Prevent product deletion if in orders
        related_name='order_items'
    )
    
    # Denormalized product info (snapshot at time of order)
    product_name = models.CharField(max_length=255)
    product_barcode = models.CharField(max_length=100, blank=True, null=True)
    product_image = models.URLField(blank=True, null=True)
    
    # Order details
    quantity = models.PositiveIntegerField(default=1)
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)
    selected_size = models.CharField(max_length=50, blank=True, null=True)
    selected_color = models.CharField(max_length=50, blank=True, null=True)
    subtotal = models.DecimalField(
        max_digits=10, 
        decimal_places=2,
        help_text="quantity * unit_price"
    )
    
    class Meta:
        ordering = ['id']
    
    def __str__(self):
        return f"{self.product_name} x{self.quantity} ({self.order.order_reference})"
    
    def save(self, *args, **kwargs):
        """Auto-calculate subtotal"""
        self.subtotal = self.quantity * self.unit_price
        super().save(*args, **kwargs)
```

---

## 2. Serializers

Create serializers in `orders/serializers.py`:

```python
from rest_framework import serializers
from .models import Order, OrderItem
from products.models import Product

class OrderItemSerializer(serializers.ModelSerializer):
    """Serializer for order items (read)"""
    
    product = serializers.UUIDField()  # Accept UUID on create
    
    class Meta:
        model = OrderItem
        fields = [
            'id',
            'product',
            'product_name',
            'product_barcode',
            'product_image',
            'quantity',
            'unit_price',
            'selected_size',
            'selected_color',
            'subtotal',
        ]
        read_only_fields = ['id', 'subtotal']


class OrderSerializer(serializers.ModelSerializer):
    """Main order serializer"""
    
    items = OrderItemSerializer(many=True)
    
    class Meta:
        model = Order
        fields = [
            'id',
            'order_reference',
            'order_date',
            'customer_name',
            'customer_phone',
            'customer_address',
            'user',
            'status',
            'items',
            'total',
            'item_count',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'user']
    
    def create(self, validated_data):
        """Create order with items"""
        items_data = validated_data.pop('items')
        
        # Link to authenticated user if available
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            validated_data['user'] = request.user
        
        # Create order
        order = Order.objects.create(**validated_data)
        
        # Create order items
        for item_data in items_data:
            product_id = item_data.pop('product')
            try:
                product = Product.objects.get(id=product_id)
                
                # Denormalize product data
                OrderItem.objects.create(
                    order=order,
                    product=product,
                    product_name=item_data.get('product_name', product.name),
                    product_barcode=item_data.get('product_barcode', product.barcode),
                    product_image=item_data.get('product_image', 
                                               product.image_paths[0] if product.image_paths else None),
                    quantity=item_data['quantity'],
                    unit_price=item_data['unit_price'],
                    selected_size=item_data.get('selected_size'),
                    selected_color=item_data.get('selected_color'),
                )
            except Product.DoesNotExist:
                raise serializers.ValidationError(f"Product {product_id} not found")
        
        return order


class OrderListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for order list (without items)"""
    
    class Meta:
        model = Order
        fields = [
            'id',
            'order_reference',
            'order_date',
            'customer_name',
            'customer_phone',
            'status',
            'total',
            'item_count',
            'created_at',
        ]


class OrderStatusUpdateSerializer(serializers.Serializer):
    """Serializer for status updates"""
    
    status = serializers.ChoiceField(choices=Order.STATUS_CHOICES)
```

---

## 3. ViewSets and Permissions

Create views in `orders/views.py`:

```python
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.db import transaction
from .models import Order, OrderItem
from .serializers import (
    OrderSerializer, 
    OrderListSerializer, 
    OrderStatusUpdateSerializer
)
from products.models import Product

class OrderPermission:
    """
    Custom permission for orders:
    - Anyone can create orders (guest checkout)
    - Buyers can view their own orders
    - Sellers/Admins can view all orders and update status
    """
    
    def has_permission(self, request, view):
        # Allow order creation without authentication (guest checkout)
        if view.action == 'create':
            return True
        
        # All other actions require authentication
        if not request.user.is_authenticated:
            return False
        
        # Sellers and admins can access all orders
        if request.user.role in ['seller', 'admin']:
            return True
        
        # Buyers can only access 'list' (filtered to their orders) and 'retrieve'
        return view.action in ['list', 'retrieve', 'my_orders']
    
    def has_object_permission(self, request, view, obj):
        # Sellers and admins can access any order
        if request.user.role in ['seller', 'admin']:
            return True
        
        # Buyers can only access their own orders
        if request.user.role == 'buyer':
            return obj.user == request.user
        
        return False


class OrderViewSet(viewsets.ModelViewSet):
    """
    ViewSet for order management
    
    Endpoints:
    - POST /api/orders/ - Create order (no auth required)
    - GET /api/orders/ - List orders (role-filtered)
    - GET /api/orders/{id}/ - Get order detail
    - PATCH /api/orders/{id}/ - Update order status (admin/seller)
    - POST /api/orders/{id}/confirm/ - Confirm order & reduce stock (admin/seller)
    - GET /api/orders/my-orders/ - Customer's order history (auth required)
    """
    
    queryset = Order.objects.all().prefetch_related('items__product')
    permission_classes = [OrderPermission]
    
    def get_serializer_class(self):
        if self.action == 'list':
            return OrderListSerializer
        elif self.action == 'partial_update':
            return OrderStatusUpdateSerializer
        return OrderSerializer
    
    def get_queryset(self):
        """Filter orders based on user role"""
        queryset = super().get_queryset()
        user = self.request.user
        
        # Unauthenticated users get no orders
        if not user.is_authenticated:
            return queryset.none()
        
        # Sellers and admins see all orders
        if user.role in ['seller', 'admin']:
            return queryset
        
        # Buyers see only their orders
        return queryset.filter(user=user)
    
    def create(self, request, *args, **kwargs):
        """Create a new order (guest or authenticated)"""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        
        headers = self.get_success_headers(serializer.data)
        return Response(
            serializer.data, 
            status=status.HTTP_201_CREATED, 
            headers=headers
        )
    
    def partial_update(self, request, *args, **kwargs):
        """Update order status (admin/seller only)"""
        instance = self.get_object()
        
        # Check permission
        if request.user.role not in ['seller', 'admin']:
            return Response(
                {'error': 'Only admins and sellers can update order status'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        instance.status = serializer.validated_data['status']
        instance.save()
        
        # Return full order data
        response_serializer = OrderSerializer(instance)
        return Response(response_serializer.data)
    
    @action(detail=True, methods=['post'], url_path='confirm')
    def confirm_order(self, request, pk=None):
        """
        Confirm order and reduce stock (admin/seller only)
        
        This endpoint:
        1. Validates stock availability for all items
        2. Changes order status to 'confirmed'
        3. Reduces stock quantity for each product
        
        Returns error if insufficient stock
        """
        # Check permission
        if request.user.role not in ['seller', 'admin']:
            return Response(
                {'error': 'Only admins and sellers can confirm orders'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        order = self.get_object()
        
        # Check if already confirmed
        if order.status == 'confirmed':
            return Response(
                {'error': 'Order is already confirmed'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Validate stock availability
        stock_errors = []
        for item in order.items.all():
            product = item.product
            if product.stock_quantity < item.quantity:
                stock_errors.append(
                    f"{product.name}: Insufficient stock "
                    f"(available: {product.stock_quantity}, required: {item.quantity})"
                )
        
        if stock_errors:
            return Response(
                {
                    'success': False,
                    'error': 'Insufficient stock for some items',
                    'details': stock_errors
                },
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Reduce stock and confirm order (atomic transaction)
        try:
            with transaction.atomic():
                for item in order.items.all():
                    product = item.product
                    product.stock_quantity -= item.quantity
                    
                    # Update in_stock flag if stock reaches zero
                    if product.stock_quantity <= 0:
                        product.in_stock = False
                    
                    product.save()
                
                # Update order status
                order.status = 'confirmed'
                order.save()
            
            # Return success response
            serializer = OrderSerializer(order)
            return Response({
                'success': True,
                'order': serializer.data,
                'stock_updated': True,
                'message': 'Order confirmed and stock updated successfully'
            })
        
        except Exception as e:
            return Response(
                {
                    'success': False,
                    'error': 'Failed to confirm order',
                    'details': str(e)
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=False, methods=['get'], url_path='my-orders')
    def my_orders(self, request):
        """Get authenticated user's orders"""
        if not request.user.is_authenticated:
            return Response(
                {'error': 'Authentication required'},
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        queryset = Order.objects.filter(user=request.user).prefetch_related('items__product')
        serializer = OrderSerializer(queryset, many=True)
        return Response(serializer.data)
```

---

## 4. URL Configuration

Add to `orders/urls.py`:

```python
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import OrderViewSet

router = DefaultRouter()
router.register(r'orders', OrderViewSet, basename='order')

urlpatterns = [
    path('api/', include(router.urls)),
]
```

Include in main `urls.py`:

```python
urlpatterns = [
    # ... other patterns
    path('', include('orders.urls')),
]
```

---

## 5. Admin Interface

Create `orders/admin.py`:

```python
from django.contrib import admin
from .models import Order, OrderItem

class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    readonly_fields = ['subtotal', 'product_name', 'product_barcode']
    fields = ['product', 'product_name', 'product_barcode', 'quantity', 'unit_price', 
              'selected_size', 'selected_color', 'subtotal']

@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ['order_reference', 'customer_name', 'customer_phone', 
                    'status', 'total', 'item_count', 'created_at']
    list_filter = ['status', 'created_at']
    search_fields = ['order_reference', 'customer_name', 'customer_phone']
    readonly_fields = ['id', 'created_at', 'updated_at', 'item_count', 'total']
    inlines = [OrderItemInline]
    
    fieldsets = (
        ('Order Information', {
            'fields': ('id', 'order_reference', 'order_date', 'status')
        }),
        ('Customer Information', {
            'fields': ('customer_name', 'customer_phone', 'customer_address', 'user')
        }),
        ('Order Summary', {
            'fields': ('total', 'item_count')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at')
        }),
    )

@admin.register(OrderItem)
class OrderItemAdmin(admin.ModelAdmin):
    list_display = ['product_name', 'order', 'quantity', 'unit_price', 'subtotal']
    search_fields = ['product_name', 'order__order_reference']
    readonly_fields = ['subtotal']
```

---

## 6. API Endpoints Summary

| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| `POST` | `/api/orders/` | No | Any | Create order (guest checkout) |
| `GET` | `/api/orders/` | Yes | All | List orders (filtered by role) |
| `GET` | `/api/orders/{id}/` | Yes | Owner/Admin | Get order detail |
| `PATCH` | `/api/orders/{id}/` | Yes | Admin/Seller | Update order status |
| `POST` | `/api/orders/{id}/confirm/` | Yes | Admin/Seller | Confirm order & reduce stock |
| `GET` | `/api/orders/my-orders/` | Yes | Buyer | Customer's order history |

---

## 7. Request/Response Examples

### Create Order (POST /api/orders/)

**Request:**
```json
{
  "orderReference": "LEG-LXYZ1234-AB5C",
  "orderDate": "2026-02-04T10:30:00Z",
  "customerName": "John Doe",
  "customerPhone": "+1234567890",
  "customerAddress": "123 Main St, City, Country",
  "items": [
    {
      "productId": "550e8400-e29b-41d4-a716-446655440000",
      "productName": "Classic T-Shirt",
      "productBarcode": "SKU-12345",
      "productImage": "https://res.cloudinary.com/.../image.jpg",
      "quantity": 2,
      "unitPrice": 29.99,
      "selectedSize": "L",
      "selectedColor": "Blue"
    }
  ],
  "total": 59.98
}
```

**Response (201 Created):**
```json
{
  "id": "7c9e6679-7425-40de-944b-e07fc1f90ae7",
  "orderReference": "LEG-LXYZ1234-AB5C",
  "orderDate": "2026-02-04T10:30:00Z",
  "customerName": "John Doe",
  "customerPhone": "+1234567890",
  "customerAddress": "123 Main St, City, Country",
  "user": null,
  "status": "pending",
  "items": [...],
  "total": "59.98",
  "itemCount": 2,
  "createdAt": "2026-02-04T10:30:05.123Z",
  "updatedAt": "2026-02-04T10:30:05.123Z"
}
```

### Confirm Order (POST /api/orders/{id}/confirm/)

**Response (200 OK):**
```json
{
  "success": true,
  "order": {
    "id": "...",
    "status": "confirmed",
    ...
  },
  "stockUpdated": true,
  "message": "Order confirmed and stock updated successfully"
}
```

**Error Response (400 Bad Request):**
```json
{
  "success": false,
  "error": "Insufficient stock for some items",
  "details": [
    "Classic T-Shirt: Insufficient stock (available: 1, required: 2)"
  ]
}
```

---

## 8. Database Migration

Run these commands to create the database tables:

```bash
python manage.py makemigrations orders
python manage.py migrate
```

---

## 9. Testing

Create tests in `orders/tests.py`:

```python
from django.test import TestCase
from django.contrib.auth import get_user_model
from products.models import Product
from .models import Order, OrderItem

User = get_user_model()

class OrderTestCase(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='testbuyer',
            email='buyer@test.com',
            password='testpass123',
            role='buyer'
        )
        
        self.product = Product.objects.create(
            name='Test Product',
            price=29.99,
            stock_quantity=10,
            in_stock=True
        )
    
    def test_create_order(self):
        order = Order.objects.create(
            order_reference='LEG-TEST-0001',
            order_date='2026-02-04T10:00:00Z',
            customer_name='John Doe',
            customer_phone='+1234567890',
            status='pending',
            total=59.98,
            item_count=2
        )
        
        OrderItem.objects.create(
            order=order,
            product=self.product,
            product_name=self.product.name,
            quantity=2,
            unit_price=29.99
        )
        
        self.assertEqual(order.items.count(), 1)
        self.assertEqual(order.items.first().subtotal, 59.98)
```

---

## 10. Environment Variables

Add to `.env`:

```env
# No additional environment variables needed for basic order management
# Existing API_BASE_URL and database settings are sufficient
```

---

## 11. OpenAPI Schema Update

Add to your OpenAPI schema (if using `drf-spectacular`):

```yaml
paths:
  /api/orders/:
    post:
      summary: Create order
      operationId: createOrder
      tags: [Orders]
      security: []  # No auth required
      requestBody:
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/OrderCreate'
      responses:
        '201':
          description: Order created
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Order'
```

---

## 12. Key Implementation Notes

### Guest Checkout
- `user` field is optional (nullable) on Order model
- Frontend doesn't require authentication to create orders
- Link to user automatically if authenticated (in serializer)

### Stock Management
- Stock is **NOT** reduced on order creation (status: pending)
- Stock is **ONLY** reduced when admin calls `/api/orders/{id}/confirm/`
- Confirmation validates stock availability before reducing
- Uses database transaction to ensure atomicity

### Order Reference
- Generated on **frontend** using `LEG-{TIMESTAMP}-{RANDOM}` format
- Sent to backend in create request
- Used consistently in WhatsApp messages and admin panel

### Security
- Anyone can create orders (guest checkout)
- Only admins/sellers can view all orders
- Only admins/sellers can update status and confirm orders
- Buyers can only view their own orders (if authenticated)

---

## 13. Next Steps

1. **Create Django app**: `python manage.py startapp orders`
2. **Implement models**: Copy Order and OrderItem models
3. **Create serializers**: Copy serializers code
4. **Implement viewset**: Copy OrderViewSet code
5. **Configure URLs**: Add router and URL patterns
6. **Run migrations**: `python manage.py makemigrations && python manage.py migrate`
7. **Test endpoints**: Use Postman or frontend integration
8. **Add admin interface**: Register models in admin.py
9. **Update OpenAPI schema**: Document new endpoints

---

## 14. Troubleshooting

### Issue: Stock not reducing
**Solution**: Ensure you're calling the `/confirm/` endpoint, not just updating status to "confirmed"

### Issue: Permission denied for buyers
**Solution**: Check OrderPermission class and ensure role field exists on User model

### Issue: Order creation fails
**Solution**: Verify all required fields are present in request and product IDs are valid UUIDs

---

**Created: February 4, 2026**  
**For: LEGO Menswear Next.js + Django Application**
