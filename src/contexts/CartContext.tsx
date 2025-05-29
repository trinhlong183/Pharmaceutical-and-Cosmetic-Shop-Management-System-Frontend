'use client';
import { createContext, useContext, useState, useEffect } from 'react';
import { Product } from '@/types/product';
import { cartService } from '@/api/cartService';
import { toast } from 'react-hot-toast';

// Define types
interface CartItem {
  product: Product;
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, quantity: number) => Promise<void>;
  removeFromCart: (productId: string) => Promise<void>;
  clearCart: () => Promise<void>;
}

// Create context
const CartContext = createContext<CartContextType | undefined>(undefined);

// Create provider component
export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  // Fetch cart on mount
  useEffect(() => {
    const fetchCart = async () => {
      try {
        const cart = await cartService.getMyCart();
        setItems(cart.items);
      } catch (error) {
        console.error('Failed to fetch cart:', error);
      }
    };
    fetchCart();
  }, []);

  const addToCart = async (product: Product, quantity: number) => {
    try {
      const updatedCart = await cartService.addToCart(product.id, quantity);
      setItems(updatedCart.items);
      toast.success('Added to cart successfully!');
    } catch (error) {
      toast.error('Failed to add item to cart');
      throw error;
    }
  };

  const removeFromCart = async (productId: string) => {
    try {
      const updatedCart = await cartService.removeFromCart(productId);
      setItems(updatedCart.items);
      toast.success('Item removed from cart');
    } catch (error) {
      toast.error('Failed to remove item from cart');
      throw error;
    }
  };

  const clearCart = async () => {
    try {
      await cartService.clearCart();
      setItems([]);
      toast.success('Cart cleared');
    } catch (error) {
      toast.error('Failed to clear cart');
      throw error;
    }
  };

  return (
    <CartContext.Provider value={{ items, addToCart, removeFromCart, clearCart }}>
      {children}
    </CartContext.Provider>
  );
}

// Create custom hook for using cart context
export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
