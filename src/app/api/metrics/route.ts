import { NextResponse } from 'next/server';
import { getMetrics } from '@/lib/metricsService';
import { auth } from '@/lib/firebase';

export async function GET(request: Request) {
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
    
    const decodedToken = await auth.verifyIdToken(token);
    console.log('Token verified, userId:', decodedToken.uid);
    
    const userId = decodedToken.uid;
    const metrics = await getMetrics(userId);
    console.log('Metrics retrieved:', metrics);
    
    return NextResponse.json(metrics || { message: 'No metrics found' });
  } catch (error) {
    console.error('Detailed error in metrics route:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 