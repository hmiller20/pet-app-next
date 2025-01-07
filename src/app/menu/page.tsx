'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useGame } from '@/contexts/GameContext';
import { useRouter } from 'next/navigation';
import { useMemo, useEffect, useState } from 'react';
import { getUserSurveyStatus } from '@/lib/firebase';
import { ref, onValue } from 'firebase/database';
import { database } from '@/lib/firebase';

function Cloud({ className = "", index = 0 }: { className?: string; index?: number }) {
  // Memoize all random values
  const cloudStyle = useMemo(() => {
    const sizeMultiplier = 0.9 + Math.random() * 0.2;
    const baseWidth = 120;
    const baseHeight = 60;
    
    const width = Math.round(baseWidth * sizeMultiplier);
    const height = Math.round(baseHeight * sizeMultiplier);
    
    const verticalPositions = [4, 8, 12, 20, 28];
    const randomOffset = Math.random() * 4;
    const verticalPosition = verticalPositions[index] + randomOffset;
    
    return {
      width: `${width}px`,
      height: `${height}px`,
      top: `${verticalPosition}vh`,
    };
  }, [index]); // Only recalculate if index changes

  const bumpStyles = useMemo(() => {
    return [...Array(3)].map((_, i) => ({
      width: `${30 + Math.random() * 40}%`,
      height: `${80 + Math.random() * 40}%`,
      left: `${10 + (i * 25) + (Math.random() * 10)}%`,
      top: `${-(80 + Math.random() * 40)/2}%`,
    }));
  }, []);  // Empty dependency array means these values won't change

  return (
    <div 
      className={`absolute bg-white rounded-full ${className}`}
      style={cloudStyle}
    >
      {bumpStyles.map((style, i) => (
        <div
          key={i}
          className="absolute bg-white rounded-full"
          style={style}
        />
      ))}
    </div>
  );
}

function CloudBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <Cloud className="animate-cloud-1" index={0} />
      <Cloud className="animate-cloud-2" index={1} />
      <Cloud className="animate-cloud-3" index={2} />
      <Cloud className="animate-cloud-4" index={3} />
      <Cloud className="animate-cloud-5" index={4} />
    </div>
  );
}

function GrassBackground() {
  return (
    <div className="absolute bottom-0 left-0 right-0">
      {/* Main grass layer */}
      <div className="h-24 bg-green-500 relative">
        {/* Dotted texture overlay */}
        <div className="absolute inset-0 opacity-10">
          {[...Array(8)].map((_, i) => (
            <div 
              key={i}
              className="h-3 flex justify-around"
              style={{
                transform: `translateX(${i % 2 ? '10px' : '0'})`
              }}
            >
              {[...Array(20)].map((_, j) => (
                <div 
                  key={j}
                  className="w-1 h-1 bg-black rounded-full"
                />
              ))}
            </div>
          ))}
        </div>
        
        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-green-600/10" />
      </div>
    </div>
  );
}

export default function MenuPage() {
  const { logOut } = useAuth();
  const router = useRouter();
  const { petName, isDead } = useGame();
  const [hasSurvey, setHasSurvey] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (!user || isDead) {
      setHasSurvey(false);
      return;
    }
    
    console.log('Setting up real-time listener for survey status');
    const surveyStatusRef = ref(database, `users/${user.uid}/surveyStatus`);
    
    const unsubscribe = onValue(surveyStatusRef, (snapshot) => {
      const status = snapshot.val();
      // Simply trust the hasAvailableSurvey flag - the backend is responsible for its accuracy
      setHasSurvey(status?.hasAvailableSurvey ?? false);
    });
  
    return () => {
      console.log('Cleaning up survey status listener');
      unsubscribe();
    };
  }, [user, isDead]);

  const handleLogOut = async () => {
    await logOut();
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-sky-200 flex items-center justify-center p-4 relative overflow-hidden">
      <CloudBackground />
      <GrassBackground />

      <div className="max-w-md w-full bg-white rounded-3xl shadow-lg p-8 space-y-8 relative z-10 border-4 border-gray-100">
        <h1 className="text-4xl font-bold text-center text-green-600 mb-8">
          Sheep Meadow
        </h1>
        
        <div className="flex flex-col space-y-4">
          <button 
            onClick={() => router.push('/game')}
            className="w-full py-4 px-6 bg-green-500 hover:bg-green-600 text-white rounded-2xl font-semibold transition-transform duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-md border-b-4 border-green-600 hover:border-green-700"
          >
            Visit {petName}
          </button>
          
          <button 
            onClick={() => router.push('/settings')}
            className="w-full py-4 px-6 bg-green-100 hover:bg-green-200 text-green-700 rounded-2xl font-medium transition-transform duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-md border-2 border-green-200"
          >
            Settings
          </button>
          
          <button 
            onClick={handleLogOut}
            className="w-full py-4 px-6 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-2xl font-medium transition-transform duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-md border-2 border-gray-200"
          >
            Log Out
          </button>
          
          {hasSurvey && (
            <button 
              onClick={() => router.push('/survey')}
              className="w-full py-4 px-6 bg-purple-500 hover:bg-purple-600 text-white rounded-2xl font-semibold transition-transform duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-md border-b-4 border-purple-600 hover:border-purple-700 relative"
            >
              <span className="absolute top-0 right-0 transform -translate-y-1/2 translate-x-1/2 w-3 h-3 bg-red-500 rounded-full" />
              Daily Survey Available!
            </button>
          )}
        </div>
      </div>
    </div>
  );
}