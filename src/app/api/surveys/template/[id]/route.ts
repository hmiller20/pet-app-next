import { NextResponse } from 'next/server';
import { getSurveyTemplate } from '@/lib/surveyService';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const template = await getSurveyTemplate(params.id);
    
    if (!template) {
      return NextResponse.json(
        { error: 'Survey template not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(template);
  } catch (error) {
    console.error('Error fetching survey template:', error);
    return NextResponse.json(
      { error: 'Failed to fetch survey template' },
      { status: 500 }
    );
  }
} 