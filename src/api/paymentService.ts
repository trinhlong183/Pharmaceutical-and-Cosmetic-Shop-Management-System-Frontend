const API_URL = process.env.NEXT_PUBLIC_API_ENDPOINT;

interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
}

interface BankResponse {
  code: string;
  name: string;
}

interface CheckoutResponse {
  success: boolean;
  message: string;
  data?: {
    paymentUrl: string;
  };
}

interface PaymentVerifyResponse {
  success: boolean;
  message: string;
  data: {
    orderId: string;
    paymentStatus: string;
    amount: number;
  };
}

const getAuthHeader = () => {
  let token = '';
  if (typeof window !== 'undefined') {
    token = localStorage.getItem('accessToken') || '';
  }
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
};

export const paymentService = {
  async getBanks(): Promise<BankResponse[]> {
    const response = await fetch(`${API_URL}/payments/banks`, {
      headers: getAuthHeader(),
      credentials: 'include'
    });

    if (!response.ok) {
      throw new Error('Failed to fetch banks');
    }

    return response.json();
  },

  async createPaymentSelected(paymentData: {
    cartPaymentDto: {
      cart: {
        _id: string;
        userId: string;
        items: Array<{
          productId: string;
          price: number;
          quantity: number;
        }>;
        totalPrice: number;
      };
    };
    selectedProductIds: string[];
  }): Promise<{
    success: boolean;
    message: string;
    paymentUrl?: string;
    orderReference?: string;
    totalAmount?: number;
  }> {
    try {
      const response = await fetch(`${API_URL}/payments/create-payment-selected`, {
        method: 'POST',
        headers: getAuthHeader(),
        credentials: 'include',
        body: JSON.stringify(paymentData)
      });

      const data = await response.json();
      console.log('Raw create-payment-selected API response:', data);

      if (!response.ok) {
        throw new Error(data.message || 'Payment creation failed');
      }

      return {
        success: true,
        message: 'Payment URL created successfully',
        paymentUrl: data.paymentUrl,
        orderReference: data.orderReference,
        totalAmount: data.totalAmount
      };
    } catch (error) {
      console.error('Create payment selected error:', error);
      throw error;
    }
  },

  async cartCheckout(cartData: {
    cart: {
      _id: string;
      items: Array<{
        productId: string;
        price: number;
        quantity: number;
      }>;
      totalPrice: number;
    };
    returnUrl: string;
  }): Promise<CheckoutResponse> {
    try {
      const response = await fetch(`${API_URL}/payments/cart-checkout`, {
        method: 'POST',
        headers: getAuthHeader(),
        credentials: 'include',
        body: JSON.stringify(cartData)
      });

      const data = await response.json();
      console.log('Raw payment API response:', data); // Debug log

      // Check if response is ok first
      if (!response.ok) {
        throw new Error(data.message || 'Payment request failed');
      }

      // Less strict checking of response format
      if (data && typeof data === 'object') {
        // If data has direct paymentUrl property
        if (data.paymentUrl) {
          return {
            success: true,
            message: 'Payment URL generated successfully',
            data: {
              paymentUrl: data.paymentUrl
            }
          };
        }
        
        // If data has nested paymentUrl in data property
        if (data.data?.paymentUrl) {
          return {
            success: true,
            message: 'Payment URL generated successfully',
            data: {
              paymentUrl: data.data.paymentUrl
            }
          };
        }
      }

      throw new Error('Invalid payment response format - No payment URL found');
    } catch (error) {
      console.error('Payment service error:', error);
      throw error;
    }
  },

  async checkoutSelected(productIds: string[]): Promise<ApiResponse<void>> {
    const response = await fetch(`${API_URL}/cart/checkout-selected`, {
      method: 'POST',
      headers: getAuthHeader(),
      credentials: 'include',
      body: JSON.stringify({ productIds })
    });

    if (!response.ok) {
      throw new Error('Checkout selected items failed');
    }

    return response.json();
  },

  async verifySelectedPayment(params: URLSearchParams): Promise<{
    success: boolean;
    message: string;
    data?: {
      isSuccess?: boolean;
      message?: string;
      orderId?: string;
      amount?: number;
      transactionId?: string;
      bankCode?: string;
      paymentTime?: string;
      responseCode?: string;
    };
  }> {
    try {
      const queryString = params.toString();
      const response = await fetch(`${API_URL}/payments/verify-selected?${queryString}`, {
        method: 'GET',
        headers: getAuthHeader(),
        credentials: 'include'
      });

      const data = await response.json();
      console.log('Verify selected payment response:', data);

      if (!response.ok) {
        throw new Error(data.message || 'Payment verification failed');
      }

      return {
        success: true,
        message: 'Payment verification completed',
        data: data
      };
    } catch (error) {
      console.error('Verify selected payment error:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Payment verification failed'
      };
    }
  },

  async verifyVNPayReturn(params: URLSearchParams): Promise<PaymentVerifyResponse> {
    const response = await fetch(`${API_URL}/payments/vnpay-return?${params.toString()}`, {
      headers: getAuthHeader(),
      credentials: 'include'
    });

    if (!response.ok) {
      throw new Error('Payment verification failed');
    }

    return response.json();
  },

  async verifyPayment(params: Record<string, string>): Promise<PaymentVerifyResponse> {
    try {
      console.log("verifyPayment called with params:", params);
      
      // Convert params object to query string
      const queryString = new URLSearchParams();
      Object.keys(params).forEach(key => {
        queryString.append(key, params[key]);
      });
      
      const url = `${API_URL}/payments/verify?${queryString.toString()}`;
      console.log("Sending verification request to:", url);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: getAuthHeader(),
        credentials: 'include'
      });

      const data = await response.json();
      console.log("Verification API response:", data);

      if (!response.ok) {
        console.error("Verification API error:", data);
        throw new Error(data.message || 'Payment verification failed');
      }

      return data;
    } catch (error) {
      console.error("Error in verifyPayment:", error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error occurred',
        data: {
          orderId: '',
          paymentStatus: 'failed',
          amount: 0
        }
      };
    }
  }
};