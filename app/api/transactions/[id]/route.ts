import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import { getTransactionModel } from "@/lib/models/Transaction";

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    const Transaction = await getTransactionModel();
    
    // Ambil ID dari parameter URL
    const id = params.id;
    
    // Validasi ID
    if (!id || id.length !== 24) {
      return NextResponse.json(
        { error: "ID transaksi tidak valid" },
        { status: 400 }
      );
    }

    const body = await request.json();
    
    // Update transaction
    const updatedTransaction = await Transaction.findByIdAndUpdate(
      id,
      body,
      { new: true, runValidators: true }
    );

    if (!updatedTransaction) {
      return NextResponse.json(
        { error: "Transaksi tidak ditemukan" },
        { status: 404 }
      );
    }

    // Assert the type to inform TypeScript about the structure
    const transactionObj = updatedTransaction as { _id: any; toObject: () => object };

    return NextResponse.json({
      id: transactionObj._id.toString(),
      ...transactionObj.toObject(),
    });

  } catch (error: any) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: error.message || "Gagal mengupdate transaksi" },
      { status: 400 }
    );
  }
}

export async function DELETE(
  request: Request,
  context: { params: { id: string } } // <-- Gunakan `context` sebagai parameter
) {
  try {
    await connectDB();
    const Transaction = await getTransactionModel();
    
    // Ambil ID dari context.params
    const id = context.params.id; // <-- Akses ID melalui context.params

    // Validasi ID
    if (!id || id.length !== 24) {
      return NextResponse.json(
        { error: "ID transaksi tidak valid" },
        { status: 400 }
      );
    }

    const deletedTransaction = await Transaction.findByIdAndDelete(id);

    if (!deletedTransaction) {
      return NextResponse.json(
        { error: "Transaksi tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Transaksi berhasil dihapus",
      id: id // <-- Gunakan variabel id yang sudah diambil
    });

  } catch (error: any) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: error.message || "Gagal menghapus transaksi" },
      { status: 500 }
    );
  }
}