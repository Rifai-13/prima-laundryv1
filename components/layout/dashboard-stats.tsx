// components/layout/dashboard-stats.tsx
"use client";

import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface DashboardData {
  totalTransactions: number;
  totalRevenue: number;
  completedTransactions: number;
  pendingTransactions: number;
  revenueData: { date: string; amount: number }[];
  statusDistribution: { name: string; value: number }[];
}

export default function DashboardStats() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/dashboard-stats');
        const result = await response.json();
        if (!response.ok) throw new Error(result.error);
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (error) return <div className="text-red-500 p-4">Error: {error}</div>;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {/* Stats Cards */}
      <Card>
        <CardHeader>
          <CardTitle>Total Transaksi</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? <Skeleton className="h-8 w-3/4" /> : data?.totalTransactions}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Total Pendapatan</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <Skeleton className="h-8 w-3/4" />
          ) : (
            new Intl.NumberFormat('id-ID', {
              style: 'currency',
              currency: 'IDR'
            }).format(data?.totalRevenue || 0)
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Transaksi Selesai</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? <Skeleton className="h-8 w-3/4" /> : data?.completedTransactions}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Transaksi Pending</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? <Skeleton className="h-8 w-3/4" /> : data?.pendingTransactions}
        </CardContent>
      </Card>

      {/* Charts */}
      <div className="md:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle>Trend Pendapatan</CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            {loading ? (
              <Skeleton className="h-full w-full" />
            ) : (
              <BarChart width={500} height={250} data={data?.revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="amount" fill="#8884d8" />
              </BarChart>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="md:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle>Distribusi Status</CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            {loading ? (
              <Skeleton className="h-full w-full" />
            ) : (
              <PieChart width={500} height={250}>
                <Pie
                  data={data?.statusDistribution}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label
                >
                  {data?.statusDistribution.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={['#0088FE', '#00C49F', '#FFBB28', '#FF8042'][index]}
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}