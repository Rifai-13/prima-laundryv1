import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/lib/models/user.model";

export async function POST(req: Request) {
  try {
    // Koneksi database
    await connectDB();
    
    // Validasi input
    const { name, email, password } = await req.json();
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Nama, email, dan password harus diisi" },
        { status: 400 }
      );
    }

    // Cek email sudah terdaftar (case insensitive)
    const existingUser = await User.findOne({ 
      email: email.toLowerCase() 
    });
    
    if (existingUser) {
      return NextResponse.json(
        { error: "Email sudah terdaftar" },
        { status: 409 }
      );
    }

    // Buat user baru (password akan di-hash oleh model)
    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase(),
      password // <-- Biarkan model yang menghash
    });

    return NextResponse.json({
      success: true,
      message: "Registrasi berhasil",
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    }, { status: 201 });

  } catch (error: any) {
    console.error("🚨 Error registrasi:", error);
    return NextResponse.json(
      { error: error.message || "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}