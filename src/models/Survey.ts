/**
 * @fileoverview Survey system data structures
 * @purpose Defines types and interfaces for the survey system
 */

export enum SurveyType {
  INITIAL = 'initial',
  DAILY = 'daily',
  EVENT = 'event',
  SCHEDULED = 'scheduled'
}

export type EventTrigger = 'petDeath' | 'petBirth' | 'transformation';

export interface ISurveyQuestion {
  id: string;
  text: string;
  type: 'likert' | 'text' | 'multipleChoice';
  options?: string[];
  required: boolean;
  metadata?: {
    category?: string;
    [key: string]: any;
  };
}

export interface ISurveyTemplate {
  id: string;
  title: string;
  type: SurveyType;
  questions: ISurveyQuestion[];
  version: number;
  metadata?: {
    description?: string;
    [key: string]: any;
  };
}

export interface IUserSurveyStatus {
  userId: string;
  lastSurveyDate: number;
  nextSurveyAvailable: number;
  hasAvailableSurvey: boolean;
}

export interface ISurveyResponse {
  userId: string;
  surveyId: string;
  timestamp: number;
  responses: Array<{
    questionId: string;
    answer: string | number;
  }>;
  completionTime: number;
} 