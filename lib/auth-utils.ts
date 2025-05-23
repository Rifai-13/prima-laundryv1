import { sign, verify } from 'jsonwebtoken';
import { NextResponse, NextRequest } from 'next/server';

export function getUserIdFromToken(request: NextRequest): string | null {
  try {
    const token = request.cookies.get('session_token')?.value;
    
    if (!token || !process.env.JWT_SECRET) return null;
    
    const decoded = verify(token, process.env.JWT_SECRET) as { userId: string };
    return decoded.userId;
  } catch (error) {
    return null;
  }
}

// Fungsi existing tetap dipertahankan
export function signToken(userId: string): string {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined');
  }
  
  return sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: '1d' }
  );
}

export function setSessionCookie(response: NextResponse, token: string): void {
  response.cookies.set('session_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 86400,
    path: '/',
    sameSite: 'lax'
  });
}