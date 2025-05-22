import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Session from '@/lib/models/session.model';
import { cookies } from 'next/headers';

export async function POST() {
  try {
    await connectDB();

    // Dapatkan token dari cookies
    const cookieStore = await cookies();
    const token = cookieStore.get('session_token')?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, error: "No active session" },
        { status: 401 }
      );
    }

    // Hapus session dari database
    await Session.deleteOne({ token });

    // Hapus cookie di response
    const response = NextResponse.json(
      { success: true, message: "Logout successful" },
      { status: 200 }
    );

    response.cookies.delete('session_token');
    
    return response;

  } catch (error: any) {
    console.error('Signout error:', error);
    return NextResponse.json(
      { success: false, error: error.message || "Server error" },
      { status: 500 }
    );
  }
}