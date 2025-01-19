import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyAHGbu2JZ4ERwxb9qRqahpVRZiX60Gdz6Q",
  authDomain: "virtual-pet-bb8e8.firebaseapp.com",
  databaseURL: "https://virtual-pet-bb8e8-default-rtdb.firebaseio.com",
  projectId: "virtual-pet-bb8e8",
  storageBucket: "virtual-pet-bb8e8.appspot.com",
  messagingSenderId: "576362614780",
  appId: "1:576362614780:web:065837d1a362ed6fa0ec79",
  measurementId: "G-0J7D794RKM"
};

interface SurveyTemplate {
  id: string;
  title: string;
  questions: Array<{
    id: string;
    text: string;
    type: 'likert' | 'text' | 'multipleChoice';
    options?: string[];
    required: boolean;
  }>;
  version: number;
}

interface UserSurveyStatus {
  userId: string;
  lastSurveyDate: number;
  nextSurveyAvailable: number;
  hasAvailableSurvey: boolean;
}

interface SurveyResponse {
  userId: string;
  surveyId: string;
  timestamp: number;
  responses: Array<{
    questionId: string;
    answer: string | number;
  }>;
  completionTime: number;
}

interface UserData {
  petType?: string;
  petName?: string;
  lastInteraction: number;
  lastSaved: number;
  isAdult: boolean;
  isDead: boolean;
  deathTimerStart: number | null;
  hunger: number;
  happiness: number;
  health: number;
  birthDate?: number;
  lastTransformed?: number | null;
}

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

const validateUserData = (data: Partial<UserData>): UserData => {
  const now = Date.now();
  
  const validatedData: UserData = {
    ...data,
    lastInteraction: data.lastInteraction ?? data.lastSaved ?? now,
    lastSaved: data.lastSaved ?? now,
    isAdult: data.isAdult ?? false,
    isDead: data.isDead ?? false,
    deathTimerStart: data.deathTimerStart ?? null,
    hunger: Math.max(0, Math.min(100, data.hunger ?? 100)),
    happiness: Math.max(0, Math.min(100, data.happiness ?? 100)),
    health: Math.max(0, Math.min(100, data.health ?? 100))
  };

  console.log('Validating user data:', {
    original: data,
    validated: validatedData
  });

  return validatedData;
};

// Temporary mock functions using localStorage instead of Firebase RTDB
export const getUserData = async (userId: string): Promise<UserData | null> => {
  const data = localStorage.getItem(`userData_${userId}`);
  return data ? JSON.parse(data) : null;
};

export const saveUserData = async (userId: string, data: UserData): Promise<void> => {
  const validatedData = validateUserData(data);
  localStorage.setItem(`userData_${userId}`, JSON.stringify(validatedData));
};

export const resetUserData = async (userId: string): Promise<void> => {
  localStorage.removeItem(`userData_${userId}`);
};

export type { SurveyTemplate, UserSurveyStatus, SurveyResponse, UserData };