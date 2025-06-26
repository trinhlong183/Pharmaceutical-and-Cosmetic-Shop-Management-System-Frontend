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
        // Create a params object from all URL search parameters
        const params: Record<string, string> = {};
        searchParams.forEach((value, key) => {
          params[key] = value;
        });

        // Check if we have the necessary parameters from VNPay
        const vnp_ResponseCode = params.vnp_ResponseCode;
        const vnp_TransactionStatus = params.vnp_TransactionStatus;
        
        if (!vnp_ResponseCode || !vnp_TransactionStatus) {
          setSuccess(false);
          toast.error('Missing payment information');
          setProcessing(false);
          return;
        }

        // Direct check for successful VNPay response before API call
        if (vnp_ResponseCode === "00" && vnp_TransactionStatus === "00") {
          try {
            // Verify the payment using verify-selected API (matching React Native implementation)
            const verificationResult = await paymentService.verifySelectedPayment(searchParams);
            
            // Check if payment verification was successful
            if (verificationResult.success && verificationResult.data?.isSuccess) {
              // Payment verified successfully, get selected product IDs
              const selectedProductIds = JSON.parse(localStorage.getItem('selectedCartItems') || '[]');
              
              if (selectedProductIds.length > 0) {
                // Remove only selected items from cart using checkout-selected API
                await paymentService.checkoutSelected(selectedProductIds);
                
                // Clear localStorage
                localStorage.removeItem('selectedCartItems');
                localStorage.removeItem('cartId');
                
                setSuccess(true);
                
                // Show success message
                toast.success('Order created successfully!');
              } else {
                setSuccess(true);
                toast.success('Payment successful!');
              }
            } else {
              setSuccess(false);
              toast.error(verificationResult.data?.message || verificationResult.message || 'Payment verification failed');
            }
          } catch (verifyError) {
            setSuccess(false);
            toast.error('Error verifying payment');
          }
        } else {
          setSuccess(false);
          toast.error('Payment rejected by payment provider');
        }
      } catch (error) {
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