'use server';

import { connectToDatabase } from './mongodb';
import { PetMetrics } from '../models/PetMetrics';

export async function incrementDeathCount(userId: string) {
  if (typeof window !== 'undefined') return;
  
  await connectToDatabase();
  
  await PetMetrics.findOneAndUpdate(
    { userId },
    { 
      $inc: { deathCount: 1 },
      $set: { lastUpdated: new Date() }
    },
    { upsert: true }
  );
}

export async function incrementInteraction(userId: string, type: 'feed' | 'play' | 'heal') {
  if (typeof window !== 'undefined') return;
  
  await connectToDatabase();
  
  const update = {
    [`interactions.${type}`]: 1
  };
  
  await PetMetrics.findOneAndUpdate(
    { userId },
    { 
      $inc: update,
      $set: { lastUpdated: new Date() }
    },
    { upsert: true }
  );
}

export async function getMetrics(userId: string) {
  if (typeof window !== 'undefined') return null;
  
  await connectToDatabase();
  
  const metrics = await PetMetrics.findOne({ userId });
  return metrics || null;
}

export async function addCustomMetric(
  userId: string, 
  metricName: string, 
  value: any
) {
  if (typeof window !== 'undefined') return;
  
  await connectToDatabase();
  
  await PetMetrics.findOneAndUpdate(
    { userId },
    { 
      $set: { 
        [`additionalMetrics.${metricName}`]: value,
        lastUpdated: new Date()
      }
    },
    { upsert: true }
  );
} 