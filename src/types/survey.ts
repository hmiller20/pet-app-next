// types/survey.ts

export interface SurveyTemplate {
    id: string;
    title: string;
    questions: SurveyQuestion[];
    version: number;
  }
  
  export interface SurveyQuestion {
    id: string;
    text: string;
    type: 'likert' | 'text' | 'multipleChoice';
    options?: string[];
    required: boolean;
  }
  
  export interface UserSurveyStatus {
    userId: string;
    lastSurveyDate: number;
    nextSurveyAvailable: number;
    hasAvailableSurvey: boolean;
  }
  
  export interface SurveyResponse {
    surveyId: string;
    timestamp: number;
    responses: Array<{
      questionId: string;
      answer: string | number;
    }>;
    completionTime: number;
  }