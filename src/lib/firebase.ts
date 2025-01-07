import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getDatabase, ref, set, get, push, DatabaseReference, DataSnapshot } from 'firebase/database';

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

interface InteractionData {
  type: 'feed' | 'play' | 'heal';
  statsBefore: {
    hunger: number;
    happiness: number;
    health: number;
  };
  statsAfter: {
    hunger: number;
    happiness: number;
    health: number;
  };
}

interface InteractionLog extends InteractionData {
  timestamp: number;
  id?: string;
}

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
  lastSurveyDate: number; // Using number for timestamps like your other date fields
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

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const database = getDatabase(app);

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

export const saveUserData = async (userId: string, data: Partial<UserData>): Promise<void> => {
  try {
    const validatedData = validateUserData(data);
    await set(ref(database, `users/${userId}`), validatedData);
    
    // Initialize survey status for new users
    const surveyStatus = await getUserSurveyStatus(userId);
    if (!surveyStatus) {
      const now = Date.now();
      await updateUserSurveyStatus(userId, {
        userId,
        lastSurveyDate: 0,
        nextSurveyAvailable: now,
        hasAvailableSurvey: true
      });
    }
    
    console.log('Successfully saved user data:', validatedData);
  } catch (error) {
    console.error("Error saving user data:", error);
    throw error;
  }
};

export const getUserData = async (userId: string): Promise<UserData | null> => {
  try {
    const snapshot = await get(ref(database, `users/${userId}`));
    return snapshot.exists() ? snapshot.val() : null;
  } catch (error) {
    console.error("Error getting user data:", error);
    return null;
  }
};

export const resetUserData = async (userId: string): Promise<void> => {
  try {
    await set(ref(database, `users/${userId}`), null);
  } catch (error) {
    console.error("Error resetting user data:", error);
  }
};

export const logInteraction = async (userId: string, interactionData: InteractionData): Promise<void> => {
  try {
    const { type, statsBefore, statsAfter } = interactionData;
    const timestamp = Date.now();
    
    const interactionLog: InteractionLog = {
      timestamp,
      type,
      statsBefore,
      statsAfter
    };

    const interactionsRef = ref(database, `users/${userId}/interactions`);
    await push(interactionsRef, interactionLog);
    
    console.log('Logged interaction:', interactionLog);
  } catch (error) {
    console.error("Error logging interaction:", error);
    throw error;
  }
};

export const getInteractionHistory = async (userId: string, limit = 50): Promise<InteractionLog[]> => {
  try {
    const interactionsRef = ref(database, `users/${userId}/interactions`);
    const snapshot = await get(interactionsRef);
    
    if (!snapshot.exists()) return [];
    
    const interactions: InteractionLog[] = [];
    snapshot.forEach((child: DataSnapshot) => {
      interactions.push({
        id: child.key ?? undefined,
        ...child.val()
      });
    });
    
    return interactions
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, limit);
  } catch (error) {
    console.error("Error fetching interaction history:", error);
    return [];
  }
};

export const getSurveyTemplate = async (templateId: string): Promise<SurveyTemplate | null> => {
  try {
    const snapshot = await get(ref(database, `surveyTemplates/${templateId}`));
    return snapshot.exists() ? snapshot.val() : null;
  } catch (error) {
    console.error("Error getting survey template:", error);
    return null;
  }
};

export const getUserSurveyStatus = async (userId: string): Promise<UserSurveyStatus | null> => {
  try {
    console.log('Getting survey status for user:', userId);
    
    // First check if pet is dead
    const userDataSnapshot = await get(ref(database, `users/${userId}`));
    const userData = userDataSnapshot.exists() ? userDataSnapshot.val() : null;
    
    if (userData?.isDead) {
      console.log('Pet is deceased - surveys disabled');
      return {
        userId,
        lastSurveyDate: Date.now(),
        nextSurveyAvailable: Date.now() + (365 * 24 * 60 * 60 * 1000), // Far future
        hasAvailableSurvey: false
      };
    }
    
    const snapshot = await get(ref(database, `users/${userId}/surveyStatus`));
    const status = snapshot.exists() ? snapshot.val() : null;
    
    console.log('Raw survey status:', status);
    
    if (status) {
      const now = Date.now();
      const nextAvailable = Number(status.nextSurveyAvailable) || 0;
      const lastSurvey = Number(status.lastSurveyDate) || 0;
      const twoMinutesInMs = 2 * 60 * 1000;
      
      // Ensure the status reflects the actual availability based on timing
      if (status.hasAvailableSurvey && now < nextAvailable) {
        status.hasAvailableSurvey = false;
      } else if (!status.hasAvailableSurvey && now >= nextAvailable && 
                 (lastSurvey === 0 || (now - lastSurvey) >= twoMinutesInMs)) {
        status.hasAvailableSurvey = true;
      }
      
      console.log('Checking survey status:', {
        now,
        nextAvailable,
        lastSurvey,
        hasAvailableSurvey: status.hasAvailableSurvey,
        timeSinceLastSurvey: now - lastSurvey,
        currentStatus: status,
        petIsDead: userData?.isDead
      });
      
      return status;
    }
    
    console.log('No survey status found for user');
    // Initialize status for new users
    const now = Date.now();
    const initialStatus: UserSurveyStatus = {
      userId,
      lastSurveyDate: 0,
      nextSurveyAvailable: now,  // Make immediately available for new users
      hasAvailableSurvey: true
    };
    
    await updateUserSurveyStatus(userId, initialStatus);
    return initialStatus;
  } catch (error) {
    console.error("Error getting user survey status:", error);
    return null;
  }
};

export const updateUserSurveyStatus = async (userId: string, status: Partial<UserSurveyStatus>): Promise<void> => {
  try {
    const userStatusRef = ref(database, `users/${userId}/surveyStatus`);
    const currentSnapshot = await get(userStatusRef);
    const currentStatus = currentSnapshot.exists() ? currentSnapshot.val() : {
      userId,
      lastSurveyDate: 0,
      nextSurveyAvailable: Date.now(),
      hasAvailableSurvey: true
    };
    
    // Ensure all required fields are present and properly typed
    const updatedStatus = {
      ...currentStatus,
      ...status,
      userId, // Always ensure userId is set
      timestamp: Date.now(),
      // Ensure numeric fields are actually numbers
      lastSurveyDate: Number(status.lastSurveyDate ?? currentStatus.lastSurveyDate),
      nextSurveyAvailable: Number(status.nextSurveyAvailable ?? currentStatus.nextSurveyAvailable),
      // Ensure boolean fields are actually booleans
      hasAvailableSurvey: Boolean(status.hasAvailableSurvey ?? currentStatus.hasAvailableSurvey)
    };
    
    // Only update if there are actual changes
    if (JSON.stringify(currentStatus) !== JSON.stringify(updatedStatus)) {
      console.log('Updating survey status:', {
        current: currentStatus,
        updated: updatedStatus,
        changes: Object.keys(status)
      });
      await set(userStatusRef, updatedStatus);
      console.log('Successfully updated survey status');
    } else {
      console.log('No changes needed for survey status');
    }
  } catch (error) {
    console.error("Error updating user survey status:", error);
    throw error;
  }
};

export const submitSurveyResponse = async (userId: string, response: Omit<SurveyResponse, 'userId' | 'timestamp'>): Promise<void> => {
  try {
    const timestamp = Date.now();
    const nextAvailable = timestamp + (2 * 60 * 1000); // 2 minutes from now
    
    const surveyResponse: SurveyResponse = {
      userId,
      ...response,
      timestamp
    };

    console.log('Submitting survey response:', surveyResponse);
    const responsesRef = ref(database, `users/${userId}/surveyResponses`);
    await push(responsesRef, surveyResponse);
    console.log('Successfully stored survey response');
    
    // Update survey status with all required fields
    const surveyStatus: UserSurveyStatus = {
      userId,
      lastSurveyDate: timestamp,
      nextSurveyAvailable: nextAvailable,
      hasAvailableSurvey: false
    };
    
    await updateUserSurveyStatus(userId, surveyStatus);
    console.log('Successfully updated survey status:', surveyStatus);
    
  } catch (error) {
    console.error("Error submitting survey response:", error);
    throw error;
  }
};

// Function to get survey responses for a user
export const getUserSurveyResponses = async (userId: string, limit = 50): Promise<SurveyResponse[]> => {
  try {
    const responsesRef = ref(database, `users/${userId}/surveyResponses`);
    const snapshot = await get(responsesRef);
    
    if (!snapshot.exists()) return [];
    
    const responses: SurveyResponse[] = [];
    snapshot.forEach((child: DataSnapshot) => {
      responses.push({
        ...child.val()
      });
    });
    
    return responses
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, limit);
  } catch (error) {
    console.error("Error fetching survey responses:", error);
    return [];
  }
};