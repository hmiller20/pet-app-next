import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { auth } from '@/lib/firebase-admin';
import { UserSurveyStatus } from '@/models/Survey';

export async function GET(req: NextRequest) {
  try {
    const token = req.headers.get('Authorization')?.split('Bearer ')[1];
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decodedToken = await auth.verifyIdToken(token);
    const userId = decodedToken.uid;

    await connectToDatabase();
    
    // Get user's survey status
    const status = await UserSurveyStatus.findOne({ userId });
    
    // If no status exists yet, return false
    if (!status) {
      return NextResponse.json({ hasAvailableSurvey: false });
    }

    // Check if there's a next scheduled survey and if it's available now
    const now = new Date();
    const hasAvailableSurvey = status.nextScheduledSurvey && 
      status.nextScheduledSurvey.scheduledFor <= now;

    return NextResponse.json({
      hasAvailableSurvey,
      nextAvailable: status.nextScheduledSurvey?.scheduledFor || null
    });

  } catch (error) {
    console.error('Error checking survey status:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 