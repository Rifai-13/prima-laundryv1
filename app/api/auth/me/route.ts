import { NextResponse } from 'next/server';
import User from '@/lib/models/user.model';
import connectDB from '@/lib/mongodb';
import { getToken } from 'next-auth/jwt';
import { NextRequest } from 'next/server';
import mongoose from 'mongoose';
import { getUserIdFromToken } from '@/lib/auth-utils';


export async function GET(request: NextRequest) {
  try {
    await connectDB();

    // Dapatkan user ID dari token
    const userId = getUserIdFromToken(request);
    
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" }, 
        { status: 401 }
      );
    }

    // Validasi format ObjectId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return NextResponse.json(
        { error: "Invalid user ID format" }, 
        { status: 400 }
      );
    }

    // Cari user dengan ObjectId
    const user = await User.findById(
      new mongoose.Types.ObjectId(userId)
    ).select('-password -__v');

    if (!user) {
      return NextResponse.json(
        { error: "User not found" }, 
        { status: 404 }
      );
    }

    return NextResponse.json({ user });

  } catch (error: any) {
    console.error('Error in GET /api/auth/me:', error);
    return NextResponse.json(
      { error: error.message || "Internal server error" }, 
      { status: 500 }
    );
  }
}