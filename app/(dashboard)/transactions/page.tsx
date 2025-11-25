// app/(dashboard)/transactions/page.tsx
import { PageHeader } from "@/components/layout/page-header";
import { TransactionsTable } from "./components/transactions-table";
import { NewTransactionButton } from "./components/new-transaction-button";
import { getTransactions } from "@/lib/data";
import type { Transaction } from "@/lib/types";

export const dynamic = 'force-dynamic';

export default async function TransactionsPage() {
  let transactions: Transaction[] = [];       //S1
  
  try {
    transactions = await getTransactions();   //S2
  } catch (error) {
    console.error("Failed to fetch transactions:", error);    //S3
  }

  return (       //S4
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