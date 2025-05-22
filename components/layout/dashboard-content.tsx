"use client";

import { formatCurrency } from "@/lib/utils";
import { Banknote, ShoppingBag, Clock } from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { DashboardCard } from "@/components/ui/dashboard-card";

const COLORS = ["#FFBB28", "#0088FE", "#00C49F", "#FF8042"];

interface DashboardContentProps {
  stats: {
    dailyProfit: number;
    monthlyProfit: number;
    totalTransactions: number;
    pendingTransactions: number;
  };
  revenueData: Array<{ date: string; amount: number }>;
  statusData: Array<{ name: string; value: number }>;
}

export function DashboardContent({ stats, revenueData, statusData }: DashboardContentProps) {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <DashboardCard
          title="Daily Revenue"
          value={formatCurrency(stats.dailyProfit)}
          icon={<Banknote className="h-4 w-4" />}
        />
        <DashboardCard
          title="Monthly Revenue"
          value={formatCurrency(stats.monthlyProfit)}
          icon={<Banknote className="h-4 w-4" />}
        />
        <DashboardCard
          title="Total Transactions"
          value={stats.totalTransactions}
          icon={<ShoppingBag className="h-4 w-4" />}
        />
        <DashboardCard
          title="Pending Orders"
          value={stats.pendingTransactions}
          icon={<Clock className="h-4 w-4" />}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="bg-card rounded-lg p-4 shadow">
          <h3 className="text-lg font-medium mb-4">Monthly Revenue</h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={revenueData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip
                  formatter={(value) => formatCurrency(value as number)}
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                  }}
                />
                <Bar dataKey="amount" fill="hsl(var(--chart-1))" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-card rounded-lg p-4 shadow">
          <h3 className="text-lg font-medium mb-4">Transaction Status</h3>
          <div className="h-80 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) =>
                    `${name} (${(percent * 100).toFixed(0)}%)`
                  }
                >
                  {statusData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => [value, "Count"]}
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                  }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}