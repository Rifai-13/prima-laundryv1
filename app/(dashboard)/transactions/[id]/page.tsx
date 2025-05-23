import { notFound } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { getTransactions } from "@/lib/data";
import { TransactionForm } from "../components/transaction-form";

// Perbaiki tipe params yang digunakan pada halaman
interface TransactionEditPageProps {
  params: Promise<{ id: string }>;
}

export default async function TransactionEditPage({ params }: TransactionEditPageProps) {
  // Pastikan untuk menunggu Promise untuk mendapatkan nilai params
  const resolvedParams = await params;

  const transactions = await getTransactions();
  const transaction = transactions.find((t) => t.id.toString() === resolvedParams.id);

  if (!transaction) notFound(); // Jika transaksi tidak ditemukan, arahkan ke halaman notFound

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
