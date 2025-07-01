import { useState, useEffect } from 'react';
import { shippingLogsService, ShippingLog } from '@/api/shippingLogsService';
import { getUnifiedStatus, hasShippingInfo } from '@/utils/statusUtils';

export interface OrderWithShipping {
  id?: string;
  _id?: string;
  status: string;
  [key: string]: any;
}

export interface UseOrderStatusResult {
  shippingLog: ShippingLog | null;
  unifiedStatus: ReturnType<typeof getUnifiedStatus>;
  isLoading: boolean;
  hasShipping: boolean;
  refetch: () => Promise<void>;
}

/**
 * Hook to manage order status and shipping information
 * Automatically fetches shipping log and provides unified status
 */
export const useOrderStatus = (
  order: OrderWithShipping | null,
  isCustomerView: boolean = false
): UseOrderStatusResult => {
  const [shippingLog, setShippingLog] = useState<ShippingLog | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const orderId = order?.id || order?._id;

  const fetchShippingLog = async () => {
    if (!orderId || !order) return;

    setIsLoading(true);
    try {
      const logs = await shippingLogsService.getByOrderId(orderId);
      if (logs && logs.length > 0) {
        // Use the most recent shipping log
        setShippingLog(logs[logs.length - 1]);
      } else {
        setShippingLog(null);
      }
    } catch (error) {
      console.log(`No shipping log found for order ${orderId}`);
      setShippingLog(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (order) {
      fetchShippingLog();
    }
  }, [orderId]);

  const unifiedStatus = getUnifiedStatus(
    order?.status || '',
    shippingLog,
    isCustomerView
  );

  const hasShipping = hasShippingInfo(shippingLog);

  return {
    shippingLog,
    unifiedStatus,
    isLoading,
    hasShipping,
    refetch: fetchShippingLog
  };
};

/**
 * Hook for managing multiple orders with their shipping status
 */
export const useOrdersWithShipping = (
  orders: OrderWithShipping[],
  isCustomerView: boolean = false
) => {
  const [shippingLogs, setShippingLogs] = useState<Record<string, ShippingLog>>({});
  const [isLoading, setIsLoading] = useState(false);

  const fetchAllShippingLogs = async () => {
    if (!orders.length) return;

    setIsLoading(true);
    try {
      const shippingLogsMap: Record<string, ShippingLog> = {};

      // Fetch shipping logs for each order
      await Promise.allSettled(
        orders.map(async (order) => {
          const orderId = order.id || order._id;
          if (orderId) {
            try {
              const logs = await shippingLogsService.getByOrderId(orderId);
              if (logs && logs.length > 0) {
                shippingLogsMap[orderId] = logs[logs.length - 1];
              }
            } catch (error) {
              console.log(`No shipping log found for order ${orderId}`);
            }
          }
        })
      );

      setShippingLogs(shippingLogsMap);
    } catch (error) {
      console.error('Error fetching shipping logs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAllShippingLogs();
  }, [orders.length]);

  const getOrderStatus = (order: OrderWithShipping) => {
    const orderId = order.id || order._id;
    const shippingLog = orderId ? shippingLogs[orderId] : null;
    
    return {
      shippingLog,
      unifiedStatus: getUnifiedStatus(order.status, shippingLog, isCustomerView),
      hasShipping: hasShippingInfo(shippingLog)
    };
  };

  return {
    shippingLogs,
    isLoading,
    getOrderStatus,
    refetch: fetchAllShippingLogs
  };
};

/**
 * Simple hook to get unified status without fetching
 * Use when you already have the shipping log data
 */
export const useUnifiedStatus = (
  orderStatus: string,
  shippingLog: ShippingLog | null = null,
  isCustomerView: boolean = false
) => {
  return getUnifiedStatus(orderStatus, shippingLog, isCustomerView);
};
