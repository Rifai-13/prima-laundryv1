// lib/data.ts
import connectDB from "@/lib/mongodb";
import { getTransactionModel } from "./models/Transaction";
import type {
  Transaction as TransactionType,
  Transaction,
  DashboardStats,
  RevenueData,
} from "./types";

// lib/data.ts
const withDB = async <T>(fn: () => Promise<T>): Promise<T> => {
  try {
    await connectDB();
    return await fn();
  } catch (error) {
    console.error("Database operation failed:", error);
    return [] as T; // Mengembalikan array kosong jika T adalah array
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

// lib/data.ts
export const getTransactions = async (): Promise<TransactionType[]> => {
  return withDB<TransactionType[]>(async () => {
    try {
      const Transaction = await getTransactionModel();
      const transactions = await Transaction.find()
        .sort({ createdAt: -1 })
        .lean();

      return transactions.map((t) => ({
        id: t._id.toString(), // Konversi ObjectId ke string
        customerName: t.customerName,
        itemType: t.itemType,
        phoneNumber: t.phoneNumber,
        weight: t.weight,
        price: t.price,
        status: t.status,
        createdAt: t.createdAt, // Tetap sebagai Date object
        updatedAt: t.updatedAt, // Tetap sebagai Date object
      }));
    } catch (error) {
      console.error("Failed to fetch transactions:", error);
      return [];
    }
  });
};

export async function getTransactionById(id: string) {
  try {
    await connectDB(); // Ensure DB connection
    const Transaction = await getTransactionModel();

    // Fetch transaction by ID
    const transaction = await Transaction.findById(id).lean(); // `.lean()` returns a plain object

    return transaction || null;  // If no transaction found, return null
  } catch (error) {
    console.error("Error fetching transaction:", error);
    return null;
  }
}

// lib/data.ts
export const addTransaction = async (data: Omit<Transaction, "id" | "createdAt" | "updatedAt">): Promise<Transaction> => {
  return withDB<Transaction>(async () => {
    try {
      const Transaction = await getTransactionModel();
      const newTransaction = new Transaction({
        customerName: data.customerName,
        itemType: data.itemType,
        phoneNumber: data.phoneNumber,
        weight: data.weight,
        price: data.price,
        status: data.status
      });
      
      const savedTransaction = await newTransaction.save() as Transaction & { _id: any };
      
      return {
        id: savedTransaction._id.toString(),
        customerName: savedTransaction.customerName,
        itemType: savedTransaction.itemType,
        phoneNumber: savedTransaction.phoneNumber,
        weight: savedTransaction.weight,
        price: savedTransaction.price,
        status: savedTransaction.status,
        createdAt: savedTransaction.createdAt,
        updatedAt: savedTransaction.updatedAt
      };
    } catch (error) {
      console.error("Failed to create transaction:", error);
      throw new Error('Failed to create transaction');
    }
  });
};

export const updateTransaction = async (id: string, data: Partial<Transaction>): Promise<Transaction> => {
  return withDB<Transaction>(async () => {
    try {
      const Transaction = await getTransactionModel();
      const updatedTransaction = await Transaction.findByIdAndUpdate(
        id,
        { $set: data },
        { new: true, runValidators: true }
      ).lean();

      if (!updatedTransaction) {
        throw new Error('Transaction not found');
      }

      return {
        id: updatedTransaction._id.toString(),
        ...updatedTransaction,
        createdAt: updatedTransaction.createdAt,
        updatedAt: updatedTransaction.updatedAt
      };
    } catch (error) {
      console.error("Failed to update transaction:", error);
      throw new Error('Failed to update transaction');
    }
  });
};

export const deleteTransaction = async (id: string): Promise<boolean> => {
  return withDB(async () => {
    try {
      const Transaction = await getTransactionModel();
      const result = await Transaction.findByIdAndDelete(id);
      return !!result;
    } catch (error) {
      console.error("Failed to delete transaction:", error);
      throw new Error('Gagal menghapus transaksi');
    }
  });
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