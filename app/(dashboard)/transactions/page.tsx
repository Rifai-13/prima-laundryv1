"use client";

import Link from "next/link";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { getTransactions } from "@/lib/data";
import { Plus } from "lucide-react";
import { TransactionsTable } from "./components/transactions-table";
// Import type dari model atau types file
import type { Transaction } from "@/lib/types";

export const dynamic = 'force-dynamic';

export default async function TransactionsPage() {
  let transactions: Transaction[] = [];
  
  try {
    transactions = await getTransactions();
  } catch (error) {
    console.error("Failed to fetch transactions:", error);
  }

  return (
    <div>
      <PageHeader
        title="Transactions"
        description="Manage your laundry transactions"
      >
        <Button asChild>
          <Link href="/transactions/new">
            <Plus className="h-4 w-4 mr-2" />
            New Transaction
          </Link>
        </Button>
      </PageHeader>
      
      <TransactionsTable transactions={transactions} />
    </div>
  );
}
