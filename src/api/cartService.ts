import { Product } from '@/types/product';

const API_URL = process.env.NEXT_PUBLIC_API_ENDPOINT;

const getAuthHeader = () => {
  let token = '';
  if (typeof window !== 'undefined') {
    token = localStorage.getItem('accessToken') || ''; // Change to accessToken
  }
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
};

interface CartProduct extends Omit<Product, 'id'> {
  _id: string;
}

interface CartItem {
  _id: string;
  productId: CartProduct;
  quantity: number;
  price: number;
}

interface Cart {
  _id: string;
  items: CartItem[];
  totalAmount: number;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}

export const cartService = {  async getMyCart(): Promise<ApiResponse<Cart>> {
    const response = await fetch(`${API_URL}/cart/my-cart`, {
      headers: getAuthHeader(),
      credentials: 'include'
    });
    if (!response.ok) {
      throw new Error('Failed to fetch cart');
    }
    const data: ApiResponse<Cart> = await response.json();
    return data;
  },

  async addToCart(productId: string, quantity: number = 1): Promise<void> {
    const response = await fetch(`${API_URL}/cart/add-item`, {
      method: 'POST',
      headers: getAuthHeader(),
      credentials: 'include',
      body: JSON.stringify({ productId, quantity }),
    });
    
    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('401: Unauthorized');
      }
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to add item to cart');
    }
  },
async removeFromCart(productId: string): Promise<void> {
    const response = await fetch(`${API_URL}/cart/remove-item/${productId}`, {
      method: 'DELETE',
      headers: getAuthHeader(),
      credentials: 'include'
    });
    
    if (!response.ok) {
      throw new Error('Failed to remove item from cart');
    }
  },

  async clearCart(): Promise<void> {
    const response = await fetch(`${API_URL}/cart/clear`, {
      method: 'DELETE',
      headers: getAuthHeader()
    });
    
    if (!response.ok) {
      throw new Error('Failed to clear cart');
    }
  },

  async checkoutSelected(): Promise<void> {
    const response = await fetch(`${API_URL}/cart/checkout-selected`, {
      method: 'POST',
      headers: getAuthHeader()
    });
    
    if (!response.ok) {
      throw new Error('Failed to checkout');
    }
  }
};
