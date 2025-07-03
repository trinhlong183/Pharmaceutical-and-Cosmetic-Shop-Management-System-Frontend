/**
 * Example usage of the unified status system for customer views
 * 
 * This file demonstrates how to implement the unified status display
 * that synchronizes between admin and customer views
 */

import React from 'react';
import { CustomerStatusBadge } from '@/components/order/StatusBadge';
import { OrderTimeline } from '@/components/order/OrderTimeline';
import { useOrderStatus } from '@/hooks/useOrderStatus';

// Example: Customer Order List Component
export const CustomerOrderList = ({ orders }: { orders: any[] }) => {
  return (
    <div className="space-y-4">
      {orders.map((order) => (
        <CustomerOrderCard key={order.id || order._id} order={order} />
      ))}
    </div>
  );
};

// Example: Individual Order Card for Customer
const CustomerOrderCard = ({ order }: { order: any }) => {
  const { shippingLog, unifiedStatus, isLoading } = useOrderStatus(order, true);

  return (
    <div className="border rounded-lg p-4 space-y-3">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-semibold">
            Đơn hàng #{(order.id || order._id)?.slice(0, 8)}
          </h3>
          <p className="text-sm text-gray-600">
            {new Date(order.createdAt).toLocaleDateString('vi-VN')}
          </p>
        </div>
        <CustomerStatusBadge 
          orderStatus={order.status}
          shippingLog={shippingLog}
        />
      </div>
      
      <div className="text-lg font-bold text-green-600">
        {formatPrice(order.totalAmount)}
      </div>
      
      {/* Progress indicator for customer */}
      <div className="bg-gray-100 rounded-full h-2">
        <div 
          className="bg-blue-500 h-2 rounded-full transition-all"
          style={{ 
            width: `${(unifiedStatus.stage / 7) * 100}%` 
          }}
        />
      </div>
      
      <p className="text-sm text-gray-600">{unifiedStatus.description}</p>
    </div>
  );
};

// Example: Customer Order Detail Page
export const CustomerOrderDetail = ({ orderId }: { orderId: string }) => {
  const [order, setOrder] = React.useState<any>(null);
  const { shippingLog, unifiedStatus, isLoading } = useOrderStatus(order, true);

  React.useEffect(() => {
    // Fetch order details
    // setOrder(fetchedOrder);
  }, [orderId]);

  if (!order) return <div>Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold">Chi tiết đơn hàng</h1>
          <p className="text-gray-600">#{orderId.slice(0, 8)}</p>
        </div>
        <CustomerStatusBadge 
          orderStatus={order.status}
          shippingLog={shippingLog}
        />
      </div>

      {/* Timeline component shows the unified status flow */}
      <OrderTimeline
        orderStatus={order.status}
        shippingLog={shippingLog}
        createdAt={order.createdAt}
        isCustomerView={true}
      />

      {/* Order items, payment info, etc. */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* ... other order details */}
      </div>
    </div>
  );
};

// Example: How admin can preview customer view
export const AdminCustomerPreview = ({ order }: { order: any }) => {
  const { shippingLog } = useOrderStatus(order, false); // Admin context
  
  return (
    <div className="border-2 border-dashed border-blue-200 rounded-lg p-4">
      <h4 className="text-sm font-semibold text-blue-800 mb-3">
        👁️ Customer View Preview
      </h4>
      
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-sm">Status Display:</span>
          <CustomerStatusBadge 
            orderStatus={order.status}
            shippingLog={shippingLog}
          />
        </div>
        
        <OrderTimeline
          orderStatus={order.status}
          shippingLog={shippingLog}
          createdAt={order.createdAt}
          isCustomerView={true}
        />
      </div>
    </div>
  );
};

// Utility function (you might already have this)
const formatPrice = (price: number) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(price);
};

/**
 * Key Benefits of this approach:
 * 
 * 1. Unified Status Display:
 *    - Admin sees detailed technical status
 *    - Customer sees simplified, user-friendly status
 *    - Both are synchronized through the same logic
 * 
 * 2. Automatic Status Resolution:
 *    - No shipping log: Shows order status
 *    - Has shipping log: Shows shipping status
 *    - Seamless transition between the two
 * 
 * 3. Timeline Consistency:
 *    - Same timeline component works for both admin and customer
 *    - Progress calculation is consistent
 *    - Status descriptions adapt to context
 * 
 * 4. Easy Integration:
 *    - Drop-in components and hooks
 *    - Minimal code changes required
 *    - Consistent behavior across the app
 * 
 * 5. Maintenance:
 *    - Single source of truth for status logic
 *    - Easy to add new statuses or modify existing ones
 *    - Centralized status configuration
 */
