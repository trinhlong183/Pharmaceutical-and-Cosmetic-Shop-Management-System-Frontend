import { ShippingLog } from "@/api/shippingLogsService";

// Unified status mapping for display
export interface UnifiedStatus {
  displayStatus: string;
  displayText: string;
  color: string;
  bgColor: string;
  icon: string;
  description: string;
  stage: number; // For timeline progression
}

// Status configurations for consistent display
export const StatusConfigurations: Record<string, UnifiedStatus> = {
  // Order-based statuses (when no shipping log exists)
  pending: {
    displayStatus: 'pending',
    displayText: 'Pending',
    color: 'text-yellow-800',
    bgColor: 'bg-yellow-100',
    icon: '⏳',
    description: 'Order is awaiting confirmation',
    stage: 1
  },
  approved: {
    displayStatus: 'approved',
    displayText: 'Approved',
    color: 'text-blue-800',
    bgColor: 'bg-blue-100',
    icon: '✅',
    description: 'Order has been approved and is ready for processing',
    stage: 2
  },
  rejected: {
    displayStatus: 'rejected',
    displayText: 'Rejected',
    color: 'text-red-800',
    bgColor: 'bg-red-100',
    icon: '❌',
    description: 'Order has been rejected',
    stage: 0
  },
  refunded: {
    displayStatus: 'refunded',
    displayText: 'Refunded',
    color: 'text-emerald-800',
    bgColor: 'bg-emerald-100',
    icon: '💰',
    description: 'Order has been refunded',
    stage: 0
  },
  cancelled: {
    displayStatus: 'cancelled',
    displayText: 'Cancelled',
    color: 'text-gray-800',
    bgColor: 'bg-gray-100',
    icon: '🚫',
    description: 'Order has been cancelled',
    stage: 0
  },

  // Shipping-based statuses (when shipping log exists)
  processing: {
    displayStatus: 'shipping',
    displayText: 'In Transit',
    color: 'text-blue-800',
    bgColor: 'bg-blue-100',
    icon: '📦',
    description: 'Order is being prepared for shipping',
    stage: 3
  },
  shipped: {
    displayStatus: 'shipping',
    displayText: 'In Transit',
    color: 'text-indigo-800',
    bgColor: 'bg-indigo-100',
    icon: '🚚',
    description: 'Order is being shipped',
    stage: 4
  },
  in_transit: {
    displayStatus: 'shipping',
    displayText: 'In Transit',
    color: 'text-purple-800',
    bgColor: 'bg-purple-100',
    icon: '🚛',
    description: 'Order is on the way for delivery',
    stage: 5
  },
  delivered: {
    displayStatus: 'delivered',
    displayText: 'Delivered',
    color: 'text-green-800',
    bgColor: 'bg-green-100',
    icon: '✅',
    description: 'Order has been delivered successfully',
    stage: 6
  },
  received: {
    displayStatus: 'delivered',
    displayText: 'Delivered',
    color: 'text-emerald-800',
    bgColor: 'bg-emerald-100',
    icon: '🎉',
    description: 'Customer has confirmed receipt of order',
    stage: 7
  }
};

// Timeline stages for customer view
export const TimelineStages = [
  {
    stage: 1,
    title: 'Order Placed',
    description: 'Order has been created',
    icon: '📝'
  },
  {
    stage: 2,
    title: 'Confirmed',
    description: 'Order has been confirmed',
    icon: '✅'
  },
  {
    stage: 3,
    title: 'Preparing',
    description: 'Preparing goods for shipment',
    icon: '📦'
  },
  {
    stage: 4,
    title: 'Shipping',
    description: 'Goods are being shipped',
    icon: '🚚'
  },
  {
    stage: 5,
    title: 'Out for Delivery',
    description: 'Shipper is delivering the order',
    icon: '🚛'
  },
  {
    stage: 6,
    title: 'Completed',
    description: 'Order delivered successfully',
    icon: '🎉'
  }
];

/**
 * Get unified status for display based on order status and shipping log
 * This is the main function that determines what status to show to users
 */
export const getUnifiedStatus = (
  orderStatus: string,
  shippingLog?: ShippingLog | null,
  isCustomerView: boolean = false
): UnifiedStatus => {
  // Normalize status to lowercase for comparison
  const normalizedOrderStatus = orderStatus?.toLowerCase();
  
  // If no shipping log exists, use order status
  if (!shippingLog) {
    const config = StatusConfigurations[normalizedOrderStatus];
    if (config) {
      return isCustomerView ? getCustomerViewStatus(config) : config;
    }
    
    // Fallback for unknown status
    return {
      displayStatus: normalizedOrderStatus,
      displayText: orderStatus,
      color: 'text-gray-800',
      bgColor: 'bg-gray-100',
      icon: '❓',
      description: 'Trạng thái không xác định',
      stage: 0
    };
  }

  // If shipping log exists, use shipping status (normalize to lowercase)
  const shippingStatus = shippingLog.status?.toLowerCase();
  console.log('Shipping status processing:', {
    originalStatus: shippingLog.status,
    normalizedStatus: shippingStatus,
    availableConfigs: Object.keys(StatusConfigurations)
  });
  
  const config = StatusConfigurations[shippingStatus || 'processing'];
  
  if (config) {
    return isCustomerView ? getCustomerViewStatus(config) : config;
  }

  // Fallback for unknown shipping status
  console.warn(`Unknown shipping status: ${shippingLog.status}, falling back to processing`);
  return StatusConfigurations.processing;
};

/**
 * Convert technical status to customer-friendly status
 */
const getCustomerViewStatus = (config: UnifiedStatus): UnifiedStatus => {
  // For customer view, simplify the status display
  switch (config.displayStatus) {
    case 'pending':
      return {
        ...config,
        displayText: 'Đang xử lý',
        description: 'Đơn hàng của bạn đang được xử lý'
      };
    case 'approved':
      return {
        ...config,
        displayText: 'Đã xác nhận',
        description: 'Đơn hàng đã được xác nhận'
      };
    case 'shipping':
      return {
        ...config,
        displayText: 'Đang vận chuyển',
        description: 'Đơn hàng đang được vận chuyển đến bạn'
      };
    case 'delivered':
      return {
        ...config,
        displayText: 'Đã giao hàng',
        description: 'Đơn hàng đã được giao thành công'
      };
    default:
      return config;
  }
};

/**
 * Get timeline progress for customer view
 */
export const getTimelineProgress = (
  orderStatus: string,
  shippingLog?: ShippingLog | null
): { currentStage: number; progress: number } => {
  const unifiedStatus = getUnifiedStatus(orderStatus, shippingLog, true);
  const currentStage = unifiedStatus.stage;
  const maxStage = Math.max(...TimelineStages.map(stage => stage.stage));
  const progress = (currentStage / maxStage) * 100;
  
  return { currentStage, progress };
};

/**
 * Check if order has shipping information
 */
export const hasShippingInfo = (shippingLog?: ShippingLog | null): boolean => {
  return !!(shippingLog && shippingLog.id);
};

/**
 * Get available status transitions for admin/staff
 */
export const getAvailableStatusTransitions = (
  currentOrderStatus: string,
  shippingLog?: ShippingLog | null
): string[] => {
  const normalizedStatus = currentOrderStatus?.toLowerCase();
  
  // If no shipping log, use order-based transitions
  if (!shippingLog) {
    switch (normalizedStatus) {
      case 'pending':
        return ['pending', 'approved', 'rejected'];
      case 'approved':
        return ['approved', 'processing'];
      case 'rejected':
        return ['rejected', 'refunded'];
      case 'refunded':
      case 'cancelled':
        return [normalizedStatus]; // Final states
      default:
        return ['pending', 'approved', 'rejected'];
    }
  }

  // If shipping log exists, use shipping-based transitions
  const shippingStatus = shippingLog.status?.toLowerCase();
  switch (shippingStatus) {
    case 'processing':
      return ['processing', 'shipped'];
    case 'shipped':
      return ['shipped', 'in_transit'];
    case 'in_transit':
      return ['in_transit', 'delivered'];
    case 'delivered':
      return ['delivered', 'received'];
    case 'received':
      return ['received']; // Final state
    case 'cancelled':
      return ['cancelled']; // Final state
    default:
      return ['processing', 'shipped'];
  }
};

/**
 * Format status for display in different contexts
 */
export const formatStatusForDisplay = (
  orderStatus: string,
  shippingLog?: ShippingLog | null,
  context: 'admin' | 'customer' | 'badge' = 'badge'
) => {
  const unifiedStatus = getUnifiedStatus(orderStatus, shippingLog, context === 'customer');
  
  switch (context) {
    case 'admin':
      return {
        text: `${unifiedStatus.displayText} ${shippingLog ? '(Shipping)' : '(Order)'}`,
        fullStatus: unifiedStatus
      };
    case 'customer':
      return {
        text: unifiedStatus.displayText,
        fullStatus: unifiedStatus
      };
    case 'badge':
    default:
      return {
        text: unifiedStatus.displayText,
        fullStatus: unifiedStatus
      };
  }
};
