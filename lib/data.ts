// lib/data.ts
import connectDB from "@/lib/mongodb";
import { getTransactionModel } from "./models/Transaction";
import type {
  Transaction as TransactionType,
  DashboardStats,
  RevenueData,
} from "./types";

const withDB = async <T>(fn: () => Promise<T>): Promise<T> => {
  try {
    await connectDB();
    return await fn();
  } catch (error) {
    console.error("Database operation failed:", error);
    return {} as T;
  }
};

// Default values
const DEFAULT_STATS: DashboardStats = {
  dailyProfit: 0,
  monthlyProfit: 0,
  yearlyProfit: 0,
  totalTransactions: 0,
  completedTransactions: 0,
  pendingTransactions: 0,
};

const DEFAULT_REVENUE_DATA: RevenueData[] = Array.from({ length: 7 }, (_, i) => ({
  date: new Date(Date.now() - (6 - i) * 86400000).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  }),
  amount: 0,
}));

const DEFAULT_STATUS_DATA = [
  { name: "pending", value: 0 },
  { name: "processing", value: 0 },
  { name: "completed", value: 0 },
  { name: "cancelled", value: 0 },
];

// Helper function untuk handle aggregate result
const getAggregateResult = (result: any[], defaultValue: number = 0) => {
  return result[0]?.total ?? defaultValue;
};

export const getDashboardStats = async (): Promise<DashboardStats> => {
  try {
    const Transaction = await getTransactionModel();
    const count = await Transaction.countDocuments();
    
    if (count === 0) return DEFAULT_STATS;

    const now = new Date();
    const today = new Date(now.setHours(0, 0, 0, 0));
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfYear = new Date(now.getFullYear(), 0, 1);

    const [daily, monthly, yearly, statusCounts, total] = await Promise.all([
      Transaction.aggregate([
        { $match: { createdAt: { $gte: today } } },
        { $group: { _id: null, total: { $sum: "$price" } } }
      ]),
      Transaction.aggregate([
        { $match: { createdAt: { $gte: startOfMonth } } },
        { $group: { _id: null, total: { $sum: "$price" } } }
      ]),
      Transaction.aggregate([
        { $match: { createdAt: { $gte: startOfYear } } },
        { $group: { _id: null, total: { $sum: "$price" } } }
      ]),
      Transaction.aggregate([
        { $group: { _id: "$status", count: { $sum: 1 } } }
      ]),
      Transaction.countDocuments(),
    ]);

    const statusMap = new Map(
      statusCounts.map(({ _id, count }) => [_id, count])
    );

    return {
      dailyProfit: getAggregateResult(daily),
      monthlyProfit: getAggregateResult(monthly),
      yearlyProfit: getAggregateResult(yearly),
      totalTransactions: total,
      completedTransactions: statusMap.get("completed") || 0,
      pendingTransactions: statusMap.get("pending") || 0,
    };
  } catch {
    return DEFAULT_STATS;
  }
};

export const getMonthlyRevenueData = async (): Promise<RevenueData[]> => {
  try {
    const Transaction = await getTransactionModel();
    const count = await Transaction.countDocuments();
    
    if (count === 0) return DEFAULT_REVENUE_DATA;

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const result = await Transaction.aggregate([
      {
        $match: { createdAt: { $gte: sevenDaysAgo } },
      },
      {
        $group: {
          _id: { $dateToString: { format: "%b %d", date: "$createdAt" } },
          amount: { $sum: "$price" },
        },
      },
      { $sort: { _id: 1 } },
      {
        $project: {
          _id: 0,
          date: "$_id",
          amount: 1,
        },
      },
    ]);

    return result.length > 0 
      ? result 
      : DEFAULT_REVENUE_DATA;
  } catch {
    return DEFAULT_REVENUE_DATA;
  }
};

export const getStatusDistribution = async () => {
  try {
    const Transaction = await getTransactionModel();
    const count = await Transaction.countDocuments();
    
    if (count === 0) return DEFAULT_STATUS_DATA;

    const result = await Transaction.aggregate([
      { $group: { _id: "$status", value: { $sum: 1 } } },
      { $project: { _id: 0, name: "$_id", value: 1 } },
    ]);

    return result.length > 0
      ? [...DEFAULT_STATUS_DATA.map(d => ({
          ...d,
          value: result.find(r => r.name === d.name)?.value || 0
        }))]
      : DEFAULT_STATUS_DATA;
  } catch {
    return DEFAULT_STATUS_DATA;
  }
};