"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ColumnDef } from "@tanstack/react-table";
import { Transaction } from "@/lib/types";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { StatusBadge } from "@/components/ui/status-badge";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { deleteTransaction } from "@/lib/data";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Edit, MoreHorizontal, Trash } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface TransactionsTableProps {
  transactions: Transaction[];
}

export function TransactionsTable({ transactions }: TransactionsTableProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [transactionToDelete, setTransactionToDelete] = useState<string | null>(
    null
  );

  const handleDelete = async () => {
  if (!transactionToDelete) return;

  try {
    const response = await fetch(`/api/transactions/${transactionToDelete}`, {
      method: "DELETE",
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || "Gagal menghapus transaksi");
    }

    toast({
      title: "Berhasil!",
      description: "Transaksi berhasil dihapus",
    });

    router.refresh();
  } catch (error: any) {
    toast({
      title: "Error",
      description: error.message,
      variant: "destructive",
    });
  } finally {
    setIsDeleteDialogOpen(false);
    setTransactionToDelete(null);
  }
};

  const columns: ColumnDef<Transaction>[] = [
    // {
    //   accessorKey: "id",
    //   header: "ID",
    //   cell: ({ row }) => <div className="font-medium">{row.original.id}</div>,
    // },
    {
      accessorKey: "customerName",
      header: "Nama Pelanggan",
    },
    {
      accessorKey: "itemType",
      header: "Jenis Barang",
    },
    {
      accessorKey: "weight",
      header: "Berat (kg)",
    },
    {
      accessorKey: "price",
      header: "Harga",
      cell: ({ row }) => formatCurrency(row.original.price),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
    {
      accessorKey: "createdAt",
      header: "Tanggal",
      cell: ({ row }) => formatDate(row.original.createdAt),
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const transaction = row.original;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link
                  href={{
                    pathname: `/transactions/${transaction.id}`,
                    query: {
                      // id: transaction.id,
                      customerName: transaction.customerName,
                      itemType: transaction.itemType,
                      phoneNumber: transaction.phoneNumber,
                      weight: transaction.weight,
                      price: transaction.price,
                      status: transaction.status,
                    },
                  }}
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-red-600"
                onClick={() => {
                  setTransactionToDelete(transaction.id);
                  setIsDeleteDialogOpen(true);
                }}
              >
                <Trash className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  return (
    <>
      <DataTable
        columns={columns}
        data={transactions}
        searchColumn="customerName"
        searchPlaceholder="Search by customer name..."
      />

      <ConfirmDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        title="Delete Transaction"
        description="Are you sure you want to delete this transaction? This action cannot be undone."
        onConfirm={handleDelete}
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
      />
    </>
  );
}
