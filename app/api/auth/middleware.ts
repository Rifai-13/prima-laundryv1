import { NextResponse } from 'next/server';
import { verify } from 'jsonwebtoken';
import Session from '@/lib/models/session.model';
import mongoose from 'mongoose';

export async function middleware(request: any) {
  await mongoose.connect(process.env.MONGODB_URI!);
  
  const token = request.cookies.get('session_token')?.value;
  const path = request.nextUrl.pathname;

  // Public routes
  if (['/signin', '/signup'].includes(path)) {
    if (token) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    return NextResponse.next();
  }

  // Protected routes
  if (!token) {
    return NextResponse.redirect(new URL('/signin', request.url));
  }

  try {
    // Verifikasi token
    const decoded = verify(token, process.env.JWT_SECRET!) as { userId: string };
    
    // Cek session di database
    const session = await Session.findOne({ 
      token,
      userId: decoded.userId,
      expires: { $gt: new Date() }
    }).populate('userId');

    if (!session) {
      throw new Error('Invalid session');
    }

    // Tambahkan user ke request
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-user-id', decoded.userId);
    
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      }
    });

  } catch (error) {
    // Hapus cookie jika invalid
    const response = NextResponse.redirect(new URL('/signin', request.url));
    response.cookies.delete('session_token');
    return response;
  }
}

export const config = {
  matcher: ['/dashboard/:path*', '/signin', '/signup']
};