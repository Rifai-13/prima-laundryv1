"use client";

import { Suspense } from "react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import dynamic from 'next/dynamic';

const DashboardStats = dynamic(
  () => import('@/components/layout/dashboard-stats'),
  { 
    ssr: false,
    loading: () => <div>Loading stats...</div>
  }
);

export default function DashboardPage() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const response = await fetch('/api/transactions');
        const data = await response.json();
        if (data.error) throw new Error(data.error);
        setTransactions(data.data);
      } catch (err) {
        setError('Failed to load transactions');
      } finally {
        setLoading(false);
      }
    };
    fetchTransactions();
  }, []);

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="Overview of your laundry business performance"
      />
      
      <Suspense fallback={<div>Loading stats...</div>}>
        <DashboardStats />
      </Suspense>
    </div>
  );
}