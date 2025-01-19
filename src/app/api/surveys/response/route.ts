import { NextResponse } from 'next/server';
import { submitSurveyResponse } from '@/lib/surveyService';
import { adminAuth } from '@/lib/firebase-admin';

export async function POST(request: Request) {
  try {
    // Get Firebase token from Authorization header
    const authHeader = request.headers.get('Authorization');
    console.log('Auth header present:', !!authHeader);
    
    if (!authHeader?.startsWith('Bearer ')) {
      console.log('Missing or invalid auth header');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split('Bearer ')[1];
    console.log('Token extracted, verifying...');
    
    const decodedToken = await adminAuth.verifyIdToken(token);
    console.log('Token verified, userId:', decodedToken.uid);
    
    const body = await request.json();
    const { surveyId, responses, completionTime } = body;

    if (!surveyId || !responses || !completionTime) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const response = await submitSurveyResponse(
      decodedToken.uid,
      surveyId,
      responses,
      completionTime
    );

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error submitting survey response:', error);
    return NextResponse.json(
      { error: 'Failed to submit survey response', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 