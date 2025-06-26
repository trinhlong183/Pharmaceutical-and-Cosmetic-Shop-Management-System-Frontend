'use client';

import { useEffect, useState } from 'react';
import { cartService } from '@/api/cartService';
import { paymentService } from '@/api/paymentService';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Trash2, 
  MinusCircle, 
  PlusCircle, 
  ShoppingBag, 
  ArrowLeft, 
  ShoppingCart, 
  Truck, 
  CreditCard
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import Image from 'next/image';
import { useCart } from '@/hooks/useCart';
import { Product } from '@/types/product';
import { useRouter, useSearchParams } from 'next/navigation';
import { userService, User } from '@/api/userService';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

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

// Helper function to format price in Vietnamese currency
const formatVND = (price: number): string => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    minimumFractionDigits: 0
  }).format(price);
};

// Helper to convert decimal prices to VND integer (no decimal)
const convertToVNDAmount = (price: number): number => {
  return Math.round(price);
};

export default function CartPage() {
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [updatingItems, setUpdatingItems] = useState<Set<string>>(new Set());
  const [user, setUser] = useState<User | null>(null);
  const { removeFromCart } = useCart();
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
      
      console.log('Attempting to fetch user info for userId:', userId);
      
      try {
        // Call getUserById with the userId from the cart
        const response = await userService.getUserById(userId);
        console.log('User data from API:', response);
        
        // Based on the example API response you provided, the user data is directly in the response
        // No need to look for response.data
        if (response && response._id) {
          // Map the response fields directly to our User object
          setUser({
            _id: response._id,
            email: response.email || '',
            fullName: response.fullName || '',
            phone: response.phone || '',
            address: response.address || '',
            dob: response.dob || '',
            photoUrl: response.photoUrl || '',
            isVerified: response.isVerified || false,
            isActive: response.isActive || false,
            skinAnalysisHistory: response.skinAnalysisHistory || [],
            purchaseHistory: response.purchaseHistory || [],
            role: response.role || 'customer',
            createdAt: response.createdAt || '',
            updatedAt: response.updatedAt || ''
          });
          console.log('User data set successfully');
        } else {
          console.error('Invalid or empty response from getUserById');
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    } catch (error) {
      console.error('Error in fetchUserInfo:', error);
    }
  };

  const fetchCart = async () => {
    try {
      const response = await cartService.getMyCart();
      console.log('Cart data:', response);
      
      if (response.success && response.data) {
        // Validate cart items to ensure no null productId exists
        if (response.data.items && Array.isArray(response.data.items)) {
          // Check for invalid items
          const hasInvalidItems = response.data.items.some(item => !item.productId || !item.productId._id);
          
          if (hasInvalidItems) {
            console.warn('Cart contains invalid items with missing productId', 
              response.data.items.filter(item => !item.productId || !item.productId._id));
            
            // Clean up the cart by filtering out invalid items
            response.data.items = response.data.items.filter(item => item.productId && item.productId._id);
            
            // Notify user if items were removed
            if (response.data.items.length === 0) {
              toast.error('Your cart contains invalid products. Please try adding products again.');
            } else {
              toast('Some invalid items were removed from your cart', {
                icon: '⚠️',
                style: {
                  background: '#FFF3CD',
                  color: '#856404'
                }
              });
            }
          }
        }
        
        setCart(response.data);
        
        // Extract userId directly from the cart data
        // This is the key change - using the correct path to userId in the cart response
        const cartUserId = response.data.userId;
        
        if (cartUserId) {
          console.log('Found userId in cart:', cartUserId);
          await fetchUserInfo(cartUserId);
        } else {
          console.warn('Cart does not contain userId');
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
    } catch (error) {
      toast.error('Failed to remove item');
    }
  };  const handleUpdateQuantity = async (productId: string, newQuantity: number) => {
    try {
      if (!cart || !cart.items) {
        toast.error('Cart data unavailable');
        return;
      }
      
      // Add loading state for this specific item
      setUpdatingItems(prev => new Set(prev).add(productId));
      
      const existingItem = cart.items.find(item => 
        item.productId && item.productId._id === productId
      );
      
      if (!existingItem) {
        console.error('Product not found in cart:', productId);
        toast.error('Product not found in your cart');
        await fetchCart(); // Refresh cart to ensure it's in sync
        return;
      }

      if (!existingItem.productId) {
        console.error('Invalid product data in cart item:', existingItem);
        toast.error('Invalid product data');
        await fetchCart(); // Refresh cart to ensure it's in sync
        return;
      }

      const currentQuantity = existingItem.quantity;
      const maxStock = existingItem.productId.stock || 0;
      
      // Validate new quantity
      if (newQuantity < 1) {
        toast.error('Quantity must be at least 1');
        return;
      }
      
      if (newQuantity > maxStock) {
        toast.error(`Maximum available quantity is ${maxStock}`);
        return;
      }
      
      if (newQuantity === currentQuantity) return;

      // If decreasing quantity, remove item and add back with new quantity
      if (newQuantity < currentQuantity) {
        // Remove the item completely first
        await cartService.removeFromCart(productId);
        // Add back with the new quantity
        if (newQuantity > 0) {
          await cartService.addToCart(productId, newQuantity);
        }
      } else {
        // If increasing quantity, just add the difference
        const quantityToAdd = newQuantity - currentQuantity;
        await cartService.addToCart(productId, quantityToAdd);
      }
      
      await fetchCart();
      
    } catch (error) {
      console.error('Error updating quantity:', error);
      toast.error('Failed to update quantity');
      await fetchCart(); // Refresh cart to ensure it's in sync
    } finally {
      // Remove loading state for this item
      setUpdatingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(productId);
        return newSet;
      });
    }
  };

  const handleCheckout = async () => {
    try {
      if (!cart || cart.items.length === 0) {
        toast.error('Cart is empty');
        return;
      }

      setCheckoutLoading(true);
      const loadingToast = toast.loading('Processing checkout...');      // 1. Prepare selected items in correct format
      const selectedItems = cart.items
        .filter(item => item.productId && item.productId._id) // Filter out items with null productId
        .map(item => ({
          productId: item.productId._id,
          price: item.price,
          quantity: item.quantity
        }));
        
      // Check if we have any valid items after filtering
      if (selectedItems.length === 0) {
        toast.dismiss(loadingToast);
        setCheckoutLoading(false);
        toast.error('Your cart contains invalid products. Please try refreshing or contact support.');
        return;
      }
        // If some items were filtered out but we still have valid ones, inform the user
      if (selectedItems.length < cart.items.length) {
        toast(`${cart.items.length - selectedItems.length} invalid item(s) were removed from checkout`, {
          icon: '⚠️',
          style: {
            background: '#FFF3CD',
            color: '#856404'
          }
        });
      }

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
      }    } catch (error) {
      toast.dismiss();
      console.error('Checkout error:', error);
      
      // Check if error is related to _id property
      if (error instanceof TypeError && error.message.includes("_id")) {
        toast.error('There was a problem with some products in your cart. Please try refreshing the page.');
      } else {
        toast.error(error instanceof Error ? error.message : 'Checkout failed');
      }
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
      <div className="container mx-auto p-6 max-w-7xl">
        <div className="animate-pulse">
          <div className="h-10 bg-gray-200 rounded-lg w-1/3 mb-8"></div>
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left column skeleton */}
            <div className="lg:col-span-8">
              <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
                <div className="h-6 bg-gray-200 rounded-lg w-1/4 mb-6"></div>
                {[1, 2].map(i => (
                  <div key={i} className="flex gap-4 mb-6 last:mb-0 pb-6 last:pb-0 border-b last:border-0">
                    <div className="h-24 w-24 bg-gray-200 rounded-lg"></div>
                    <div className="flex-1 space-y-3">
                      <div className="h-5 bg-gray-200 rounded-lg w-3/4"></div>
                      <div className="h-4 bg-gray-200 rounded-lg w-1/4"></div>
                      <div className="h-8 bg-gray-200 rounded-lg w-1/3"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Right column skeleton */}
            <div className="lg:col-span-4">
              <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
                <div className="h-6 bg-gray-200 rounded-lg w-2/3 mb-4"></div>
                <div className="space-y-3 mb-4">
                  <div className="h-4 bg-gray-200 rounded-lg"></div>
                  <div className="h-4 bg-gray-200 rounded-lg"></div>
                </div>
                <div className="h-10 bg-gray-200 rounded-lg mt-4"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!cart || !cart.items || cart.items.length === 0) {
    return (
      <div className="container mx-auto py-16 px-4">
        <Card className="max-w-md mx-auto shadow-lg border-0">
          <CardContent className="pt-6 pb-8 px-6 flex flex-col items-center text-center">
            <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-6">
              <ShoppingBag className="h-10 w-10 text-gray-400" />
            </div>
            <CardTitle className="text-2xl mb-3">Your cart is empty</CardTitle>
            <p className="text-gray-500 mb-6">
              You haven't added any products to your cart
            </p>
            <Link href="/products" passHref>
              <Button className="w-full">
                <ShoppingCart className="mr-2 h-4 w-4" />
                Continue shopping
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="container mx-auto p-4 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Shopping Cart</h1>
          <div className="flex items-center gap-2 mt-2">
            <Badge variant="secondary">
              {cart.items.length} products
            </Badge>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Cart Items - Left Side */}
          <div className="lg:col-span-8">
            <Card className="border shadow-sm mb-6">
              <CardHeader className="pb-3 border-b">
                <div className="flex justify-between items-center">
                  <CardTitle>Selected Products</CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-600 hover:bg-red-50 hover:text-red-700"
                    onClick={handleClearCart}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Clear Cart
                  </Button>
                </div>
              </CardHeader>
              
              <div className="max-h-[500px] overflow-auto">
                {cart.items.map((item, index) => (
                  <div key={item._id} className="group">
                    {index > 0 && <hr className="my-0" />}
                    <div className="p-4 hover:bg-gray-50">
                      {item && item.productId ? (                          <div className="flex gap-4">
                            <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-lg border border-gray-200 bg-gray-50">
                              <Image
                                src={Array.isArray(item.productId.productImages) && item.productId.productImages.length > 0 
                                  ? item.productId.productImages[0] 
                                  : '/placeholder.png'}
                                alt={item.productId.productName || 'Product'}
                                fill
                                className="object-cover hover:scale-105 transition-transform duration-200"
                                sizes="96px"
                                unoptimized
                              />
                            </div>                            <div className="flex-1 min-w-0">
                              <div className="flex justify-between items-start">
                                <div className="flex-1 min-w-0 pr-4">
                                  <h3 className="font-semibold line-clamp-2 text-base text-gray-900 leading-tight">
                                    {item.productId.productName}
                                  </h3>
                                  <div className="flex items-center mt-2 space-x-2">
                                    <span className="text-sm font-medium text-blue-600">
                                      {formatVND(item.price)}
                                    </span>
                                    <span className="text-xs text-gray-400">per item</span>
                                  </div>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleRemoveItem(item.productId._id)}
                                  className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-red-50 hover:text-red-600"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            
                            <div className="flex items-center justify-between mt-4">
                              <div className="flex items-center bg-gray-50 border border-gray-200 rounded-lg overflow-hidden">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleUpdateQuantity(item.productId._id, item.quantity - 1)}
                                  disabled={item.quantity <= 1 || updatingItems.has(item.productId._id)}
                                  className="h-9 w-9 p-0 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed rounded-none border-0"
                                >
                                  {updatingItems.has(item.productId._id) ? (
                                    <div className="h-3 w-3 border border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                                  ) : (
                                    <MinusCircle className="h-4 w-4 text-gray-600" />
                                  )}
                                </Button>
                                <div className="flex items-center justify-center min-w-[60px] h-9 px-3 bg-white border-x border-gray-200">
                                  <span className="text-sm font-semibold text-gray-900">{item.quantity}</span>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleUpdateQuantity(item.productId._id, item.quantity + 1)}
                                  disabled={item.quantity >= (item.productId.stock || 0) || updatingItems.has(item.productId._id)}
                                  className="h-9 w-9 p-0 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed rounded-none border-0"
                                >
                                  {updatingItems.has(item.productId._id) ? (
                                    <div className="h-3 w-3 border border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                                  ) : (
                                    <PlusCircle className="h-4 w-4 text-gray-600" />
                                  )}
                                </Button>
                              </div>
                              <div className="text-right">
                                <p className="font-semibold text-lg text-gray-900">
                                  {formatVND(item.price * item.quantity)}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                  Stock: {item.productId.stock || 0} items
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center text-muted-foreground p-4">
                          Invalid product
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
            
            {/* Shipping Info Card */}
            <Card className="border shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-start space-x-3">
                  <div className="bg-blue-50 p-2 rounded-full">
                    <Truck className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-medium">Free shipping</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Orders will be delivered within 2-3 business days after successful payment.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Order Summary - Right Side */}
          <div className="lg:col-span-4 space-y-6">
            {/* Order Summary Card */}
            <Card className="border shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="pb-4 space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatVND(cart.totalAmount)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Shipping fee</span>
                  <span className="text-green-600">Free</span>
                </div>
                <hr className="my-2" />
                <div className="flex justify-between pt-2">
                  <span className="font-medium">Total</span>
                  <span className="font-bold text-xl">{formatVND(cart.totalAmount)}</span>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col space-y-3 pt-0">
                <Button 
                  className="w-full"
                  size="lg"
                  onClick={handleCheckout}
                  disabled={checkoutLoading || !user?.address}
                >
                  {checkoutLoading ? (
                    <>
                      <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <CreditCard className="h-4 w-4 mr-2" />
                      {user?.address ? 'Proceed to Payment' : 'Address update required'}
                    </>
                  )}
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => router.push('/products')}
                  className="w-full"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Continue shopping
                </Button>
              </CardFooter>
            </Card>
            
            {/* User Information Card */}
            <Card className="border shadow-sm">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-lg">
                    Delivery Information
                  </CardTitle>
                  {user && (
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => router.push('/profile')}
                    >
                      Edit
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {user ? (
                  <div className="space-y-3 text-sm">
                    <div>
                      <p className="text-muted-foreground">Full Name</p>
                      <p className="font-medium">{user.fullName}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Phone Number</p>
                      <p className="font-medium">{user.phone || 'Not provided'}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Delivery Address</p>
                      <p className="font-medium">{user.address || 'Not provided'}</p>
                      {!user.address && (
                        <Button
                          variant="link"
                          className="p-0 h-auto text-blue-600"
                          onClick={() => router.push('/profile')}
                        >
                          + Add delivery address
                        </Button>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-muted-foreground mb-4">Please log in to continue checkout</p>
                    <Button className="w-full" onClick={() => router.push('/login')}>
                      Login / Register
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}