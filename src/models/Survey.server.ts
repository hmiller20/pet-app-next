'use server';

import mongoose from 'mongoose';
import dbConnect from '@/src/lib/mongodb';
import { SurveyType, type ISurveyTemplate, type IUserSurveyStatus, type ISurveyResponse } from './Survey';

// Main survey template schema
const surveyTemplateSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true
  },
  title: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: Object.values(SurveyType),
    required: true
  },
  questions: [{
    id: String,
    text: String,
    type: {
      type: String,
      enum: ['likert', 'text', 'multipleChoice']
    },
    options: [String],
    required: Boolean,
    metadata: {
      category: String,
      type: Map,
      of: mongoose.Schema.Types.Mixed
    }
  }],
  version: {
    type: Number,
    default: 1
  },
  metadata: {
    description: String,
    type: Map,
    of: mongoose.Schema.Types.Mixed
  }
});

// User survey status schema
const userSurveyStatusSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    unique: true
  },
  lastSurveyDate: {
    type: Number,
    required: true
  },
  nextSurveyAvailable: {
    type: Number,
    required: true
  },
  hasAvailableSurvey: {
    type: Boolean,
    required: true
  }
});

// Survey response schema
const surveyResponseSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true
  },
  responses: {
    timeSpent: String,
    activities: String,
    mood: String,
    notes: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Model types with mongoose.Document
interface ISurveyTemplateModel extends mongoose.Document, Omit<ISurveyTemplate, 'id'> {
  id: string;
}

interface IUserSurveyStatusModel extends mongoose.Document, IUserSurveyStatus {}

interface ISurveyResponseModel extends mongoose.Document, ISurveyResponse {}

// Export the getModels function for model initialization
export async function getModels() {
  await dbConnect();
  
  const models = {
    SurveyTemplate: mongoose.models.SurveyTemplate || 
      mongoose.model<ISurveyTemplateModel>('SurveyTemplate', surveyTemplateSchema),
    UserSurveyStatus: mongoose.models.UserSurveyStatus || 
      mongoose.model<IUserSurveyStatusModel>('UserSurveyStatus', userSurveyStatusSchema),
    SurveyResponse: mongoose.models.SurveyResponse || 
      mongoose.model<ISurveyResponseModel>('SurveyResponse', surveyResponseSchema)
  };
  
  return models;
}