// app/api/auth/transactions/route.ts
import  connectDB  from "@/lib/mongodb";
import { getTransactionModel } from "@/lib/models/Transaction";

export async function GET() {
  try {
    // 1. Hubungkan ke database
    await connectDB();

    // 2. Dapatkan model Transaction
    const Transaction = await getTransactionModel();

    // 3. Ambil data transaksi
    const transactions = await Transaction.find({})
      .sort({ createdAt: -1 })
      .lean();

    // 4. Format response
    return new Response(JSON.stringify({ data: transactions }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });

  } catch (error) {
    console.error('Error fetching transactions:', error);
    return new Response(JSON.stringify({ 
      error: "Failed to fetch transactions",
      details: error instanceof Error ? error.message : "Unknown error"
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}