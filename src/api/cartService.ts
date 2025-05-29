import { Product } from '@/types/product';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface CartItem {
  product: Product;
  quantity: number;
}

interface Cart {
  id: string;
  userId: string;
  items: CartItem[];
  total: number;
  createdAt: string;
  updatedAt: string;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}

export const cartService = {
  // Get current user's cart
  async getMyCart(): Promise<Cart> {
    const response = await fetch(`${API_URL}/cart/my-cart`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    if (!response.ok) {
      throw new Error('Failed to fetch cart');
    }
    const data: ApiResponse<Cart> = await response.json();
    return data.data;
  },

  // Add item to cart
  async addToCart(productId: string, quantity: number): Promise<Cart> {
    const response = await fetch(`${API_URL}/cart/add-item`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({
        productId,
        quantity
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to add item to cart');
    }

    const data: ApiResponse<Cart> = await response.json();
    return data.data;
  },

  // Remove item from cart
  async removeFromCart(productId: string): Promise<Cart> {
    const response = await fetch(`${API_URL}/cart/remove-item/${productId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    if (!response.ok) {
      throw new Error('Failed to remove item from cart');
    }
    const data: ApiResponse<Cart> = await response.json();
    return data.data;
  },

  // Clear cart
  async clearCart(): Promise<void> {
    const response = await fetch(`${API_URL}/cart/clear`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    if (!response.ok) {
      throw new Error('Failed to clear cart');
    }
  },

  // Checkout selected items
  async checkoutSelected(items: { productId: string; quantity: number }[]): Promise<{ orderId: string }> {
    const response = await fetch(`${API_URL}/cart/checkout-selected`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ items })
    });
    if (!response.ok) {
      throw new Error('Checkout failed');
    }
    const data: ApiResponse<{ orderId: string }> = await response.json();
    return data.data;
  },

  // Admin Functions
  async getAllCarts(): Promise<Cart[]> {
    const response = await fetch(`${API_URL}/cart`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    if (!response.ok) {
      throw new Error('Failed to fetch carts');
    }
    const data: ApiResponse<Cart[]> = await response.json();
    return data.data;
  },

  async getCartById(cartId: string): Promise<Cart> {
    const response = await fetch(`${API_URL}/cart/${cartId}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    if (!response.ok) {
      throw new Error('Failed to fetch cart');
    }
    const data: ApiResponse<Cart> = await response.json();
    return data.data;
  },

  async updateCart(cartId: string, updates: Partial<Cart>): Promise<Cart> {
    const response = await fetch(`${API_URL}/cart/${cartId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(updates)
    });
    if (!response.ok) {
      throw new Error('Failed to update cart');
    }
    const data: ApiResponse<Cart> = await response.json();
    return data.data;
  },

  async deleteCart(cartId: string): Promise<void> {
    const response = await fetch(`${API_URL}/cart/${cartId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    if (!response.ok) {
      throw new Error('Failed to delete cart');
    }
  }
};