import { NextResponse } from 'next/server';
import { verify } from 'jsonwebtoken';
import Session from '@/lib/models/session.model';
import connectDB from '@/lib/mongodb';
import { validateEnv } from '@/lib/utils';

export async function middleware(request: any) {
  try {
    validateEnv(['MONGODB_URI', 'JWT_SECRET']);
    await connectDB();

    const token = request.cookies.get('session_token')?.value;
    const path = request.nextUrl.pathname;

    // Handle public routes
    if (['/signin', '/signup'].includes(path)) {
      return handlePublicRoutes(token, request);
    }

    // Handle protected routes
    return await handleProtectedRoutes(token, request);

  } catch (error) {
    console.error('Middleware error:', error);
    return handleMiddlewareError(request);
  }
}

const handlePublicRoutes = (token: string | undefined, request: any) => {
  if (token) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }
  return NextResponse.next();
};

const handleProtectedRoutes = async (token: string | undefined, request: any) => {
  if (!token) {
    return NextResponse.redirect(new URL('/signin', request.url));
  }

  try {
    const decoded = verify(token, process.env.JWT_SECRET!) as { userId: string };
    const session = await Session.findOne({
      token,
      userId: decoded.userId,
      expires: { $gt: new Date() }
    });

    if (!session) throw new Error('Invalid session');

    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-user-id', decoded.userId);

    return NextResponse.next({ request: { headers: requestHeaders } });
  } catch (error) {
    return handleInvalidSession(request);
  }
};

const handleInvalidSession = (request: any) => {
  const response = NextResponse.redirect(new URL('/signin', request.url));
  response.cookies.delete('session_token');
  return response;
};

const handleMiddlewareError = (request: any) => {
  const response = NextResponse.redirect(new URL('/signin', request.url));
  response.cookies.delete('session_token');
  return response;
};

export const config = {
  matcher: ['/dashboard/:path*', '/signin', '/signup', '/api/auth/:path*']
};