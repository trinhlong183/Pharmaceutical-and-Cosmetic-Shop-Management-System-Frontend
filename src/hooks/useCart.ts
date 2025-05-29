import { useState, useContext } from 'react';
import { toast } from 'react-hot-toast';
import { cartService } from '@/api/cartService';
import { useRouter } from 'next/navigation';
import { UserContext } from '@/contexts/UserContext';

export const useCart = () => {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { user, cart: { updateCartCount } } = useContext(UserContext);
  const addToCart = async (productId: string, quantity: number = 1) => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        toast.error('Please login to add items to cart');
        router.push('/login');
        return;
      }

      setIsLoading(true);
      await cartService.addToCart(productId, quantity);
      await updateCartCount();
      toast.success('Added to cart successfully');
    } catch (error: any) {
      if (error?.response?.status === 401 || error?.message?.includes('401')) {
        toast.error('Session expired. Please login again');
        localStorage.removeItem('accessToken');
        router.push('/login');
      } else {
        toast.error('Failed to add item to cart');
        console.error('Add to cart error:', error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const removeFromCart = async (productId: string) => {
    try {
      if (!user) {
        toast.error('Please login to remove items from cart');
        router.push('/login');
        return;
      }

      setIsLoading(true);
      await cartService.removeFromCart(productId);
      await updateCartCount();
      toast.success('Removed from cart successfully');
    } catch (error) {
      toast.error('Failed to remove item from cart');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    addToCart,
    removeFromCart,
    isLoading,
  };
};
