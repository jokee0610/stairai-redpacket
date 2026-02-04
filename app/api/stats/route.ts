import { NextResponse } from 'next/server';
import { getStats } from '@/lib/state';

export async function GET() {
  return NextResponse.json(getStats());
}
