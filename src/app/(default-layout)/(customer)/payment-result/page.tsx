'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cartService } from '@/api/cartService';
import { paymentService } from '@/api/paymentService';
import { toast } from 'react-hot-toast';

export default function PaymentResult() {
  const [processing, setProcessing] = useState(true);
  const [success, setSuccess] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const processPayment = async () => {
      try {
        const vnp_ResponseCode = searchParams.get("vnp_ResponseCode");
        const vnp_TransactionStatus = searchParams.get("vnp_TransactionStatus");
        
        if (vnp_ResponseCode === "00" && vnp_TransactionStatus === "00") {
          // Payment successful
          const productIds = JSON.parse(localStorage.getItem('selectedCartItems') || '[]')
            .map((item: { productId: string }) => item.productId);
          
          if (productIds.length > 0) {
            // Process the order
            await paymentService.checkoutSelected(productIds);
            await cartService.clearCart();
            
            // Clear localStorage
            localStorage.removeItem('selectedCartItems');
            localStorage.removeItem('cartId');
            
            setSuccess(true);
          }
        } else {
          setSuccess(false);
        }
      } catch (error) {
        console.error('Payment processing error:', error);
        setSuccess(false);
        toast.error('Failed to process payment');
      } finally {
        setProcessing(false);
      }
    };

    processPayment();
  }, [searchParams]);

  const handleContinue = () => {
    if (success) {
      router.push('/myorders'); // Redirect to myorders page if payment successful
    } else {
      router.push('/cartpage'); // Return to cart if payment failed
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-lg">
        {processing ? (
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <h2 className="mt-4 text-xl font-semibold">Processing Payment...</h2>
            <p className="mt-2 text-gray-600">Please wait while we confirm your payment.</p>
          </div>
        ) : success ? (
          <div className="text-center">
            <CheckCircle className="mx-auto h-12 w-12 text-green-500" />
            <h2 className="mt-4 text-xl font-semibold text-green-700">Payment Successful!</h2>
            <p className="mt-2 text-gray-600">Thank you for your purchase.</p>
            <div className="mt-6">
              <Button 
                onClick={handleContinue}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                View My Orders
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center">
            <XCircle className="mx-auto h-12 w-12 text-red-500" />
            <h2 className="mt-4 text-xl font-semibold text-red-700">Payment Failed</h2>
            <p className="mt-2 text-gray-600">Something went wrong with your payment.</p>
            <div className="mt-6">
              <Button 
                onClick={handleContinue}
                className="w-full bg-red-600 hover:bg-red-700"
              >
                Return to Cart
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}