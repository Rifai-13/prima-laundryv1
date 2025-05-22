import Link from "next/link";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { getTransactions } from "@/lib/data";
import { Plus } from "lucide-react";
import { TransactionsTable } from "./components/transactions-table";

export default async function TransactionsPage() {
  const transactions = await getTransactions();

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