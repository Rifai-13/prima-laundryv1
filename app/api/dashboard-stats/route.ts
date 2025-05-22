// app/api/dashboard-stats/route.ts
import { NextResponse } from 'next/server';
import { getTransactionModel } from '@/lib/models/Transaction';
import connectDB from '@/lib/mongodb';

export async function GET() {
  try {
    await connectDB();
    const Transaction = await getTransactionModel();

    const [totalTransactions, completedTransactions, pendingTransactions] = await Promise.all([
      Transaction.countDocuments(),
      Transaction.countDocuments({ status: 'completed' }),
      Transaction.countDocuments({ status: 'pending' })
    ]);

    const revenueResult = await Transaction.aggregate([
      { $group: { _id: null, total: { $sum: '$price' } } }
    ]);
    const totalRevenue = revenueResult[0]?.total || 0;

    const revenueData = await Transaction.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          total: { $sum: '$price' }
        }
      },
      { $sort: { _id: 1 } },
      { $project: { date: '$_id', amount: '$total', _id: 0 } }
    ]);

    const statusDistribution = await Transaction.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
      { $project: { name: '$_id', value: '$count', _id: 0 } }
    ]);

    return NextResponse.json({
      totalTransactions,
      totalRevenue,
      completedTransactions,
      pendingTransactions,
      revenueData,
      statusDistribution
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
}