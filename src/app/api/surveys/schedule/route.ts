import { NextRequest, NextResponse } from 'next/server';
import { SurveyService } from '@/lib/surveyService';
import { connectToDatabase } from '@/lib/mongodb';
import { auth } from '@/lib/firebase-admin';
import { SurveyType } from '@/models/Survey';

export async function POST(req: NextRequest) {
  try {
    const token = req.headers.get('Authorization')?.split('Bearer ')[1];
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decodedToken = await auth.verifyIdToken(token);
    const userId = decodedToken.uid;

    const { surveyId, type, scheduledFor } = await req.json();
    if (!Object.values(SurveyType).includes(type)) {
      return NextResponse.json(
        { error: 'Invalid survey type' },
        { status: 400 }
      );
    }

    await connectToDatabase();
    await SurveyService.scheduleSurvey(
      userId,
      surveyId,
      type,
      scheduledFor ? new Date(scheduledFor) : undefined
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error scheduling survey:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 