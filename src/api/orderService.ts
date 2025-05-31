export interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  totalAmount: number;
  status: string;
  createdAt: string;
  updatedAt: string;
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

export const orderService = {
  async createOrder(orderData: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>): Promise<Order> {
    const response = await fetch(`${API_URL}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
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
    const response = await fetch(`${API_URL}/orders`);
    if (!response.ok) {
      throw new Error('Failed to fetch orders');
    }
    const data: ApiResponse<Order[]> = await response.json();
    return data.data;
  },

  async getCurrentUserOrders(): Promise<Order[]> {
    const response = await fetch(`${API_URL}/orders/by-user`);
    if (!response.ok) {
      throw new Error('Failed to fetch user orders');
    }
    const data: ApiResponse<Order[]> = await response.json();
    return data.data;
  },

  async getOrderById(id: string): Promise<Order> {
    const response = await fetch(`${API_URL}/orders/${id}`);
    if (!response.ok) {
      throw new Error('Failed to fetch order');
    }
    const data: ApiResponse<Order> = await response.json();
    return data.data;
  },

  async updateOrder(id: string, orderData: Partial<Order>): Promise<Order> {
    const response = await fetch(`${API_URL}/orders/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
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
    const response = await fetch(`${API_URL}/orders/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error('Failed to delete order');
    }
  },

  async updateOrderStatus(id: string, status: string): Promise<Order> {
    const response = await fetch(`${API_URL}/orders/${id}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
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
    const response = await fetch(`${API_URL}/orders/${id}/process`, {
      method: 'PATCH',
    });
    if (!response.ok) {
      throw new Error('Failed to process order');
    }
    const data: ApiResponse<Order> = await response.json();
    return data.data;
  },
};

export default orderService;