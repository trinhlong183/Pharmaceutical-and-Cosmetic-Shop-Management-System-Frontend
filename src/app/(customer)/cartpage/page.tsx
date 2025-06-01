'use client';

import { useEffect, useState } from 'react';
import { cartService } from '@/api/cartService';
import { paymentService } from '@/api/paymentService';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Trash2, MinusCircle, PlusCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import Image from 'next/image';
import { useCart } from '@/hooks/useCart';
import { Product } from '@/types/product';
import { useRouter, useSearchParams } from 'next/navigation';
import { userService, User } from '@/api/userService';

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
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const { removeFromCart } = useCart(); // Add this line to properly destructure the hook
  const router = useRouter();
  const searchParams = useSearchParams();

  // Check VNPay return status
  useEffect(() => {
    const vnp_ResponseCode = searchParams.get("vnp_ResponseCode");
    
    if (vnp_ResponseCode) {
      handlePaymentReturn();
    }
  }, [searchParams]);

  const fetchUserInfo = async (userId: string) => {
    try {
      if (!userId) {
        console.error('No userId provided');
        return;
      }
      
      // Call the user service and directly use the response data
      const userData = await userService.getUserById(userId);
      
      // Check if we have the required user data fields
      if (userData && userData._id && userData.fullName) {
        setUser({
          _id: userData._id,
          email: userData.email,
          fullName: userData.fullName,
          phone: userData.phone || '',
          address: userData.address || '',
          dob: userData.dob || '',
          photoUrl: userData.photoUrl,
          isVerified: userData.isVerified,
          isActive: userData.isActive,
          skinAnalysisHistory: userData.skinAnalysisHistory || [],
          purchaseHistory: userData.purchaseHistory || [],
          role: userData.role,
          createdAt: userData.createdAt,
          updatedAt: userData.updatedAt
        });
      } else {
        console.error('Missing required user data fields:', userData);
        setUser(null);
      }
    } catch (error) {
      console.error('Error fetching user info:', error);
      setUser(null);
      // Silent fail - don't show error toast since user info is not critical
    }
  };

  const fetchCart = async () => {
    try {
      const response = await cartService.getMyCart();
      console.log('Cart data:', response);
      if (response.success && response.data) {
        setCart(response.data);
        // Fetch user info after getting cart data
        if (response.data.userId) {
          await fetchUserInfo(response.data.userId);
        }
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
      if (!cart || cart.items.length === 0) {
        toast.error('Cart is empty');
        return;
      }

      setCheckoutLoading(true);
      const loadingToast = toast.loading('Processing checkout...');

      // 1. Prepare selected items in correct format
      const selectedItems = cart.items.map(item => ({
        productId: item.productId._id,
        price: item.price,
        quantity: item.quantity
      }));

      // 2. Save items for verification
      localStorage.setItem('selectedCartItems', JSON.stringify(selectedItems));
      localStorage.setItem('cartId', cart._id);

      // 3. Prepare checkout data
      const checkoutData = {
        cart: {
          _id: cart._id,
          items: selectedItems,
          totalPrice: cart.totalAmount
        },
        returnUrl: `${window.location.origin}/payment-result` // Thay đổi đường dẫn return
      };

      try {
        const response = await paymentService.cartCheckout(checkoutData);
        toast.dismiss(loadingToast);

        // Validate response
        if (!response) {
          throw new Error('No response from payment service');
        }

        console.log('Payment response:', response);

        if (response.success && response.data?.paymentUrl) {
          window.location.href = response.data.paymentUrl;
        } else {
          throw new Error(response.message || 'Payment URL not received');
        }
      } catch (error) {
        console.error('Payment API error:', error);
        throw new Error(error instanceof Error ? error.message : 'Payment creation failed');
      }
    } catch (error) {
      toast.dismiss();
      console.error('Checkout error:', error);
      toast.error(error instanceof Error ? error.message : 'Checkout failed');
    } finally {
      setCheckoutLoading(false);
    }
  };

  const handlePaymentReturn = async () => {
    try {
      const vnp_ResponseCode = searchParams.get("vnp_ResponseCode");
      
      if (vnp_ResponseCode === "00") {
        // Payment successful
        const productIds = JSON.parse(localStorage.getItem('selectedCartItems') || '[]')
          .map((item: { productId: string }) => item.productId);
        
        if (productIds.length > 0) {
          // Show loading state
          toast.loading('Confirming your order...', { id: 'orderConfirmation' });
          
          try {
            // Call checkout-selected API first
            await paymentService.checkoutSelected(productIds);
            
            // Then clear cart
            await cartService.clearCart();
            
            // Clear localStorage
            localStorage.removeItem('selectedCartItems');
            localStorage.removeItem('cartId');
            
            // Clear loading toast and show success message
            toast.dismiss('orderConfirmation');
            toast.success('Order placed successfully!');

            // Clear cart state immediately
            setCart(null);
            
            // Force a page reload after a short delay to ensure cart is refreshed
            setTimeout(() => {
              window.location.reload();
            }, 500);
            
          } catch (error) {
            console.error('Process order error:', error);
            toast.error('Failed to process order');
          }
        }
      } else {
        // Payment failed
        toast.error('Payment failed. Please try again.');
        router.replace('/cartpage');
      }
    } catch (error) {
      console.error('Payment verification error:', error);
      toast.error('Failed to verify payment');
      router.replace('/cartpage');
    }
  };

  const handleClearCart = async () => {
    try {
      await cartService.clearCart();
      await fetchCart();
      toast.success('Cart cleared');
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
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Shopping Cart</h1>
        <p className="text-gray-600 mt-2">{cart.items.length} items in your cart</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Cart Items - Left Side (8 columns) */}
        <div className="lg:col-span-8">
          <div className="bg-white rounded-lg shadow-sm p-6 space-y-6">
            {cart.items.map((item) => (
              <div key={item._id} className="flex flex-col sm:flex-row gap-4 pb-6 border-b last:border-0 last:pb-0">
                {item && item.productId ? (
                  <>
                    <div className="relative w-full sm:w-32 h-32 sm:h-32 flex-shrink-0">
                      <Image
                        src={Array.isArray(item.productId.productImages) && item.productId.productImages.length > 0 
                          ? item.productId.productImages[0] 
                          : '/placeholder.png'}
                        alt={item.productId.productName || 'Product'}
                        fill
                        className="object-cover rounded-lg"
                      />
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="flex justify-between">
                        <h3 className="font-semibold text-lg text-gray-900">{item.productId.productName}</h3>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveItem(item.productId._id)}
                          className="text-gray-500 hover:text-red-500"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <p className="text-lg font-semibold text-gray-900">
                          {item.price}
                        </p>
                        {item.productId.salePercentage > 0 && (
                          <span className="px-2 py-1 text-xs font-semibold text-red-500 bg-red-50 rounded-full">
                            {item.productId.salePercentage}% OFF
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="flex items-center border rounded-lg">
                          <Button 
                            variant="ghost"
                            size="sm"
                            onClick={() => handleUpdateQuantity(item.productId._id, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                            className="text-gray-500 hover:text-gray-700"
                          >
                            <MinusCircle className="h-4 w-4" />
                          </Button>
                          <span className="w-12 text-center font-medium">{item.quantity}</span>
                          <Button 
                            variant="ghost"
                            size="sm"
                            onClick={() => handleUpdateQuantity(item.productId._id, item.quantity + 1)}
                            disabled={item.quantity >= (item.productId.stock || 0)}
                            className="text-gray-500 hover:text-gray-700"
                          >
                            <PlusCircle className="h-4 w-4" />
                          </Button>
                        </div>
                        <p className="font-medium text-gray-900">
                          Tổng: {item.price * item.quantity}
                        </p>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="p-4 text-center text-gray-500">
                    Invalid product data
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Order Summary & User Info - Right Side (4 columns) */}
        <div className="lg:col-span-4 space-y-6">
          {/* User Information */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Delivery Information</h2>
            
            {user ? (
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600">Full Name</p>
                  <p className="font-medium text-gray-900">{user.fullName}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-600">Phone Number</p>
                  <p className="font-medium text-gray-900">{user.phone || 'Not provided'}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="font-medium text-gray-900">{user.email}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-600">Delivery Address</p>
                  <p className="font-medium text-gray-900">{user.address || 'No address provided'}</p>
                </div>

                {!user.address && (
                  <Button variant="outline" className="w-full mt-4" onClick={() => router.push('/profile')}>
                    Add Delivery Address
                  </Button>
                )}
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-gray-500 mb-4">Please sign in to continue checkout</p>
                <Button variant="outline" className="w-full" onClick={() => router.push('/login')}>
                  Sign In
                </Button>
              </div>
            )}
          </div>

          {/* Order Summary */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Order Summary</h2>
            
            <div className="space-y-4">
              <div className="flex justify-between text-gray-600">
                <span>Tạm tính</span>
                <span>{cart.totalAmount}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Phí vận chuyển</span>
                <span>Miễn phí</span>
              </div>
              <div className="border-t pt-4">
                <div className="flex justify-between text-lg font-semibold text-gray-900">
                  <span>Tổng tiền</span>
                  <span>{cart.totalAmount}</span>
                </div>
              </div>

              <div className="space-y-2 pt-4">
                <Button 
                  className="w-full"
                  onClick={handleCheckout}
                  disabled={checkoutLoading || !cart || cart.items.length === 0}
                >
                  {checkoutLoading ? 'Processing...' : 'Proceed to Checkout'}
                </Button>
                <Button 
                  variant="outline"
                  className="w-full text-red-600 hover:bg-red-50"
                  onClick={handleClearCart}
                  disabled={checkoutLoading || !cart || cart.items.length === 0}
                >
                  Clear Cart
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}