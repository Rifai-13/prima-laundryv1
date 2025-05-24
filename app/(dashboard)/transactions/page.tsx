// app/(dashboard)/transactions/page.tsx
import { PageHeader } from "@/components/layout/page-header";
import { TransactionsTable } from "./components/transactions-table";
import { NewTransactionButton } from "./components/new-transaction-button";
import { getTransactions } from "@/lib/data";
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
        <NewTransactionButton />
      </PageHeader>
      
      <TransactionsTable transactions={transactions} />
    </div>
  );
}