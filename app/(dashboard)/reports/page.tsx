"use client";

import { useState } from "react";
import { format } from "date-fns";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { getTransactions } from "@/lib/data";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Transaction } from "@/lib/types";
import { StatusBadge } from "@/components/ui/status-badge";
import { Download, Search } from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";

export default function ReportsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reportType, setReportType] = useState<"daily" | "monthly" | "yearly" | "custom">("daily");
  const [searchQuery, setSearchQuery] = useState("");

  const handleGenerateReport = async () => {
    setLoading(true);
    try {
      // In a real app, we would filter by date range on the server
      // For this demo, we'll fetch all and filter on client
      const allTransactions = await getTransactions();
      
      let filtered = [...allTransactions];
      
      // Apply date filter
      if (startDate && endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        end.setHours(23, 59, 59);
        
        filtered = filtered.filter(t => {
          const createdAt = new Date(t.createdAt);
          return createdAt >= start && createdAt <= end;
        });
      }
      
      // Apply search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        filtered = filtered.filter(t => 
          t.customerName.toLowerCase().includes(query) || 
          t.itemType.toLowerCase().includes(query) ||
          t.phoneNumber.includes(query)
        );
      }
      
      setTransactions(filtered);
    } catch (error) {
      console.error("Failed to generate report:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleReportTypeChange = (value: string) => {
    const today = new Date();
    let start = new Date();
    let end = new Date();
    
    switch (value) {
      case "daily":
        // Today
        start = new Date(today.setHours(0, 0, 0, 0));
        end = new Date(today);
        break;
      case "monthly":
        // Current month
        start = new Date(today.getFullYear(), today.getMonth(), 1);
        end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        break;
      case "yearly":
        // Current year
        start = new Date(today.getFullYear(), 0, 1);
        end = new Date(today.getFullYear(), 11, 31);
        break;
      case "custom":
        // Custom range - reset dates
        start = new Date();
        end = new Date();
        break;
    }
    
    setReportType(value as any);
    setStartDate(format(start, "yyyy-MM-dd"));
    setEndDate(format(end, "yyyy-MM-dd"));
  };

  const columns: ColumnDef<Transaction>[] = [
    {
      accessorKey: "id",
      header: "ID",
      cell: ({ row }) => <div className="font-medium">{row.original.id}</div>,
    },
    {
      accessorKey: "customerName",
      header: "Customer",
    },
    {
      accessorKey: "itemType",
      header: "Item Type",
    },
    {
      accessorKey: "phoneNumber",
      header: "Phone Number",
    },
    {
      accessorKey: "weight",
      header: "Weight (kg)",
    },
    {
      accessorKey: "price",
      header: "Price",
      cell: ({ row }) => formatCurrency(row.original.price),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
    {
      accessorKey: "createdAt",
      header: "Date",
      cell: ({ row }) => formatDate(row.original.createdAt),
    },
  ];

  const totalTransactions = transactions.length;
  const totalRevenue = transactions.reduce((sum, t) => sum + t.price, 0);
  const completedTransactions = transactions.filter(t => t.status === 'completed').length;

  return (
    <div>
      <PageHeader
        title="Reports"
        description="Generate and view transaction reports"
      />
      
      <Card className="p-4 mb-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <div>
            <Label htmlFor="reportType">Report Type</Label>
            <Select 
              value={reportType} 
              onValueChange={handleReportTypeChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select report type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="yearly">Yearly</SelectItem>
                <SelectItem value="custom">Custom</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="startDate">Start Date</Label>
            <Input
              id="startDate"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              disabled={reportType !== "custom"}
            />
          </div>
          
          <div>
            <Label htmlFor="endDate">End Date</Label>
            <Input
              id="endDate"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              disabled={reportType !== "custom"}
            />
          </div>
          
          <div>
            <Label htmlFor="search">Search</Label>
            <div className="flex gap-2">
              <Input
                id="search"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1"
              />
              <Button onClick={handleGenerateReport} disabled={loading}>
                <Search className="h-4 w-4 mr-2" />
                Generate
              </Button>
            </div>
          </div>
        </div>
      </Card>
      
      {transactions.length > 0 && (
        <>
          <div className="grid gap-4 md:grid-cols-3 mb-6">
            <Card className="p-4">
              <h3 className="text-sm font-medium text-muted-foreground">Total Transactions</h3>
              <p className="text-2xl font-bold">{totalTransactions}</p>
            </Card>
            <Card className="p-4">
              <h3 className="text-sm font-medium text-muted-foreground">Total Revenue</h3>
              <p className="text-2xl font-bold">{formatCurrency(totalRevenue)}</p>
            </Card>
            <Card className="p-4">
              <h3 className="text-sm font-medium text-muted-foreground">Completed Transactions</h3>
              <p className="text-2xl font-bold">{completedTransactions}</p>
            </Card>
          </div>
          
          <div className="flex justify-end mb-4">
            <Button variant="outline">
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