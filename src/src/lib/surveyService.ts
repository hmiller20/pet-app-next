'use server';

import dbConnect from './mongodb';
import { 
  ISurveyTemplate,
  IUserSurveyStatus,
  ISurveyResponse,
  EventTrigger
} from '@/models/Survey';
import { getModels } from '@/models/Survey.server';

export async function getSurveyTemplate(templateId: string): Promise<ISurveyTemplate | null> {
  await dbConnect();
  const { SurveyTemplate } = await getModels();
  return await SurveyTemplate.findOne({ id: templateId });
}

export async function getUserSurveyStatus(userId: string): Promise<IUserSurveyStatus | null> {
  await dbConnect();
  const { UserSurveyStatus } = await getModels();
  return await UserSurveyStatus.findOne({ userId });
}

export async function updateUserSurveyStatus(
  userId: string, 
  status: Partial<IUserSurveyStatus>
): Promise<IUserSurveyStatus> {
  await dbConnect();
  const { UserSurveyStatus } = await getModels();
  return await UserSurveyStatus.findOneAndUpdate(
    { userId },
    { $set: status },
    { upsert: true, new: true }
  );
}

export async function submitSurveyResponse(
  userId: string,
  surveyId: string,
  responses: Array<{ questionId: string; answer: string | number }>,
  analytics: {
    startTime: Date;
    deviceInfo?: string;
    userAgent?: string;
  }
): Promise<ISurveyResponse> {
  await dbConnect();
  
  const { SurveyResponse } = await getModels();
  
  const completionTime = Date.now() - analytics.startTime.getTime();
  
  const response = new SurveyResponse({
    userId,
    surveyId,
    timestamp: Date.now(),
    responses,
    completionTime,
    analytics: {
      deviceInfo: analytics.deviceInfo,
      userAgent: analytics.userAgent
    }
  });

  await response.save();

  // Update user's survey status
  const { UserSurveyStatus } = await getModels();
  await UserSurveyStatus.findOneAndUpdate(
    { userId },
    {
      $set: {
        lastSurveyDate: Date.now(),
        nextSurveyAvailable: Date.now() + (24 * 60 * 60 * 1000), // Next survey in 24 hours
        hasAvailableSurvey: false
      }
    },
    { upsert: true }
  );

  return response;
}

export async function triggerEventSurvey(
  userId: string,
  eventType: EventTrigger
): Promise<void> {
  await dbConnect();
  
  // Find relevant survey template for the event
  const { SurveyTemplate } = await getModels();
  const template = await SurveyTemplate.findOne({ 
    type: 'EVENT',
    'metadata.eventTrigger': eventType 
  });
  
  if (template) {
    await updateUserSurveyStatus(userId, {
      userId,
      lastSurveyDate: Date.now(),
      nextSurveyAvailable: Date.now(),
      hasAvailableSurvey: true
    });
  }
} 