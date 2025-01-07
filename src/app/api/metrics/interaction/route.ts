import { NextResponse } from 'next/server';
import { incrementInteraction } from '@/lib/metricsService';

export async function POST(request: Request) {
  try {
    const { userId, type } = await request.json();
    await incrementInteraction(userId, type);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to increment interaction' }, { status: 500 });
  }
} 