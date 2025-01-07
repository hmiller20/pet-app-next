import { NextResponse } from 'next/server';
import { incrementDeathCount } from '@/lib/metricsService';

export async function POST(request: Request) {
  try {
    const { userId } = await request.json();
    await incrementDeathCount(userId);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to increment death count' }, { status: 500 });
  }
} 