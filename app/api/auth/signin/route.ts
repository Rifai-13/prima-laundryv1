// app/api/auth/signin/route.ts
import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import User, { IUser } from '@/lib/models/user.model';
import Session from '@/lib/models/session.model';
import { sign } from 'jsonwebtoken';
import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    // Validasi environment variables
    if (!process.env.MONGO_URI || !process.env.JWT_SECRET) {
      throw new Error('Environment variables tidak valid');
    }

    // Koneksi MongoDB
    await mongoose.connect(process.env.MONGO_URI);

    // Ambil dan validasi data request
    const { email, password } = await request.json();
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email dan password harus diisi" },
        { status: 400 }
      );
    }

    // Cari user dengan type casting
    const user = await User.findOne({ email: email.toLowerCase().trim() })
      .select('+password')
      .lean<IUser>(); // <-- Perbaikan type disini

    if (!user) {
      return NextResponse.json(
        { error: "Email atau password salah" },
        { status: 401 }
      );
    }

    // Verifikasi password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return NextResponse.json(
        { error: "Email atau password salah" },
        { status: 401 }
      );
    }

    // Generate JWT token
    const token = sign(
      { userId: user._id.toString() }, // <-- Perbaikan type disini
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    // Simpan session
    await Session.create({
      userId: user._id,
      token,
      expires: new Date(Date.now() + 86400000)
    });

    // Set cookie dengan await
    const cookieStore = await cookies(); // <-- Perbaikan disini
    cookieStore.set(
      'session_token',
      token,
      {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 86400,
        path: '/',
        sameSite: 'lax'
      }
    );

    return NextResponse.json({
      success: true,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email
      }
    });

  } catch (error: any) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  } finally {
    await mongoose.disconnect();
  }
}