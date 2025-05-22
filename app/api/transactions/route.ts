// app/api/auth/transactions/route.ts
import connectDB from "@/lib/mongodb";
import mongoose from "mongoose";
import { getTransactionModel } from "@/lib/models/Transaction";
import { addTransaction, updateTransaction } from "@/lib/data";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await connectDB();
    const Transaction = await getTransactionModel();

    const transactions = await Transaction.find({})
      .sort({ createdAt: -1 })
      .lean()
      .exec();

    // Convert _id to id and Date to string
    const formattedTransactions = transactions.map((transaction) => ({
      id: transaction._id.toString(),
      ...transaction,
      _id: undefined,
      createdAt: transaction.createdAt.toISOString(),
      updatedAt: transaction.updatedAt.toISOString(),
    }));

    return NextResponse.json({ data: formattedTransactions });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch transactions" },
      { status: 500 }
    );
  }
}



export async function POST(req: Request) {
  try {
    await connectDB();
    const Transaction = await getTransactionModel();
    const body = await req.json();

    // Log data yang diterima
    console.log("Data yang diterima di backend:", body);

    // Pastikan itemType tidak kosong atau hanya berisi spasi
    if (!body.itemType || body.itemType.trim().length === 0) {
      return NextResponse.json({ error: "Jenis barang tidak boleh kosong" }, { status: 400 });
    }

    // Validasi manual untuk error yang lebih spesifik
    const errors = [];

    // Validasi nomor telepon
    if (!/^08[1-9][0-9]{7,10}$/.test(body.phoneNumber)) {
      errors.push("Format nomor telepon tidak valid (contoh: 08123456789)");
    }

    // Validasi berat
    if (isNaN(body.weight) || body.weight < 0.1) {
      errors.push("Berat minimal 0.1 kg");
    }

    // Validasi harga
    if (isNaN(body.price) || body.price < 1000) {
      errors.push("Harga minimal Rp 1.000");
    }

    if (errors.length > 0) {
      return NextResponse.json({ error: errors.join(", ") }, { status: 400 });
    }

    const newTransaction = new Transaction(body);
    const savedTransaction = await newTransaction.save();

    // Pastikan _id adalah ObjectId dan kita bisa menggunakan toString()
    const savedTransactionId = (savedTransaction._id as mongoose.Types.ObjectId).toString(); 

    return NextResponse.json({
      id: savedTransactionId,
      ...savedTransaction.toObject(),
    }, { status: 201 });

  } catch (error: any) {
    console.error('Error:', error);
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map((err: any) => err.message);
      return NextResponse.json({ error: errors.join(", ") }, { status: 400 });
    }

    return NextResponse.json(
      { error: error.message || "Gagal membuat transaksi" },
      { status: 400 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    await connectDB();
    const Transaction = await getTransactionModel();
    
    // Ambil ID dari query parameter
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: "ID transaksi tidak valid" }, { status: 400 });
    }

    const body = await req.json();

    // Validasi data
    const updatedTransaction = await Transaction.findByIdAndUpdate(
      id,
      body,
      { new: true, runValidators: true }
    );

    if (!updatedTransaction) {
      return NextResponse.json({ error: "Transaksi tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json({
      id: (updatedTransaction as any)._id.toString(),
      ...updatedTransaction.toObject()
    });

  } catch (error: any) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: error.message || "Gagal memperbarui transaksi" },
      { status: 400 }
    );
  }
}