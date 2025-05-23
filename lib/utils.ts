import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { TransactionStatus } from './types';
import { getToken } from 'next-auth/jwt';
import { NextRequest } from 'next/server';
import { Types } from 'mongoose';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Format currency to Indonesian Rupiah
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

// Format date to readable format
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

// Format date to yyyy-MM-dd for input fields
export function formatDateForInput(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toISOString().split('T')[0];
}

// Get status badge color
export function getStatusColor(status: TransactionStatus): string {
  switch (status) {
    case 'pending':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'processing':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'completed':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'cancelled':
      return 'bg-red-100 text-red-800 border-red-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
}

// Generate random ID
export function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}

export async function validateHeaders(request: NextRequest) {
  try {
    const token = await getToken({ req: request });
    return token?.sub || null;
  } catch (error) {
    return null;
  }
}

export function validateEnv(keys: string[]): void {
  keys.forEach(key => {
    if (!process.env[key]) {
      throw new Error(`${key} environment variable is required`);
    }
  });
}

export function validateCredentials(email?: string, password?: string): void {
  if (!email || !password) {
    throw new Error('Email and password are required');
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new Error('Invalid email format');
  }

  if (password.length < 8) {
    throw new Error('Password must be at least 8 characters');
  }
}