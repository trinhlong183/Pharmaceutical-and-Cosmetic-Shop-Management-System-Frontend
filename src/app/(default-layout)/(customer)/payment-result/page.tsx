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
        console.log("Processing payment with params:", Object.fromEntries(searchParams.entries()));
        
        // Create a params object from all URL search parameters
        const params: Record<string, string> = {};
        searchParams.forEach((value, key) => {
          params[key] = value;
        });

        // Check if we have the necessary parameters from VNPay
        const vnp_ResponseCode = params.vnp_ResponseCode;
        const vnp_TransactionStatus = params.vnp_TransactionStatus;
        
        console.log("VNPay response code:", vnp_ResponseCode);
        console.log("VNPay transaction status:", vnp_TransactionStatus);
        
        if (!vnp_ResponseCode || !vnp_TransactionStatus) {
          console.error("Missing required VNPay parameters");
          setSuccess(false);
          toast.error('Missing payment information');
          setProcessing(false);
          return;
        }

        // Direct check for successful VNPay response before API call
        if (vnp_ResponseCode === "00" && vnp_TransactionStatus === "00") {
          try {
            // Verify the payment with all URL parameters
            console.log("Calling verifyPayment with params:", params);
            const verificationResult = await paymentService.verifyPayment(params);
            console.log("Verification result:", verificationResult);
            
            // Check specifically if the message contains success indicators
            const messageIsSuccess = verificationResult.message && 
              (verificationResult.message.toLowerCase().includes('success') ||
               verificationResult.message.toLowerCase().includes('successful') ||
               verificationResult.message.toLowerCase().includes('created'));
            
            // Consider it a success if either success flag is true OR message indicates success
            if (verificationResult.success || messageIsSuccess) {
              // Payment verified successfully
              const productIds = JSON.parse(localStorage.getItem('selectedCartItems') || '[]')
                .map((item: { productId: string }) => item.productId);
              
              console.log("Selected product IDs:", productIds);
              
              if (productIds.length > 0) {
                // Process the order
                await paymentService.checkoutSelected(productIds);
                await cartService.clearCart();
                
                // Clear localStorage
                localStorage.removeItem('selectedCartItems');
                localStorage.removeItem('cartId');
                
                setSuccess(true);
                
                if (verificationResult.message) {
                  toast.success(verificationResult.message);
                }
              } else {
                console.error("No products selected for checkout");
                // Still consider payment successful even if products list is empty
                setSuccess(true);
                toast.success('Payment successful!');
              }
            } else {
              console.error("Payment verification failed:", verificationResult.message);
              setSuccess(false);
              toast.error(verificationResult.message || 'Payment verification failed');
            }
          } catch (verifyError) {
            console.error("Error during payment verification:", verifyError);
            setSuccess(false);
            toast.error('Error verifying payment');
          }
        } else {
          console.error("VNPay response indicates failure:", vnp_ResponseCode, vnp_TransactionStatus);
          setSuccess(false);
          toast.error('Payment rejected by payment provider');
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