import { NextResponse } from 'next/server';
import User from '@/lib/models/user.model';
import connectDB from '@/lib/mongodb';
import { validateHeaders } from '@/lib/utils';

export async function GET(request: Request) {
  try {
    await connectDB();
    
    const userId = validateHeaders(request);
    if (!userId) return unauthorizedResponse();

    const user = await User.findById(userId).select('-password -__v');
    if (!user) return notFoundResponse('User');

    return NextResponse.json({ user });

  } catch (error: any) {
    console.error('Error in GET /api/auth/me:', error);
    return serverErrorResponse(error);
  }
}

// Helper functions
const unauthorizedResponse = () => 
  NextResponse.json({ error: "Unauthorized" }, { status: 401 });

const notFoundResponse = (entity: string) => 
  NextResponse.json({ error: `${entity} not found` }, { status: 404 });

const serverErrorResponse = (error: Error) => 
  NextResponse.json(
    { error: error.message || "Internal server error" }, 
    { status: 500 }
  );