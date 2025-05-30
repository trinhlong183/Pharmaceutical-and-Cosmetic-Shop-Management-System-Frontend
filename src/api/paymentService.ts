const API_URL = process.env.NEXT_PUBLIC_API_ENDPOINT;

interface ApiResponse<T = any> {
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

  async verifyPayment(orderId: string): Promise<PaymentVerifyResponse> {
    const response = await fetch(`${API_URL}/payments/verify?orderId=${orderId}`, {
      headers: getAuthHeader(),
      credentials: 'include'
    });

    if (!response.ok) {
      throw new Error('Payment verification failed');
    }

    return response.json();
  }
};