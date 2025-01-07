'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { User } from 'firebase/auth';
import { useAuth } from './AuthContext';
import { calculateDecayedStats } from '@/lib/petUtils';
import { getUserData, saveUserData, resetUserData } from '@/lib/firebase';
import { incrementDeathCount, incrementInteraction } from '@/lib/metricsActions';

interface Age {
  days: number;
  hours: number;
  minutes: number;
}

interface PetStats {
  hunger: number;
  happiness: number;
  health: number;
}

interface UserData extends PetStats {
  petType: string;
  petName?: string;
  lastSaved: number;
  birthDate: number;
  isAdult: boolean;
  lastTransformed: number | null;
  lastInteraction: number;
  isDead: boolean;
  deathTimerStart: number | null;
}

interface GameContextType {
  petType: string | null;
  petName: string | null;
  isNewUser: boolean;
  hunger: number;
  happiness: number;
  health: number;
  isLoading: boolean;
  age: Age;
  birthDate: number | null;
  isAdult: boolean;
  lastTransformed: number | null;
  isDead: boolean;
  deathTimerStart: number | null;
  savePetData: (type: string, name: string | null) => Promise<void>;
  resetGame: () => Promise<void>;
  feedPet: () => Promise<void>;
  playWithPet: () => Promise<void>;
  healPet: () => Promise<void>;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export function useGame() {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
}

export function GameProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [petType, setPetType] = useState<string | null>(null);
  const [petName, setPetName] = useState<string | null>(null);
  const [isNewUser, setIsNewUser] = useState(true);
  const [hunger, setHunger] = useState(100);
  const [happiness, setHappiness] = useState(100);
  const [health, setHealth] = useState(100);
  const [lastSaved, setLastSaved] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [birthDate, setBirthDate] = useState<number | null>(null);
  const [age, setAge] = useState<Age>({ days: 0, hours: 0, minutes: 0 });
  const [isAdult, setIsAdult] = useState(false);
  const [lastTransformed, setLastTransformed] = useState<number | null>(null);
  const [isDead, setIsDead] = useState(false);
  const [deathTimerStart, setDeathTimerStart] = useState<number | null>(null);

  const calculateAge = useCallback((birthTimestamp: number | null): Age => {
    if (!birthTimestamp) return { days: 0, hours: 0, minutes: 0 };
    
    const now = Date.now();
    const diffTime = Math.abs(now - birthTimestamp);
    
    const days = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diffTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diffTime % (1000 * 60 * 60)) / (1000 * 60));
    
    return { days, hours, minutes };
  }, []);

  const loadUserData = useCallback(async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const userData = await getUserData(user.uid);
      console.log('Loading user data:', { userId: user.uid, userData });
      
      if (userData && userData.petType) {
        const now = Date.now();
        const decayedStats = calculateDecayedStats(
          { hunger: userData.hunger ?? 100,
            happiness: userData.happiness ?? 100,
            health: userData.health ?? 100
          },
          userData.lastSaved ?? now
        );

        setPetType(userData.petType);
        setPetName(userData.petName ?? null);
        setBirthDate(userData.birthDate ?? now);
        setAge(calculateAge(userData.birthDate ?? now));
        setIsAdult(userData.isAdult ?? false);
        setLastTransformed(userData.lastTransformed ?? null);
        setIsNewUser(false);

        if (userData.isDead) {
          setIsDead(true);
          setHunger(0);
          setHappiness(0);
          setHealth(0);
          setDeathTimerStart(null);
          setLastSaved(now);
          return;
        }

        if (userData.deathTimerStart) {
          const deathTimeElapsed = now - userData.deathTimerStart >= 60000;
          if (deathTimeElapsed) {
            const updatedData: UserData = {
              ...userData,
              isDead: true,
              deathTimerStart: null,
              hunger: 0,
              happiness: 0,
              health: 0,
              lastSaved: now,
              birthDate: birthDate || now,
              isAdult: isAdult ?? false,
              lastInteraction: now,
              lastTransformed: lastTransformed ?? null,
              petType: petType || ''
            };
            await saveUserData(user.uid, updatedData);
            setIsDead(true);
            setHunger(0);
            setHappiness(0);
            setHealth(0);
            setDeathTimerStart(null);
            setLastSaved(now);
            return;
          }
        }

        const isStarving = decayedStats.hunger <= 0;
        const isDying = decayedStats.health <= 0;
        if (isStarving || isDying) {
          const timeToZero = calculateTimeToZero(
            {   hunger: userData.hunger ?? 100,
                happiness: userData.happiness ?? 100,
                health: userData.health ?? 100
            },
            userData.lastSaved ?? Date.now()
          );
          const potentialDeathTime = timeToZero + 60000;
          
          if (now >= potentialDeathTime) {
            const updatedData: UserData = {
              ...userData,
              isDead: true,
              deathTimerStart: null,
              hunger: 0,
              happiness: 0,
              health: 0,
              lastSaved: now,
              petType: userData.petType, //we know this exists because of the outer if check
              birthDate: userData.birthDate ?? now,
              isAdult: userData.isAdult ?? false,
              lastInteraction: now,
              lastTransformed: userData.lastTransformed ?? null,
            };
            await saveUserData(user.uid, updatedData);
            setIsDead(true);
            setHunger(0);
            setHappiness(0);
            setHealth(0);
            setDeathTimerStart(null);
            setLastSaved(now);
            return;
          }
          
          setDeathTimerStart(timeToZero);
        }

        setHunger(decayedStats.hunger);
        setHappiness(decayedStats.happiness);
        setHealth(decayedStats.health);
        setLastSaved(now);
      } else {
        setIsNewUser(true);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      setIsNewUser(true);
    } finally {
      setIsLoading(false);
    }
  }, [user, calculateAge]);

  const calculateTimeToZero = (stats: PetStats, lastSaved: number): number => {
    const decayRate = 2;
    const lowestStat = Math.min(stats.hunger, stats.health);
    const secondsToZero = lowestStat / decayRate;
    return lastSaved + (secondsToZero * 1000);
  };

  useEffect(() => {
    const resetState = () => {
      setPetType(null);
      setPetName(null);
      setHunger(100);
      setHappiness(100);
      setHealth(100);
      setLastSaved(null);
      setBirthDate(null);
      setAge({ days: 0, hours: 0, minutes: 0 });
      setIsAdult(false);
      setLastTransformed(null);
      setIsNewUser(true);
      setIsLoading(false);
    };

    if (!user) {
      resetState();
      return;
    }

    loadUserData();
  }, [user, loadUserData]);

  const savePetData = async (type: string, name: string | null) => {
    if (!user) {
      console.error('No user found when trying to save pet data');
      return;
    }

    const now = Date.now();
    const formattedType = type.endsWith('Baby') ? type : `${type}Baby`;
    
    const currentData = await getUserData(user.uid);
    if (currentData && currentData.petType && !isNewUser) {
      await resetUserData(user.uid);
    }

    const userData: UserData = {
      petType: formattedType,
      hunger: 100,
      happiness: 100,
      health: 100,
      lastSaved: now,
      birthDate: now,
      isAdult: false,
      lastTransformed: null,
      lastInteraction: now,
      isDead: false,
      deathTimerStart: null
    };

    if (name) {
      userData.petName = name;
    }

    try {
      await saveUserData(user.uid, userData);
      console.log('Saved pet data to Firebase:', userData);

      setPetType(formattedType);
      if (name) setPetName(name);
      setHunger(100);
      setHappiness(100);
      setHealth(100);
      setBirthDate(now);
      setLastSaved(now);
      setAge({ days: 0, hours: 0, minutes: 0 });
      setIsAdult(false);
      setLastTransformed(null);
      setIsNewUser(false);
      setIsDead(false);
      setDeathTimerStart(null);
    } catch (error) {
      console.error('Error saving pet data:', error);
      throw error;
    }
  };

  const feedPet = async () => {
    if (!user || !petType) return;

    const now = Date.now();
    const userData: UserData = {
      petType,
      hunger: 100,
      happiness,
      health,
      lastSaved: now,
      birthDate: birthDate || now,
      isAdult,
      lastTransformed,
      lastInteraction: now,
      isDead: false,
      deathTimerStart: null
    };
    if (petName) userData.petName = petName;

    await saveUserData(user.uid, userData);
    setHunger(100);
    setLastSaved(now);

    await incrementInteraction(user.uid, 'feed');
  };

  const playWithPet = async () => {
    if (!user || !petType) return;

    const now = Date.now();
    const userData: UserData = {
      petType,
      hunger,
      happiness: 100,
      health,
      lastSaved: now,
      birthDate: birthDate || now,
      isAdult,
      lastTransformed,
      lastInteraction: now,
      isDead: false,
      deathTimerStart: null
    };
    if (petName) userData.petName = petName;

    await saveUserData(user.uid, userData);
    setHappiness(100);
    setLastSaved(now);

    await incrementInteraction(user.uid, 'play');
  };

  const healPet = async () => {
    if (!user || !petType) return;

    const now = Date.now();
    const userData: UserData = {
      petType,
      hunger,
      happiness,
      health: 100,
      lastSaved: now,
      birthDate: birthDate || now,
      isAdult,
      lastTransformed,
      lastInteraction: now,
      isDead: false,
      deathTimerStart: null
    };
    if (petName) userData.petName = petName;

    await saveUserData(user.uid, userData);
    setHealth(100);
    setLastSaved(now);

    await incrementInteraction(user.uid, 'heal');
  };

  const resetGame = async () => {
    if (!user) return;

    try {
      await resetUserData(user.uid);
      setPetType(null);
      setPetName(null);
      setHunger(100);
      setHappiness(100);
      setHealth(100);
      setLastSaved(Date.now());
      setBirthDate(null);
      setAge({ days: 0, hours: 0, minutes: 0 });
      setIsAdult(false);
      setLastTransformed(null);
      setIsNewUser(true);
      setIsDead(false);
      setDeathTimerStart(null);

      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
      console.error('Error resetting game:', error);
      throw error;
    }
  };

  useEffect(() => {
    if (!user || isNewUser || isDead) return;

    const interval = setInterval(async () => {
      const now = Date.now();
      const decayedStats = calculateDecayedStats(
        { hunger, happiness, health },
        lastSaved || now
      );

      const isStarving = decayedStats.hunger <= 0;
      const isDying = decayedStats.health <= 0;
      const criticalCondition = isStarving || isDying;

      const baseData: Partial<UserData> = {
        ...decayedStats,
        petType: petType || '',
        birthDate: birthDate || now,
        isAdult,
        lastInteraction: now,
        lastSaved: now
      };

      if (petName) {
        baseData.petName = petName;
      }

      if (criticalCondition) {
        if (!deathTimerStart) {
          baseData.deathTimerStart = now;
          setDeathTimerStart(now);
        } else {
          const deathTimeElapsed = now - deathTimerStart >= 60000;
          if (deathTimeElapsed) {
            baseData.isDead = true;
            baseData.deathTimerStart = null;
            setIsDead(true);
          }
        }
      } else if (deathTimerStart) {
        baseData.deathTimerStart = null;
        setDeathTimerStart(null);
      }

      if (user) await saveUserData(user.uid, baseData as UserData);

      setHunger(decayedStats.hunger);
      setHappiness(decayedStats.happiness);
      setHealth(decayedStats.health);
      setLastSaved(now);

      if (baseData.isDead) {
        incrementDeathCount(user.uid).catch(console.error);
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [user, isNewUser, isDead, hunger, happiness, health, lastSaved, deathTimerStart, petType, petName, birthDate, isAdult]);

  useEffect(() => {
    if (!petName || !petType || isDead) return;

    if (birthDate) {
      setAge(calculateAge(birthDate));
    }

    const timer = setInterval(() => {
      setAge(prevAge => {
        const newMinutes = prevAge.minutes + 1;
        const newHours = prevAge.hours + Math.floor(newMinutes / 60);
        const newDays = prevAge.days + Math.floor(newHours / 24);
        
        return {
          minutes: newMinutes % 60,
          hours: newHours % 24,
          days: newDays
        };
      });
    }, 60000);

    return () => clearInterval(timer);
  }, [petName, petType, isDead, birthDate, calculateAge]);

  useEffect(() => {
    if (!user || !birthDate || isAdult || !petType) return;

    const timeSinceBirth = Date.now() - birthDate;
    if (timeSinceBirth >= 60000) {
      const now = Date.now();
      const userData: UserData = {
        petType,
        hunger,
        happiness,
        health,
        birthDate,
        lastSaved: now,
        lastInteraction: now,
        isAdult: true,
        lastTransformed: now,
        isDead: false,
        deathTimerStart: null
      };
      if (petName) userData.petName = petName;
      
      saveUserData(user.uid, userData)
        .then(() => {
          setIsAdult(true);
          setLastTransformed(now);
        })
        .catch(error => {
          console.error('Error saving transformation:', error);
        });
    }
  }, [birthDate, isAdult, user, petType, petName, hunger, happiness, health]);

  const value: GameContextType = {
    petType,
    petName,
    isNewUser,
    hunger,
    happiness,
    health,
    isLoading,
    savePetData,
    resetGame,
    feedPet,
    playWithPet,
    healPet,
    age,
    birthDate,
    isAdult,
    lastTransformed,
    isDead,
    deathTimerStart
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}