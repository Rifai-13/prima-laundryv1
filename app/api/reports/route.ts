// app/api/reports/route.ts
import { NextResponse } from "next/server";
import { getTransactions } from "@/lib/data";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  try {
    const transactions = await getTransactions();

    // Filter berdasarkan query params
    const filtered = transactions.filter((t) => {
      const start = searchParams.get("start");
      const end = searchParams.get("end");
      const query = searchParams.get("q")?.toLowerCase() || "";

      // Filter tanggal
      if (start && end) {
        const transactionDate = new Date(t.createdAt);
        const startDate = new Date(start);
        const endDate = new Date(end);
        endDate.setHours(23, 59, 59);

        if (transactionDate < startDate || transactionDate > endDate)
          return false;
      }

      // Filter pencarian
      return (
        t.customerName.toLowerCase().includes(query) ||
        t.itemType.toLowerCase().includes(query) ||
        t.phoneNumber.includes(query)
      );
    });

    return NextResponse.json(filtered);
  } catch (error) {
    return NextResponse.json(
      { error: "Gagal memuat laporan" },
      { status: 500 }
    );
  }
}
