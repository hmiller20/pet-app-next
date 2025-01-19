import dbConnect from '@/src/lib/mongodb';
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
  responses: Record<string, string | number>,
  completionTime: number
): Promise<ISurveyResponse> {
  await dbConnect();
  
  const { SurveyResponse } = await getModels();
  
  const response = new SurveyResponse({
    userId,
    surveyId,
    responses,
    completionTime,
    submittedAt: new Date()
  });

  await response.save();
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