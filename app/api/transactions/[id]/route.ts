import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import { getTransactionModel } from "@/lib/models/Transaction";
import mongoose from "mongoose";

// Type definition untuk route params
type RouteParams = {
  params: Promise<{ id: string }>;
};

// PUT Handler: Update Transaction
export async function PUT(
  request: Request,
  context: RouteParams
) {
  try {
    // Await params karena sekarang berupa Promise di Next.js 15+
    const { id } = await context.params;

    // Menghubungkan ke database
    await connectDB();

    // Mendapatkan model transaksi
    const Transaction = await getTransactionModel();

    // Validasi ID menggunakan mongoose
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "ID transaksi tidak valid" },
        { status: 400 }
      );
    }

    // Parse body request
    const body = await request.json();

    // Validasi body request
    if (!body.customerName || !body.itemType) {
      return NextResponse.json(
        { error: "Data tidak lengkap" },
        { status: 400 }
      );
    }

    // Melakukan update transaksi
    const updatedTransaction = await Transaction.findByIdAndUpdate(
      id,
      body,
      { new: true, runValidators: true }
    ).lean();

    // Jika transaksi tidak ditemukan
    if (!updatedTransaction) {
      return NextResponse.json(
        { error: "Transaksi tidak ditemukan" },
        { status: 404 }
      );
    }

    // Mengembalikan transaksi yang sudah diperbarui
    return NextResponse.json(updatedTransaction);
  } catch (error) {
    console.error("Error updating transaction:", error);
    
    // Type guard untuk error handling
    const errorMessage = error instanceof Error 
      ? error.message 
      : "Gagal mengupdate transaksi";
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 400 }
    );
  }
}

// DELETE Handler: Delete Transaction
export async function DELETE(
  request: Request,
  context: RouteParams
) {
  try {
    // Await params karena sekarang berupa Promise di Next.js 15+
    const { id } = await context.params;

    // Menghubungkan ke database
    await connectDB();

    // Mendapatkan model transaksi
    const Transaction = await getTransactionModel();

    // Validasi ID menggunakan mongoose
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "ID transaksi tidak valid" },
        { status: 400 }
      );
    }

    // Melakukan penghapusan transaksi berdasarkan ID
    const deletedTransaction = await Transaction.findByIdAndDelete(id);

    // Jika transaksi tidak ditemukan
    if (!deletedTransaction) {
      return NextResponse.json(
        { error: "Transaksi tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: `Transaksi dengan ID ${id} berhasil dihapus`,
      id: id,
    });
  } catch (error) {
    console.error("Error deleting transaction:", error);
    
    // Type guard untuk error handling
    const errorMessage = error instanceof Error 
      ? error.message 
      : "Gagal menghapus transaksi";
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

// Optional: GET Handler untuk mendapatkan single transaction
export async function GET(
  request: Request,
  context: RouteParams
) {
  try {
    const { id } = await context.params;

    await connectDB();
    const Transaction = await getTransactionModel();

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "ID transaksi tidak valid" },
        { status: 400 }
      );
    }

    const transaction = await Transaction.findById(id).lean();

    if (!transaction) {
      return NextResponse.json(
        { error: "Transaksi tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json(transaction);
  } catch (error) {
    console.error("Error fetching transaction:", error);
    
    const errorMessage = error instanceof Error 
      ? error.message 
      : "Gagal mengambil data transaksi";
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}