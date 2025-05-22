import { getDashboardStats, getMonthlyRevenueData, getStatusDistribution } from "@/lib/data";
import { DashboardContent } from "@/components/layout/dashboard-content";

export default async function DashboardStats() {
  const [stats, revenueData, statusData] = await Promise.all([
    getDashboardStats(),
    getMonthlyRevenueData(),
    getStatusDistribution(),
  ]);

  return (
    <DashboardContent 
      stats={stats}
      revenueData={revenueData}
      statusData={statusData}
    />
  );
}