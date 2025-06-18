import http from "@/lib/http";

// Define Transaction types
export interface PaymentDetails {
  userId: string;
  cartId: string;
  ipAddr: string;
  bankCode?: string;
  cardType?: string;
  transactionNo?: string;
  payDate?: string;
  responseCode?: string;
}

export interface Transaction {
  _id: string;
  orderId: string;
  status: 'success' | 'pending' | 'failed';
  totalAmount: number;
  paymentMethod: string;
  paymentDetails: PaymentDetails;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

// Transaction query params for filtering
export interface TransactionQueryParams {
  page?: number;
  limit?: number;
  status?: string;
  paymentMethod?: string;
  startDate?: string;
  endDate?: string;
}

export const transactionService = {
  getAllTransactions: (params: TransactionQueryParams = {}) => {
    return http
      .get<Transaction[]>("/transactions", {
        params,
      })
      .then((response) => {
        // The API returns an array directly, not wrapped in a data.transactions object
        return {
          transactions: response.payload,
          total: response.payload.length
        };
      });
  },

  getTransactionById: (id: string) => {
    return http
      .get<Transaction>(`/transactions/${id}`)
      .then((response) => response.payload);
  },
  
  // For admin to update transaction status if needed
  updateTransactionStatus: (id: string, status: string) => {
    return http
      .patch<Transaction>(`/transactions/${id}/status`, { status })
      .then((response) => response.payload);
  },
  
  // Create new transaction
  createTransaction: (transactionData: Omit<Transaction, '_id' | 'createdAt' | 'updatedAt' | '__v'>) => {
    return http
      .post<Transaction>("/transactions", transactionData)
      .then((response) => response.payload);
  }
};

export default transactionService;
