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
    displayText: 'Chờ xác nhận',
    color: 'text-yellow-800',
    bgColor: 'bg-yellow-100',
    icon: '⏳',
    description: 'Đơn hàng đang chờ được xác nhận',
    stage: 1
  },
  approved: {
    displayStatus: 'approved',
    displayText: 'Đã xác nhận',
    color: 'text-blue-800',
    bgColor: 'bg-blue-100',
    icon: '✅',
    description: 'Đơn hàng đã được xác nhận và chuẩn bị xử lý',
    stage: 2
  },
  rejected: {
    displayStatus: 'rejected',
    displayText: 'Đã từ chối',
    color: 'text-red-800',
    bgColor: 'bg-red-100',
    icon: '❌',
    description: 'Đơn hàng đã bị từ chối',
    stage: 0
  },
  refunded: {
    displayStatus: 'refunded',
    displayText: 'Đã hoàn tiền',
    color: 'text-emerald-800',
    bgColor: 'bg-emerald-100',
    icon: '💰',
    description: 'Đã hoàn tiền cho đơn hàng',
    stage: 0
  },
  cancelled: {
    displayStatus: 'cancelled',
    displayText: 'Đã hủy',
    color: 'text-gray-800',
    bgColor: 'bg-gray-100',
    icon: '🚫',
    description: 'Đơn hàng đã bị hủy',
    stage: 0
  },

  // Shipping-based statuses (when shipping log exists)
  processing: {
    displayStatus: 'shipping',
    displayText: 'Đang vận chuyển',
    color: 'text-blue-800',
    bgColor: 'bg-blue-100',
    icon: '📦',
    description: 'Đơn hàng đang được chuẩn bị vận chuyển',
    stage: 3
  },
  shipped: {
    displayStatus: 'shipping',
    displayText: 'Đang vận chuyển',
    color: 'text-indigo-800',
    bgColor: 'bg-indigo-100',
    icon: '🚚',
    description: 'Đơn hàng đang được vận chuyển',
    stage: 4
  },
  in_transit: {
    displayStatus: 'shipping',
    displayText: 'Đang vận chuyển',
    color: 'text-purple-800',
    bgColor: 'bg-purple-100',
    icon: '🚛',
    description: 'Đơn hàng đang trên đường giao',
    stage: 5
  },
  delivered: {
    displayStatus: 'delivered',
    displayText: 'Đã giao hàng',
    color: 'text-green-800',
    bgColor: 'bg-green-100',
    icon: '✅',
    description: 'Đơn hàng đã được giao thành công',
    stage: 6
  },
  received: {
    displayStatus: 'delivered',
    displayText: 'Đã giao hàng',
    color: 'text-emerald-800',
    bgColor: 'bg-emerald-100',
    icon: '🎉',
    description: 'Khách hàng đã xác nhận nhận hàng',
    stage: 7
  }
};

// Timeline stages for customer view
export const TimelineStages = [
  {
    stage: 1,
    title: 'Đặt hàng',
    description: 'Đơn hàng đã được tạo',
    icon: '📝'
  },
  {
    stage: 2,
    title: 'Xác nhận',
    description: 'Đơn hàng đã được xác nhận',
    icon: '✅'
  },
  {
    stage: 3,
    title: 'Chuẩn bị',
    description: 'Đang chuẩn bị hàng hóa',
    icon: '📦'
  },
  {
    stage: 4,
    title: 'Vận chuyển',
    description: 'Hàng đang được vận chuyển',
    icon: '🚚'
  },
  {
    stage: 5,
    title: 'Đang giao',
    description: 'Shipper đang giao hàng',
    icon: '🚛'
  },
  {
    stage: 6,
    title: 'Hoàn thành',
    description: 'Đã giao hàng thành công',
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

  // If shipping log exists, use shipping status
  const shippingStatus = shippingLog.status?.toLowerCase();
  const config = StatusConfigurations[shippingStatus || 'processing'];
  
  if (config) {
    return isCustomerView ? getCustomerViewStatus(config) : config;
  }

  // Fallback for unknown shipping status
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
