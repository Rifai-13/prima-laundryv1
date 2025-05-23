import { notFound } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { getTransactions } from "@/lib/data"; // Import the available getTransactions function
import { TransactionForm } from "../components/transaction-form";

export default async function TransactionEditPage({
  params,
}: {
  params: { id: string };
}) {
  const transactions = await getTransactions();

  // Konversi ke string jika ID dari database berupa number
  const transaction = transactions.find((t) => t.id.toString() === params.id);

  if (!transaction) notFound();

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
