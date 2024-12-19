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