"use client";

import { useState } from "react";
import { format } from "date-fns";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { getTransactions } from "@/lib/data";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Transaction } from "@/lib/types";
import { StatusBadge } from "@/components/ui/status-badge";
import { Download, Search } from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";
import { useToast } from "@/hooks/use-toast";
import { toast } from "react-hot-toast";

export default function ReportsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const { toast } = useToast();
  const [reportType, setReportType] = useState<
    "daily" | "monthly" | "yearly" | "custom"
  >("daily");
  const [searchQuery, setSearchQuery] = useState("");

  const handleGenerateReport = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        start: startDate,
        end: endDate,
        q: searchQuery,
      });

      const response = await fetch(`/api/reports?${params}`);
      const data = await response.json();

      if (!response.ok) throw new Error(data.error);

      setTransactions(data);
    } catch (error) {
      console.error("Failed to generate report:", error);
    } finally {
      setLoading(false);
    }
  };

 const handleExportCSV = () => {
  if (transactions.length === 0) {
    toast({
      title: "Error",
      description: "Tidak ada data untuk di-export",
      variant: "destructive",
    });
    return;
  }

  try {
    // Header dengan format kolom Excel
    const headers = [
      // "ID",
      "Nama Pelanggan",
      "Jenis Barang",
      "Nomor Telepon",
      "Berat (kg)",
      "Harga",
      "Status",
      "Tanggal Transaksi"
    ].join(";");

    // Format isi CSV sesuai standar Excel
    const rows = transactions.map(t => {
      const row = [
        // t.id,
        `"${t.customerName.replace(/"/g, '""')}"`, // Handle quotes dalam nama
        t.itemType,
        t.phoneNumber,
        t.weight.toFixed(1).replace(".", ","), // Format decimal untuk Indonesia
        formatCurrency(t.price).replace("Rp", "").trim(), // Hanya angka
        t.status,
        `"${formatDate(t.createdAt)}"` // Format tanggal Indonesia
      ].join(";");
      return row;
    });

    // Gabungkan header dan rows dengan line endings Windows
    const csvContent = [headers, ...rows].join("\r\n");

    // Buat blob dengan charset yang tepat
    const blob = new Blob(["\uFEFF"+csvContent], { 
      type: "text/csv;charset=utf-8;"
    });

    // Download file
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.download = `Laporan_${format(new Date(), "yyyy-MM-dd_HH-mm-ss")}.csv`;
    
    document.body.appendChild(link);
    link.click();
    
    // Cleanup
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast({
      title: "✅ Berhasil",
      description: "File CSV telah diunduh",
    });

  } catch (error) {
    console.error("Export error:", error);
    toast({
      title: "❌ Gagal",
      description: "Terjadi kesalahan saat ekspor data",
      variant: "destructive",
    });
  }
};

  const handleReportTypeChange = (value: string) => {
    const today = new Date();
    let start = new Date();
    let end = new Date();

    switch (value) {
      case "daily":
        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);
        break;
      case "monthly":
        start = new Date(today.getFullYear(), today.getMonth(), 1);
        end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        end.setHours(23, 59, 59, 999);
        break;
      case "yearly":
        start = new Date(today.getFullYear(), 0, 1);
        end = new Date(today.getFullYear(), 11, 31);
        end.setHours(23, 59, 59, 999);
        break;
      case "custom":
        start = new Date();
        end = new Date();
        break;
    }

    setReportType(value as any);
    setStartDate(start.toISOString().split("T")[0]);
    setEndDate(end.toISOString().split("T")[0]);
  };

  const columns: ColumnDef<Transaction>[] = [
    {
      accessorKey: "createdAt",
      header: "Tanggal",
      cell: ({ row }) => formatDate(row.original.createdAt),
    },
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
      cell: ({ row }) => row.original.weight.toFixed(1),
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
  ];

  const totalTransactions = transactions.length;
  const totalRevenue = transactions.reduce((sum, t) => sum + t.price, 0);
  const completedTransactions = transactions.filter(
    (t) => t.status === "completed"
  ).length;

  return (
    <div>
      <PageHeader
        title="Reports"
        description="Generate and view transaction reports"
      />

      <Card className="p-4 mb-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <div>
            <Label htmlFor="reportType">Jenis Laporan</Label>
            <Select value={reportType} onValueChange={handleReportTypeChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select report type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Hari</SelectItem>
                <SelectItem value="monthly">Bulan</SelectItem>
                <SelectItem value="yearly">Tahun</SelectItem>
                <SelectItem value="custom">Custom</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="startDate">Tanggal Mulai</Label>
            <Input
              id="startDate"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              disabled={reportType !== "custom"}
            />
          </div>

          <div>
            <Label htmlFor="endDate">Tanggal Terakhir</Label>
            <Input
              id="endDate"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              disabled={reportType !== "custom"}
            />
          </div>

          <div>
            <Label htmlFor="search">Cari</Label>
            <div className="flex gap-2">
              <Input
                id="search"
                placeholder="Cari..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1"
              />
              <Button onClick={handleGenerateReport} disabled={loading}>
                <Search className="h-4 w-4 mr-2" />
                Cari
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {transactions.length > 0 && (
        <>
          <div className="grid gap-4 md:grid-cols-3 mb-6">
            <Card className="p-4">
              <h3 className="text-sm font-medium text-muted-foreground">
                Total Transactions
              </h3>
              <p className="text-2xl font-bold">{totalTransactions}</p>
            </Card>
            <Card className="p-4">
              <h3 className="text-sm font-medium text-muted-foreground">
                Total Pendapatan
              </h3>
              <p className="text-2xl font-bold">
                {formatCurrency(totalRevenue)}
              </p>
            </Card>
            <Card className="p-4">
              <h3 className="text-sm font-medium text-muted-foreground">
                Completed Transactions
              </h3>
              <p className="text-2xl font-bold">{completedTransactions}</p>
            </Card>
          </div>

          <div className="flex justify-end mb-4">
            <Button
              variant="outline"
              onClick={handleExportCSV}
              disabled={transactions.length === 0}
            >
              <Download className="h-4 w-4 mr-2" />
              Export to CSV
            </Button>
          </div>

          <DataTable
            columns={columns}
            data={transactions}
            searchColumn="customerName"
            searchPlaceholder="Filter by customer name..."
          />
        </>
      )}
    </div>
  );
}
