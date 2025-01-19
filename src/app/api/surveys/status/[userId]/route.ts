import { NextResponse } from 'next/server';
import { getUserSurveyStatus, updateUserSurveyStatus } from '@/lib/surveyService';

export async function GET(
  request: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const status = await getUserSurveyStatus(params.userId);
    
    if (!status) {
      return NextResponse.json(
        { error: 'Survey status not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(status);
  } catch (error) {
    console.error('Error fetching survey status:', error);
    return NextResponse.json(
      { error: 'Failed to fetch survey status' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const body = await request.json();
    const status = await updateUserSurveyStatus(params.userId, body);
    return NextResponse.json(status);
  } catch (error) {
    console.error('Error updating survey status:', error);
    return NextResponse.json(
      { error: 'Failed to update survey status' },
      { status: 500 }
    );
  }
} 