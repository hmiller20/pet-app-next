import { NextResponse } from 'next/server';
import { triggerEventSurvey } from '@/lib/surveyService';
import { EventTrigger } from '@/models/Survey';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, eventType } = body;

    if (!userId || !eventType) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (!Object.values(EventTrigger).includes(eventType as EventTrigger)) {
      return NextResponse.json(
        { error: 'Invalid event type' },
        { status: 400 }
      );
    }

    await triggerEventSurvey(userId, eventType as EventTrigger);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error triggering event survey:', error);
    return NextResponse.json(
      { error: 'Failed to trigger event survey' },
      { status: 500 }
    );
  }
} 