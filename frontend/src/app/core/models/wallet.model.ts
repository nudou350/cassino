export interface Balance {
  balance: number;
  bonusBalance: number;
  currency: string;
}

export interface Transaction {
  id: string;
  type: 'DEPOSIT' | 'WITHDRAWAL' | 'BET' | 'WIN' | 'BONUS' | 'REFUND';
  amount: number;
  currency: string;
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
  paymentMethod?: string;
  externalTransactionId?: string;
  description?: string;
  createdAt: string;
  completedAt?: string;
}

export interface DepositRequest {
  amount: number;
  paymentMethod: 'CREDIT_CARD' | 'DEBIT_CARD' | 'PAYPAL' | 'STRIPE' | 'CRYPTO';
  currency?: string;
}

export interface WithdrawRequest {
  amount: number;
  paymentMethod: 'BANK_TRANSFER' | 'PAYPAL' | 'CRYPTO';
  currency?: string;
}

export interface TransactionHistory {
  transactions: Transaction[];
  total: number;
  page: number;
  limit: number;
}
