const API_URL = process.env.NEXT_PUBLIC_API_ENDPOINT;

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

interface BankResponse {
  code: string;
  name: string;
}

interface CheckoutResponse {
  paymentUrl: string;
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
    const response = await fetch(`${API_URL}/payments/cart-checkout`, {
      method: 'POST',
      headers: getAuthHeader(),
      credentials: 'include',
      body: JSON.stringify(cartData)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Checkout failed');
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