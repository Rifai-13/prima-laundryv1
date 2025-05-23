
// Transaction status options
export type TransactionStatus = 'pending' | 'processing' | 'completed' | 'cancelled';

// Transaction model
export interface Transaction {
  id: string;
  customerName: string;
  itemType: string;
  phoneNumber: string;
  weight: number;
  price: number;
  status: TransactionStatus;
  createdAt: Date;
  updatedAt: Date;
}

// Dashboard stats
export interface DashboardStats {
  dailyProfit: number;
  monthlyProfit: number;
  yearlyProfit: number;
  totalTransactions: number;
  completedTransactions: number;
  pendingTransactions: number;
}

// Chart data types
export interface ChartDataPoint {
  name: string;
  value: number;
}

export interface RevenueData {
  date: string;
  amount: number;
}
