import { PageHeader } from "@/components/layout/page-header";
import { TransactionForm } from "../components/transaction-form";

export default function NewTransactionPage() {
  return (
    <div>
      <PageHeader
        title="New Transaction"
        description="Create a new laundry transaction"
      />
      
      <div className="max-w-2xl mx-auto">
        <TransactionForm />
      </div>
    </div>
  );
}