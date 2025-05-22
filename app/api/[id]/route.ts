// app/api/transactions/[id]/route.ts
import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import { getTransactionModel } from "@/lib/models/Transaction";

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    const Transaction = await getTransactionModel();
    const body = await req.json();

    const updatedTransaction = await Transaction.findByIdAndUpdate(
      params.id,
      body,
      { new: true, runValidators: true }
    );

    if (!updatedTransaction) {
      return NextResponse.json(
        { error: "Transaksi tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      id: (updatedTransaction as { _id: any; toObject: () => object })._id.toString(),
      ...((updatedTransaction as { toObject: () => object }).toObject()),
    });
  } catch (error: any) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: error.message || "Gagal mengupdate transaksi" },
      { status: 400 }
    );
  }
}