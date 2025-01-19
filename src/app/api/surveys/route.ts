import { NextRequest, NextResponse } from 'next/server';
import { SurveyService } from '@/lib/surveyService';
import { connectToDatabase } from '@/lib/mongodb';
import { auth } from '@/lib/firebase-admin';
import { SurveyType } from '@/models/Survey';

// Get available surveys for user
export async function GET(req: NextRequest) {
  try {
    const token = req.headers.get('Authorization')?.split('Bearer ')[1];
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decodedToken = await auth.verifyIdToken(token);
    const userId = decodedToken.uid;

    await connectToDatabase();
    const status = await SurveyService.getUserSurveyStatus(userId);
    
    // If there's a next scheduled survey
    if (status.nextScheduledSurvey) {
      const surveys = await SurveyService.getActiveSurveys(status.nextScheduledSurvey.type);
      const template = surveys.find(s => s.id === status.nextScheduledSurvey.surveyId);
      
      if (template) {
        return NextResponse.json({
          status,
          template
        });
      }
    }

    return NextResponse.json({ status });
  } catch (error) {
    console.error('Error handling survey request:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Submit survey response
export async function POST(req: NextRequest) {
  try {
    const token = req.headers.get('Authorization')?.split('Bearer ')[1];
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decodedToken = await auth.verifyIdToken(token);
    const userId = decodedToken.uid;

    const body = await req.json();
    const { surveyId, responses, analytics } = body;

    await connectToDatabase();
    await SurveyService.submitResponse(
      userId,
      surveyId,
      responses,
      {
        startTime: new Date(analytics.startTime),
        deviceInfo: analytics.deviceInfo,
        userAgent: req.headers.get('user-agent') || undefined
      }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error submitting survey:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
} 