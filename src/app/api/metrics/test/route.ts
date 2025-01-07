import { NextResponse } from 'next/server';
import { incrementDeathCount, incrementInteraction, getMetrics } from '@/lib/metricsService';
import { connectToDatabase } from '@/lib/mongodb';

export async function GET() {
  try {
    console.log('1. Attempting database connection...');
    await connectToDatabase();
    
    // Test user ID
    const testUserId = 'test-user-123';
    console.log('2. Starting test with userId:', testUserId);
    
    // Test incrementing interactions
    console.log('3. Testing interactions...');
    await incrementInteraction(testUserId, 'feed');
    await incrementInteraction(testUserId, 'play');
    await incrementInteraction(testUserId, 'heal');
    
    // Test incrementing death count
    console.log('4. Testing death count...');
    await incrementDeathCount(testUserId);
    
    // Get the metrics for this user
    console.log('5. Retrieving metrics...');
    const metrics = await getMetrics(testUserId);
    
    return NextResponse.json({
      message: 'Test metrics created successfully',
      metrics
    });
  } catch (error) {
    console.error('Detailed test error:', error);
    return NextResponse.json({
      error: 'Test failed',
      details: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
} 