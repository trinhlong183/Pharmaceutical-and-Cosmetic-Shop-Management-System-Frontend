export interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  totalAmount: number;
  status: string;
  createdAt: string;
  updatedAt: string;
  rejectionReason?: string;
  refundReason?: string;
  processedBy?: string;
  notes?: string;
}

export interface OrderItem {
  productId: string;
  quantity: number;
  price: number;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_ENDPOINT;

// Helper function to get auth token
const getAuthToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('accessToken');
  }
  return null;
};

export const orderService = {
  async createOrder(orderData: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>): Promise<Order> {
    const token = getAuthToken();
    
    const response = await fetch(`${API_URL}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(orderData),
    });
    if (!response.ok) {
      throw new Error('Failed to create order');
    }
    const data: ApiResponse<Order> = await response.json();
    return data.data;
  },

  async getAllOrders(): Promise<Order[]> {
    const token = getAuthToken();
    
    const response = await fetch(`${API_URL}/orders`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      throw new Error('Failed to fetch orders');
    }
    const data: ApiResponse<Order[]> = await response.json();
    return data.data;
  },

  async getCurrentUserOrders(): Promise<Order[]> {
    const token = getAuthToken();
    
    if (!token) {
      throw new Error('Authentication token is missing');
    }
    
    const response = await fetch(`${API_URL}/orders/by-user`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error:', response.status, errorText);
      throw new Error(`Failed to fetch user orders: ${response.status}`);
    }
    
    const data: ApiResponse<Order[]> = await response.json();
    return data.data;
  },

  async getOrderById(id: string): Promise<Order> {
    const token = getAuthToken();
    
    const response = await fetch(`${API_URL}/orders/${id}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      throw new Error('Failed to fetch order');
    }
    const data: ApiResponse<Order> = await response.json();
    return data.data;
  },

  async updateOrder(id: string, orderData: Partial<Order>): Promise<Order> {
    const token = getAuthToken();
    
    const response = await fetch(`${API_URL}/orders/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(orderData),
    });
    if (!response.ok) {
      throw new Error('Failed to update order');
    }
    const data: ApiResponse<Order> = await response.json();
    return data.data;
  },

  async deleteOrder(id: string): Promise<void> {
    const token = getAuthToken();
    
    const response = await fetch(`${API_URL}/orders/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      throw new Error('Failed to delete order');
    }
  },

  async updateOrderStatus(id: string, status: string): Promise<Order> {
    const token = getAuthToken();
    
    const response = await fetch(`${API_URL}/orders/${id}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ status }),
    });
    if (!response.ok) {
      throw new Error('Failed to update order status');
    }
    const data: ApiResponse<Order> = await response.json();
    return data.data;
  },

  async processOrder(id: string): Promise<Order> {
    const token = getAuthToken();
    
    const response = await fetch(`${API_URL}/orders/${id}/process`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      throw new Error('Failed to process order');
    }
    const data: ApiResponse<Order> = await response.json();
    return data.data;
  },

  async rejectOrder(id: string, data: { rejectionReason: string; note?: string }): Promise<Order> {
    const token = getAuthToken();
    
    const response = await fetch(`${API_URL}/orders/${id}/process`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        status: 'rejected',
        rejectionReason: data.rejectionReason,
        note: data.note,
      }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to reject order');
    }
    
    const responseData: ApiResponse<Order> = await response.json();
    return responseData.data;
  },

  async refundOrder(id: string, data: { refundReason?: string; note?: string }): Promise<Order> {
    const token = getAuthToken();
    
    const response = await fetch(`${API_URL}/orders/${id}/refund`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        refundReason: data.refundReason,
        note: data.note,
      }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to refund order');
    }
    
    const responseData: ApiResponse<Order> = await response.json();
    return responseData.data;
  },
};

export default orderService;