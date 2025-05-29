'use client';

import { useEffect, useState } from 'react';
import { cartService } from '@/api/cartService';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Trash2, MinusCircle, PlusCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import Image from 'next/image';
import { useCart } from '@/hooks/useCart';
import { Product } from '@/types/product';

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

export default function CartPage() {
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const { removeFromCart } = useCart();

  const fetchCart = async () => {
    try {
      const response = await cartService.getMyCart();
      console.log('Cart data:', response);
      if (response.success && response.data) {
        setCart(response.data);
      } else {
        console.error('Invalid cart data structure:', response);
        toast.error('Error loading cart data');
      }
    } catch (error) {
      console.error('Error fetching cart:', error);
      toast.error('Failed to fetch cart');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveItem = async (productId: string) => {
    try {
      await removeFromCart(productId);
      await fetchCart();
      toast.success('Item removed from cart');
    } catch (error) {
      toast.error('Failed to remove item');
    }
  };  const handleUpdateQuantity = async (productId: string, newQuantity: number) => {
    try {
      const existingItem = cart?.items.find(item => item.productId._id === productId);
      if (!existingItem) return;

      const currentQuantity = existingItem.quantity;
      if (newQuantity === currentQuantity) return;

      // Tính toán độ chênh lệch số lượng
      const quantityChange = newQuantity - currentQuantity;
      
      if (newQuantity >= 1 && newQuantity <= (existingItem.productId.stock || 0)) {
        await cartService.addToCart(productId, quantityChange);
        await fetchCart();
      }
    } catch (error) {
      toast.error('Failed to update quantity');
    }
  };

  const handleCheckout = async () => {
    try {
      await cartService.checkoutSelected();
      toast.success('Checkout successful');
      await fetchCart();
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error('Checkout failed');
    }
  };

  const handleClearCart = async () => {
    try {
      await cartService.clearCart();
      toast.success('Cart cleared');
      await fetchCart();
    } catch (error) {
      console.error('Clear cart error:', error);
      toast.error('Failed to clear cart');
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto p-4 text-center">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mx-auto mb-4"></div>
          <div className="h-32 bg-gray-200 rounded mb-4"></div>
        </div>
      </div>
    );
  }

  if (!cart || !cart.items || cart.items.length === 0) {
    return (
      <div className="container mx-auto p-4 text-center">
        <h2 className="text-2xl font-bold mb-4">Your cart is empty</h2>
        <Button variant="outline" onClick={() => window.history.back()}>
          Continue Shopping
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Shopping Cart</h1>
      
      <div className="grid grid-cols-1 gap-4 mb-4">
        {cart.items.map((item) => (
          <Card key={item._id} className="p-4">
            {item && item.productId ? (
              <div className="flex items-center gap-4">
                <div className="relative w-24 h-24">
                  <Image
                    src={Array.isArray(item.productId.productImages) && item.productId.productImages.length > 0 
                      ? item.productId.productImages[0] 
                      : '/placeholder.png'}
                    alt={item.productId.productName || 'Product'}
                    fill
                    className="object-cover rounded"
                  />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">{item.productId.productName}</h3>
                  <p className="text-gray-600">
                    ${item.price.toFixed(2)}
                  </p>
                  {item.productId.salePercentage > 0 && (
                    <p className="text-sm text-red-500">
                      {item.productId.salePercentage}% OFF
                    </p>
                  )}
                  <div className="flex items-center gap-2 mt-2">
                    <Button 
                      variant="outline" 
                      size="icon"
                      onClick={() => handleUpdateQuantity(item.productId._id, item.quantity - 1)}
                      disabled={item.quantity <= 1}
                    >
                      <MinusCircle className="h-4 w-4" />
                    </Button>
                    <span className="min-w-[2rem] text-center">{item.quantity}</span>
                    <Button 
                      variant="outline" 
                      size="icon"
                      onClick={() => handleUpdateQuantity(item.productId._id, item.quantity + 1)}
                      disabled={item.quantity >= (item.productId.stock || 0)}
                    >
                      <PlusCircle className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <p className="font-semibold">
                    Total: ${(item.price * item.quantity).toFixed(2)}
                  </p>
                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={() => handleRemoveItem(item.productId._id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ) : (
              <div className="p-4 text-center text-gray-500">
                Invalid product data
              </div>
            )}
          </Card>
        ))}
      </div>

      <div className="flex flex-col gap-4 md:flex-row md:justify-between items-center">
        <div className="text-xl font-bold">
          Total: ${(cart.totalAmount || 0).toFixed(2)}
        </div>
        <div className="flex gap-2">
          <Button variant="destructive" onClick={handleClearCart}>
            Clear Cart
          </Button>
          <Button onClick={handleCheckout}>
            Checkout
          </Button>
        </div>
      </div>
    </div>
  );
}