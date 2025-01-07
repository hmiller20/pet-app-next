import { NextResponse } from 'next/server';
import { getMetrics } from '@/lib/metricsService';
import { PetMetrics } from '@/models/PetMetrics';
import { connectToDatabase } from '@/lib/mongodb';

export async function GET() {
  try {
    await connectToDatabase();
    
    // Get overall statistics
    const stats = await PetMetrics.aggregate([
      {
        $group: {
          _id: null,
          totalDeaths: { $sum: '$deathCount' },
          totalFeeds: { $sum: '$interactions.feed' },
          totalPlays: { $sum: '$interactions.play' },
          totalHeals: { $sum: '$interactions.heal' },
          userCount: { $sum: 1 }
        }
      }
    ]);

    return NextResponse.json({
      overall: stats[0]
    });
  } catch (error) {
    console.error('Error fetching metrics summary:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 