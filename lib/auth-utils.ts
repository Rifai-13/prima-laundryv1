import { sign } from 'jsonwebtoken';
import { NextResponse } from 'next/server';

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