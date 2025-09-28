
export type TransactionStatus = 'pending' | 'processing' | 'completed';
export type ServiceType = 'reguler' | 'express' | 'super-express';

export interface Transaction {
  id: string;
  customerName: string;
  gender?: "male" | "female";
  serviceType?: ServiceType;
  additionalServices?: string[];
  itemType: string;
  phoneNumber: string;
  weight: number;
  price: number;
  status:  "pending" | "processing" | "completed";
  createdAt: Date;
  updatedAt: Date;
}

export interface DashboardStats {
  dailyProfit: number;
  monthlyProfit: number;
  yearlyProfit: number;
  totalTransactions: number;
  completedTransactions: number;
  pendingTransactions: number;
}

export interface ChartDataPoint {
  name: string;
  value: number;
}

export interface RevenueData {
  date: string;
  amount: number;
}
