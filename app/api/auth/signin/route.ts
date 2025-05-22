import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/lib/models/user.model';
import Session from '@/lib/models/session.model';
import { signToken, setSessionCookie } from '@/lib/auth-utils';
import bcrypt from 'bcryptjs';
import { validateEnv, validateCredentials } from '@/lib/utils';

export async function POST(request: Request) {
  try {
    // Validasi environment variables
    validateEnv(['MONGO_URI', 'JWT_SECRET']);

    // Koneksi database
    await connectDB();

    // Validasi input
    const { email, password } = await request.json();
    validateCredentials(email, password);

    // Cari user
    const user = await User.findOne({ email: email.toLowerCase().trim() })
      .select('+password')
      .lean() as any;

    if (!user || !user.name || !user.email || !user.password) {
      return invalidCredentialsResponse();
    }

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return invalidCredentialsResponse();
    }

    // Generate token dan session
    const token = signToken(user._id.toString());
    await createSession(user._id.toString(), token);

    // Response dengan cookie
    const response = NextResponse.json({
      success: true,
      user: sanitizeUser(user)
    });

    setSessionCookie(response, token);

    return response;

  } catch (error: any) {
    console.error('Error in POST /api/auth/signin:', error);
    return serverErrorResponse(error);
  }
}

// Helper functions
const invalidCredentialsResponse = () =>
  NextResponse.json(
    { error: "Invalid email or password" },
    { status: 401 }
  );

const sanitizeUser = (user: any) => ({
  id: user._id.toString(),
  name: user.name,
  email: user.email
});

const createSession = async (userId: string, token: string) => {
  await Session.create({
    userId,
    token,
    expires: new Date(Date.now() + 86400000)
  });
};

function serverErrorResponse(error: any) {
  return NextResponse.json(
    { error: "Internal server error" },
    { status: 500 }
  );
}

