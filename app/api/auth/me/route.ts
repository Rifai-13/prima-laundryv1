import { NextResponse } from 'next/server';
import User from '@/lib/models/user.model';
import mongoose from 'mongoose';

export async function GET(request: Request) {
  try {
    await mongoose.connect(process.env.MONGODB_URI!);
    
    // Dapatkan user ID dari middleware
    const userId = request.headers.get('x-user-id');
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Dapatkan data user
    const user = await User.findById(userId).select('-password');
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    return NextResponse.json({ user });

  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Server error" },
      { status: 500 }
    );
  }
}