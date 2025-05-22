import { notFound } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { getTransactionById } from "@/lib/data";
import { TransactionForm } from "../components/transaction-form";

interface TransactionEditPageProps {
  params: {
    id: string;
  };
}

export default async function TransactionEditPage({ params }: TransactionEditPageProps) {
  const transaction = await getTransactionById(params.id);
  
  if (!transaction) {
    notFound();
  }

  return (
    <div>
      <PageHeader
        title="Edit Transaction"
        description="Update the details of this transaction"
      />
      
      <div className="max-w-2xl mx-auto">
        <TransactionForm transaction={transaction} />
      </div>
    </div>
  );
}