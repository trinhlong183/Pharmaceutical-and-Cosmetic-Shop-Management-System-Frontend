import http, { HttpError } from "@/lib/http";

// Types for Shipping Logs
export interface OrderDetail {
  id?: string;
  _id?: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
  totalAmount?: number;
  orderNumber?: string;
  orderDate?: string;
  paymentStatus?: string;
  [key: string]: any;
}

export interface CustomerDetail {
  id?: string;
  _id?: string;
  name?: string;
  fullName?: string;
  email?: string;
  phone?: string;
  phoneNumber?: string;
  address?: string;
  shippingAddress?: string;
  [key: string]: any;
}

export interface TransactionDetail {
  id?: string;
  _id?: string;
  amount?: number;
  status?: string;
  method?: string;
  date?: string;
  reference?: string;
  [key: string]: any;
}

export interface OrderItem {
  id?: string;
  _id?: string;
  productId?: string;
  productName?: string;
  quantity?: number;
  price?: number;
  subtotal?: number;
  image?: string;
  [key: string]: any;
}

export interface ShippingLog {
  id?: string;
  _id?: string;
  // orderId can be a string or an object reference
  orderId: string | { 
    id?: string; 
    _id?: string;
    status?: string;
    createdAt?: string;
    updatedAt?: string;
    [key: string]: any;
  };
  trackingNumber?: string;
  carrier?: string;
  status: ShippingStatus;
  currentLocation?: string;
  shippingAddress?: string;
  recipientName?: string;
  recipientPhone?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
  totalAmount?: number;
  
  // Mới bổ sung theo API response
  productSummary?: string | {
    count?: number;
    totalQuantity?: number;
    items?: Array<OrderItem>;
  };
  itemCount?: number;
  totalQuantity?: number;
  
  // Thông tin đơn hàng
  order?: OrderDetail;
  
  // Thông tin khách hàng
  customer?: CustomerDetail;
  customerInfo?: CustomerDetail;
  
  // Thông tin thanh toán
  transaction?: TransactionDetail;
  
  // Danh sách sản phẩm chi tiết
  items?: Array<OrderItem>;
  
  // Thông tin bổ sung
  processedBy?: {
    id?: string;
    _id?: string;
    name?: string;
    email?: string;
  };
  estimatedDelivery?: string;
  actualDelivery?: string;
  weight?: number;
  dimensions?: {
    length?: number;
    width?: number;
    height?: number;
  };
  cost?: number;
  hasSignatureConfirmation?: boolean;
}

// Enum for shipping status
// Using capitalized format as expected by backend API
export enum ShippingStatus {
  PENDING = 'Pending',        // Chờ xử lý
  PROCESSING = 'Processing',  // Đang xử lý
  SHIPPED = 'Shipped',        // Đã gửi hàng
  IN_TRANSIT = 'In Transit',  // Đang vận chuyển
  DELIVERED = 'Delivered',    // Đã giao hàng
  RECEIVED = 'Received',      // Đã nhận hàng
  CANCELLED = 'Cancelled',    // Đã hủy
  RETURNED = 'Returned',      // Đã trả lại
}

// DTO for creating shipping log
export interface CreateShippingLogDto {
  orderId: string;
  status?: ShippingStatus;
  totalAmount?: number;
  trackingNumber?: string;
  carrier?: string;
  shippingAddress?: string;
  recipientName?: string;
  recipientPhone?: string;
  currentLocation?: string;
  notes?: string;
  estimatedDelivery?: string;
}

// DTO for updating shipping status
export interface UpdateShippingStatusDto {
  status: ShippingStatus;
  currentLocation?: string;
  notes?: string;
  actualDelivery?: string;
}

// Response format for order items
export interface OrderItemsResponse {
  items: Array<{
    id: string;
    productId: string;
    productName: string;
    quantity: number;
    price: number;
    subtotal: number;
    productImage?: string;
  }>;
  count: number;
  totalQuantity: number;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

// Shipping Logs service
export const shippingLogsService = {
  // Create a new shipping log
  create: async (data: CreateShippingLogDto): Promise<ShippingLog> => {
    const response = await http.post<ApiResponse<ShippingLog>>("/shipping-logs", data);
    return response.payload.data || response.payload;
  },

  // Get all shipping logs
  getAll: async (params?: any): Promise<ShippingLog[]> => {
    try {
      const response = await http.get<ApiResponse<ShippingLog[]>>("/shipping-logs", { params });
      console.log("Raw shipping logs response:", response);
      
      let shippingLogs: ShippingLog[];
      
      // Xử lý cấu trúc API response mới
      if (response.payload?.data && Array.isArray(response.payload.data)) {
        // API trả về đúng cấu trúc {data: [...]}
        shippingLogs = response.payload.data;
        console.log("API returned correct structure with data array");
      } else if (Array.isArray(response.payload)) {
        // API trả về trực tiếp mảng
        shippingLogs = response.payload;
        console.log("API returned direct array structure");
      } else if (response.payload?.data && !Array.isArray(response.payload.data)) {
        // API trả về một object trong data
        console.log("API returned data object, not array - converting to array");
        shippingLogs = [response.payload.data as unknown as ShippingLog];
      } else {
        console.error("Unexpected response format from shipping logs API:", response);
        return [];
      }
      
      // Xử lý từng shipping log để đảm bảo dữ liệu đầy đủ
      const processedLogs = shippingLogs.map((log) => {
        // Log dữ liệu để debug
        console.log(`Processing shipping log:`, {
          id: log.id || log._id,
          orderId: log.orderId,
          hasOrder: !!log.order,
          hasCustomer: !!log.customer,
          hasItems: !!(log.items && log.items.length),
          productSummary: log.productSummary,
          itemCount: log.itemCount,
          totalQuantity: log.totalQuantity
        });
        
        // Xử lý productSummary nếu là string
        if (typeof log.productSummary === 'string') {
          console.log(`Converting string productSummary to object for shipping ${log.id || log._id}`);
          // Không cần chuyển đổi vì UI có thể hiển thị trực tiếp string
        }
        
        // Đảm bảo orderId được lấy đúng (có thể từ order object)
        if (!log.orderId && log.order) {
          log.orderId = log.order.id || log.order._id || '';
          console.log(`Set orderId from order object: ${log.orderId}`);
        }
        
        // Đảm bảo thông tin người nhận
        if (!log.recipientName && log.customer) {
          log.recipientName = log.customer.name || log.customer.fullName || 'Unknown';
          console.log(`Set recipientName from customer: ${log.recipientName}`);
        }
        
        if (!log.recipientPhone && log.customer) {
          log.recipientPhone = log.customer.phone || log.customer.phoneNumber || 'Unknown';
          console.log(`Set recipientPhone from customer: ${log.recipientPhone}`);
        }
        
        if (!log.shippingAddress && log.customer) {
          log.shippingAddress = log.customer.address || log.customer.shippingAddress || 'Address not provided';
          console.log(`Set shippingAddress from customer: ${log.shippingAddress}`);
        }
        
        return log;
      });
      
      console.log(`Processed ${processedLogs.length} shipping logs`);
      return processedLogs;
    } catch (error) {
      console.error("Error fetching shipping logs:", error);
      return [];
    }
  },

  // Get shipping log by ID
  getById: async (id: string): Promise<ShippingLog> => {
    try {
      console.log(`Fetching shipping log details for ID: ${id}`);
      
      // Validate ID
      if (!id || typeof id !== 'string') {
        console.error('getById called with invalid ID:', id);
        throw new Error('Invalid shipping log ID');
      }
      
      const response = await http.get<ApiResponse<ShippingLog>>(`/shipping-logs/${id}`);
      console.log("Shipping log details response:", response);
      
      let shippingLog: ShippingLog;
      
      // Handle different response formats
      if (response.payload?.data) {
        shippingLog = response.payload.data;
      } else if (typeof response.payload === 'object') {
        shippingLog = response.payload as unknown as ShippingLog;
      } else {
        throw new Error('Invalid response format from shipping logs API');
      }
      
      // Log chi tiết để debug
      console.log(`Shipping log details:`, {
        id: shippingLog.id || shippingLog._id,
        orderId: shippingLog.orderId,
        hasOrder: !!shippingLog.order,
        hasCustomer: !!shippingLog.customer,
        hasItems: !!(shippingLog.items && shippingLog.items.length),
        productSummary: shippingLog.productSummary,
        itemCount: shippingLog.itemCount,
        totalQuantity: shippingLog.totalQuantity
      });
      
      // Xử lý dữ liệu để đảm bảo đủ thông tin cho UI
      
      // Đảm bảo orderId được lấy đúng (có thể từ order object)
      if (!shippingLog.orderId && shippingLog.order) {
        shippingLog.orderId = shippingLog.order.id || shippingLog.order._id || '';
        console.log(`Set orderId from order object: ${shippingLog.orderId}`);
      }
      
      // Nếu không có thông tin order mà có orderId (string), thử lấy chi tiết đơn hàng
      if (!shippingLog.order && shippingLog.orderId && typeof shippingLog.orderId === 'string') {
        try {
          const { orderService } = await import('@/api/orderService');
          const orderDetails = await orderService.getOrderById(shippingLog.orderId) as Record<string, any>;
          console.log(`Found order details for shipping ${id}:`, orderDetails);
          
          // Thêm thông tin đơn hàng
          shippingLog.order = {
            id: orderDetails.id || orderDetails._id,
            status: orderDetails.status,
            createdAt: orderDetails.createdAt,
            updatedAt: orderDetails.updatedAt,
            totalAmount: orderDetails.totalAmount,
            orderNumber: orderDetails.orderNumber,
            orderDate: orderDetails.orderDate,
            paymentStatus: orderDetails.paymentStatus
          };
          
          // Thêm thông tin khách hàng nếu có
          if (orderDetails.customer && !shippingLog.customer) {
            shippingLog.customer = orderDetails.customer;
          } else if (orderDetails.userId && typeof orderDetails.userId === 'object' && !shippingLog.customer) {
            shippingLog.customer = {
              id: orderDetails.userId.id || orderDetails.userId._id,
              name: orderDetails.userId.fullName || orderDetails.userId.name,
              email: orderDetails.userId.email,
              phone: orderDetails.userId.phone || orderDetails.userId.phoneNumber
            };
          }
        } catch (orderError) {
          console.warn(`Could not fetch order details for shipping ${id}:`, orderError);
        }
      }
      
      // Đảm bảo thông tin người nhận
      if (!shippingLog.recipientName && shippingLog.customer) {
        shippingLog.recipientName = shippingLog.customer.name || shippingLog.customer.fullName || 'Unknown';
      }
      
      if (!shippingLog.recipientPhone && shippingLog.customer) {
        shippingLog.recipientPhone = shippingLog.customer.phone || shippingLog.customer.phoneNumber || 'Unknown';
      }
      
      if (!shippingLog.shippingAddress && shippingLog.customer) {
        shippingLog.shippingAddress = shippingLog.customer.address || shippingLog.customer.shippingAddress || 'Address not provided';
      }
      
      // Nếu không có items nhưng có productSummary dạng string, tạo mô tả items
      if (!shippingLog.items && typeof shippingLog.productSummary === 'string') {
        // Không cần chuyển đổi vì UI có thể hiển thị trực tiếp string
        console.log(`Shipping log has string productSummary: ${shippingLog.productSummary}`);
      }
      
      return shippingLog;
    } catch (error) {
      console.error(`Error fetching shipping log with ID ${id}:`, error);
      throw error;
    }
  },

  // Get shipping logs for a specific order
  getByOrderId: async (orderId: string): Promise<ShippingLog[]> => {
    // Validate and clean the orderId
    if (!orderId || typeof orderId !== 'string') {
      console.error('getByOrderId called with invalid orderId:', orderId);
      return [];
    }
    
    const cleanOrderId = orderId.trim();
    if (!cleanOrderId) {
      console.error('getByOrderId called with empty orderId');
      return [];
    }
    
    try {
      // Add custom delay to prevent rapid re-fetching
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Try to use the normal endpoint with error handling
      try {
        const response = await http.get<ApiResponse<ShippingLog[]>>(`/shipping-logs/order/${cleanOrderId}`);
        
        // Properly handle different response formats
        if (response?.payload?.data && Array.isArray(response.payload.data)) {
          return response.payload.data;
        }
        
        if (Array.isArray(response.payload)) {
          return response.payload;
        }
        
        if (response?.payload && !Array.isArray(response.payload)) {
          // If we received a single object but expected an array
          return [response.payload as unknown as ShippingLog];
        }
        
        // Default case if response doesn't match expected formats
        console.warn(`Unexpected response format from shipping logs API for order ${cleanOrderId}`);
        return [];
      } catch (primaryEndpointError) {
        console.warn(`Primary shipping logs endpoint failed for order ${cleanOrderId}:`, primaryEndpointError);
        
        // Try to fetch from the regular orders endpoint as fallback
        try {
          const orderResponse = await http.get<ApiResponse<any>>(`/orders/${cleanOrderId}`);
          const orderData = orderResponse?.payload?.data || orderResponse?.payload;
          
          // Handle different possible response structures
          if (orderData && orderData.shipping) {
            return [orderData.shipping];
          }
          
          if (orderData && orderData.shippingLogs && Array.isArray(orderData.shippingLogs)) {
            return orderData.shippingLogs;
          }
          
          // No shipping info in the order
          console.info(`No shipping information found in order ${cleanOrderId}`);
          return [];
        } catch (fallbackError) {
          console.error(`Both shipping endpoints failed for order ${cleanOrderId}`);
          
          // Check if this is an authentication error
          if (fallbackError instanceof Error && 
              (fallbackError.message.includes('401') || 
               fallbackError.message.includes('auth'))) {
            console.error('Authentication error when fetching shipping data');
          }
          
          return [];
        }
      }
    } catch (error) {
      console.error(`Error fetching shipping logs for order ${cleanOrderId}:`, error);
      // Return empty array instead of throwing to avoid breaking the UI
      return [];
    }
  },

  // Get order items for shipping
  getOrderItems: async (orderId: string): Promise<OrderItemsResponse> => {
    try {
      console.log(`Fetching order items for order ${orderId}`);
      
      // Validate orderId
      if (!orderId || typeof orderId !== 'string') {
        console.error('getOrderItems called with invalid orderId:', orderId);
        throw new Error('Invalid order ID');
      }
      
      const response = await http.get<ApiResponse<OrderItemsResponse>>(`/shipping-logs/order-items/${orderId}`);
      console.log("Order items response:", response);
      
      let orderItems: OrderItemsResponse;
      
      // Xử lý định dạng phản hồi khác nhau
      if (response.payload?.data) {
        orderItems = response.payload.data;
      } else if (response.payload && typeof response.payload === 'object') {
        orderItems = response.payload as unknown as OrderItemsResponse;
      } else {
        console.error("Unexpected response format from order items API:", response);
        throw new Error('Invalid response format from order items API');
      }
      
      // Log chi tiết để debug
      console.log(`Retrieved ${orderItems.items?.length || 0} order items for order ${orderId}`);
      
      return orderItems;
    } catch (error) {
      console.error(`Error fetching order items for order ${orderId}:`, error);
      
      // Trả về cấu trúc mặc định để UI không bị lỗi
      return {
        items: [],
        count: 0,
        totalQuantity: 0
      };
    }
  },

  // Update shipping log
  update: async (id: string, data: Partial<CreateShippingLogDto>): Promise<ShippingLog> => {
    const response = await http.patch<ApiResponse<ShippingLog>>(`/shipping-logs/${id}`, data);
    return response.payload.data || response.payload;
  },

  // Update shipping status
  updateStatus: async (id: string, data: UpdateShippingStatusDto): Promise<ShippingLog> => {
    try {
      if (!id) {
        throw new Error("Invalid shipping log ID");
      }
      
      console.log(`Updating shipping status for ID: ${id}`, data);
      
      const response = await http.patch<ApiResponse<ShippingLog>>(`/shipping-logs/${id}/status`, data);
      
      console.log("Update status response:", response);
      
      // Handle various response formats
      if (response?.payload?.data) {
        return response.payload.data;
      }
      
      if (response?.payload && typeof response.payload === 'object') {
        return response.payload as unknown as ShippingLog;
      }
      
      throw new Error("Invalid response from shipping status update");
    } catch (error) {
      console.error(`Error updating shipping status for ID ${id}:`, error);
      throw error;
    }
  },

  // Delete shipping log (Admin only)
  delete: async (id: string): Promise<boolean> => {
    try {
      // Validate ID
      if (!id || typeof id !== 'string') {
        console.error('Delete shipping log called with invalid ID:', id);
        throw new Error('Invalid shipping log ID');
      }
      
      console.log(`Attempting to delete shipping log with ID: ${id}`);
      
      // Send the delete request
      const response = await http.delete<ApiResponse<any>>(`/shipping-logs/${id}`);
      
      // Check response
      console.log("Delete shipping log response:", response);
      
      // Return true to indicate success
      return true;
    } catch (error) {
      console.error(`Error deleting shipping log with ID ${id}:`, error);
      
      // Handle specific error cases
      if (error instanceof HttpError) {
        if (error.status === 403) {
          throw new Error('You do not have permission to delete shipping logs');
        } else if (error.status === 404) {
          throw new Error('Shipping log not found');
        }
      }
      
      // Re-throw the error for the calling code to handle
      throw error;
    }
  },

  // Create shipping log from approved order
  createFromApprovedOrder: async (orderId: string): Promise<ShippingLog> => {
    try {
      // First, fetch the order details to get required information using orderService
      console.log(`Fetching order details for order ${orderId} to create shipping log`);
      
      // Import necessary services to get order and user details
      const { orderService } = await import('@/api/orderService');
      const { userService } = await import('@/api/userService');
      
      // Get order data - use any type to prevent TypeScript errors with dynamic fields
      const orderData = await orderService.getOrderById(orderId) as Record<string, any>;
      
      if (!orderData) {
        throw new Error("Failed to fetch order information");
      }
      
      console.log("Order data retrieved:", orderData);
      
      // Get user data for shipping information
      let userData: any = null;
      
      // Try multiple ways to get customer information
      try {
        // First check if order has customer details embedded (preferred)
        if (orderData.customer) {
          console.log("Customer data found in order:", orderData.customer);
          userData = orderData.customer;
        } 
        // Otherwise if we have userId reference, look up the user
        else if (typeof orderData.userId === 'string' || 
                (typeof orderData.userId === 'object' && orderData.userId && orderData.userId.id)) {
          const userId = typeof orderData.userId === 'string' ? 
                        orderData.userId : 
                        (orderData.userId.id || orderData.userId._id);
          
          console.log("Looking up user data with ID:", userId);
          userData = await userService.getUserById(userId);
          console.log("User data retrieved:", userData);
        }
      } catch (error) {
        console.warn("Could not fetch user data, continuing with order data only:", error);
      }
      
      // Try multiple sources for shipping information
      let shippingAddress = "Address not provided";
      let recipientName = "Customer";
      let recipientPhone = "Phone not provided";
      
      // Try to get shipping address - check multiple possible locations
      if (orderData.shippingAddress) {
        shippingAddress = orderData.shippingAddress;
      } else if (orderData.deliveryAddress) {
        shippingAddress = orderData.deliveryAddress;
      } else if (userData?.address) {
        shippingAddress = userData.address;
      } else if (userData?.shippingAddress) {
        shippingAddress = userData.shippingAddress;
      }
      
      // Try to get recipient name - check multiple possible locations
      if (orderData.recipientName) {
        recipientName = orderData.recipientName;
      } else if (userData?.fullName) {
        recipientName = userData.fullName;
      } else if (userData?.name) {
        recipientName = userData.name;
      } else if (userData?.firstName && userData?.lastName) {
        recipientName = `${userData.firstName} ${userData.lastName}`;
      }
      
      // Try to get recipient phone - check multiple possible locations
      if (orderData.recipientPhone) {
        recipientPhone = orderData.recipientPhone;
      } else if (orderData.phone) {
        recipientPhone = orderData.phone;
      } else if (userData?.phone) {
        recipientPhone = userData.phone;
      } else if (userData?.phoneNumber) {
        recipientPhone = userData.phoneNumber;
      }
      
      console.log("Extracted shipping info:", {
        shippingAddress,
        recipientName,
        recipientPhone
      });
      
      // Validate that we have minimum required information
      if (!orderId) {
        throw new Error("Order ID is required for creating a shipping log");
      }
      
      if (!orderData.totalAmount) {
        console.warn("Order amount is missing, using 0 as default");
      }
      
      // Create shipping log data with validated information
      // Đảm bảo có ID đơn hàng hợp lệ
      const orderReference = orderData.id || orderData._id || orderId;
      
      // Tạo thông tin productSummary từ sản phẩm trong đơn hàng nếu có
      let productSummaryText = '';
      let itemCount = 0;
      let totalQuantity = 0;
      
      if (orderData.items && Array.isArray(orderData.items) && orderData.items.length > 0) {
        // Tìm thông tin sản phẩm để hiển thị trong productSummary
        productSummaryText = orderData.items.slice(0, 3).map((item: any) => {
          const quantity = item.quantity || 1;
          const name = item.productName || item.name || 'Sản phẩm';
          return `${quantity}x ${name}`;
        }).join(', ');
        
        // Nếu có nhiều hơn 3 sản phẩm, thêm "..."
        if (orderData.items.length > 3) {
          productSummaryText += '...';
        }
        
        // Tính toán số lượng mục và tổng số lượng
        itemCount = orderData.items.length;
        totalQuantity = orderData.items.reduce((sum: number, item: any) => sum + (item.quantity || 1), 0);
      }
      
      // Tạo dữ liệu shipping log với định dạng API mới
      const shippingData: CreateShippingLogDto = {
        orderId: orderReference, // Sử dụng ID đã được trích xuất đúng
        status: ShippingStatus.PROCESSING, 
        totalAmount: orderData.totalAmount || 0,
        shippingAddress,
        recipientName,
        recipientPhone,
        notes: `Automatically created shipping log for approved order ${orderReference}`
      };
      
      // Log debug
      console.log("Order reference being used:", orderReference);
      console.log("Product summary generated:", productSummaryText);
      
      console.log("Creating shipping log with data:", shippingData);
      
      // Create the shipping log using the standard create endpoint
      const response = await http.post<ApiResponse<ShippingLog>>("/shipping-logs", shippingData);
      console.log("Create shipping log response:", response);
      
      let createdShippingLog: ShippingLog;
      
      // Extract shipping log data from response
      if (response?.payload?.data) {
        createdShippingLog = response.payload.data;
      } else if (response?.payload && typeof response.payload === 'object') {
        createdShippingLog = response.payload as unknown as ShippingLog;
      } else {
        console.log("Unexpected API response format:", response);
        throw new Error("Invalid or empty response from the shipping logs service");
      }
      
      console.log("Shipping log created successfully:", createdShippingLog);
      
      // Enhance the shipping log with customer info before returning
      const enhancedShippingLog = {
        ...createdShippingLog,
        // Make sure we have a valid order reference
        orderId: orderReference,
        
        // Thêm thông tin khách hàng một cách rõ ràng
        customer: {
          id: userData?.id || userData?._id,
          name: recipientName,
          phone: recipientPhone,
          address: shippingAddress,
          email: userData?.email
        },
        
        // Thêm thông tin đơn hàng
        order: {
          id: orderReference,
          status: orderData.status,
          createdAt: orderData.createdAt,
          totalAmount: orderData.totalAmount,
          orderNumber: orderData.orderNumber || orderId.substring(0, 8).toUpperCase()
        },
        
        // Thêm thông tin productSummary
        productSummary: productSummaryText || undefined,
        itemCount: itemCount || undefined,
        totalQuantity: totalQuantity || undefined,
        
        // Đảm bảo thông tin người nhận được đặt
        recipientName,
        recipientPhone,
        shippingAddress
      };
      
      console.log("Enhanced shipping log to be returned:", enhancedShippingLog);
      return enhancedShippingLog;
    } catch (error: unknown) {
      console.error("Error in createFromApprovedOrder:", error);
      
      // Specific error handling based on type
      if (error instanceof HttpError) {
        // For HTTP errors, extract more specific information from the response
        console.error(`HTTP Error (${error.status}):`, error.payload);
        
        if (error.status === 404) {
          throw new Error(`API endpoint not found. Please verify shipping logs API is properly configured and available.`);
        } else if (error.status === 401) {
          throw new Error(`Authentication error: You may need to login again.`);
        } else if (error.status === 403) {
          throw new Error(`Permission denied: Your account doesn't have permission to create shipping logs.`);
        } else if (error.status === 400) {
          // Special handling for status validation errors
          const errorMsg = error.payload?.message || "Invalid shipping data";
          if (errorMsg.includes("status must be one of the following values")) {
            throw new Error(`Status format error: Please ensure the shipping status values match backend requirements. ${errorMsg}`);
          } else {
            throw new Error(`Validation error: ${errorMsg}`);
          }
        } else if (error.status === 422) {
          throw new Error(`Validation error: ${error.payload?.message || "Invalid shipping data"}`);
        } else {
          throw new Error(`API Error (${error.status}): ${error.payload?.message || "Unknown error"}`);
        }
      } else if (error instanceof Error) {
        // For standard JS errors
        console.error("Error details:", error);
        throw new Error(`Failed to create shipping log: ${error.message}`);
      }
      
      // For unknown error types
      throw new Error("Unknown error occurred while creating shipping log");
    }
  },
};
