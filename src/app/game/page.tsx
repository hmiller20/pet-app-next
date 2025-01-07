'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useGame } from '@/contexts/GameContext';
import PetAnimation from '@/components/animations/PetAnimation';
import { DeathModal, Tombstone } from '@/components/GameComponents';
import { Cloud, CloudBackground, GrassBackground } from '@/components/backgrounds';
import { InfoModal } from '@/components/InfoModal';
import { useAuth } from '@/contexts/AuthContext';

function StatMeter({ label, value, isDead, type }: {
  label: string;
  value: number;
  isDead: boolean;
  type: 'hunger' | 'happiness' | 'health';
}) {
  const getBarColor = (value: number) => {
    if (value > 90) return 'bg-green-500';
    if (value > 50) return 'bg-yellow-500';
    if (value > 20) return 'bg-orange-500';
    return 'bg-red-500';
  };

  return (
    <div className="bg-white/90 rounded-xl p-3 shadow-md">
      <div className="text-sm font-medium text-gray-600 mb-1">{label}</div>
      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
        <div 
          className={`h-full transition-all duration-300 ${isDead ? 'bg-gray-300' : getBarColor(value)}`}
          style={{ width: `${isDead ? 0 : value}%` }}
        />
      </div>
      <div className="text-xs text-right mt-1 text-gray-500">
        {isDead ? '0' : Math.round(value)}%
      </div>
    </div>
  );
}

function AgeDisplay({ age }: { age: { days: number; hours: number; minutes: number } }) {
  return (
    <div className="bg-white/90 rounded-xl p-3 shadow-md">
      <div className="text-sm font-medium text-gray-600 mb-1">Age</div>
      <div className="text-xs text-gray-500">
        {age.days}d {age.hours}h {age.minutes}m
      </div>
    </div>
  );
}

interface PetContainerProps {
  isAdult: boolean;
  children: React.ReactNode;
}

const PetContainer = ({ isAdult, children }: PetContainerProps) => (
  <div 
    className="absolute bottom-0"
    style={{
      left: '50%',
      transform: `translate(-50%, ${isAdult ? 'calc(-3vh)' : 'calc(0.5vh)'})`
    }}
  >
    {children}
  </div>
);

const GameInfoContent = () => (
  <>
    <p>
      Your sheep's well-being is represented by stats in three categories: Hungry, Happiness, and Health.
    </p>

    <p>
      Click on the sheep (or tap on mobile) to pet your sheep.
    </p>

    <p>
      Hungry and Happiness meters decrease more quickly when your sheep is young.
    </p>

    <p>
      If your sheep's Hungry or Health meters remain at zero for two consecutive days, your sheep will die.
    </p>

    <p>
      If your sheep is alive after one week, it will become a toddler.
    </p>

    <p>
      Your sheep's health meter can decrease dramatically with little warning, especially when your sheep is young.
    </p>

    <p>
      Drag and drop food and medicine onto your sheep to feed and heal your sheep, respectively.
    </p>
  </>
);

export default function GamePage() {
  const router = useRouter();
  const [showDeathModal, setShowDeathModal] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const { 
    petType, 
    petName,
    hunger,
    happiness,
    health,
    age,
    feedPet,
    playWithPet,
    healPet,
    isDead,
    resetGame,
    isLoading
  } = useGame();
  const { user } = useAuth();
  console.log('Current user ID:', user?.uid);

  useEffect(() => {
    if (!isLoading && (!petType || !petName)) {
      router.push('/choose-pet');
    }
  }, [petType, petName, router, isLoading]);

  useEffect(() => {
    if (isDead) {
      setShowDeathModal(true);
    }
  }, [isDead]);

  const handleBackToMenu = async () => {
    if (isDead) {
      setShowDeathModal(true);
    } else {
      router.push('/menu');
    }
  };

  const handleDeathReset = async () => {
    await resetGame();
    setShowDeathModal(false);
    router.push('/choose-pet');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  if (!petType || !petName) {
    return null;
  }

  return (
    <div className="min-h-screen bg-sky-200 relative overflow-hidden">
      {/* Backgrounds */}
      <CloudBackground />
      <GrassBackground />

      {/* Main content */}
      <div className="relative z-10 h-screen flex flex-col">
        {/* Header with back button, title, and info */}
        <div className="p-4 flex justify-between items-center">
          <button 
            onClick={handleBackToMenu}
            className="bg-white/90 px-4 py-2 rounded-xl shadow-md hover:bg-white transition-colors text-gray-600"
          >
            Back to Menu
          </button>

          {/* Title widget - centered independently */}
          <div className="absolute left-1/2 -translate-x-1/2 bg-white/90 px-6 py-2 rounded-xl shadow-md">
            <h1 className="text-lg font-semibold text-gray-600">
              {petName}'s Home
            </h1>
          </div>
          
          {/* Info icon - positioned to the right of center */}
          <div 
            onClick={() => setShowInfoModal(true)}
            className="absolute left-[calc(50%+120px)] bg-white/90 w-8 h-8 rounded-full shadow-md flex items-center justify-center cursor-pointer hover:bg-white transition-colors"
          >
            <span className="text-gray-600 text-lg">ⓘ</span>
          </div>
        </div>

        {/* Main game area with side controls */}
        <div className="flex-1 flex">
          {/* Left sidebar with stats and controls */}
          <div className="w-64 p-4 flex flex-col justify-center space-y-6">
            {/* Stats section with age */}
            <div className="space-y-3">
              <AgeDisplay age={age} />
              <StatMeter label="Hunger" value={hunger} isDead={isDead} type="hunger" />
              <StatMeter label="Happiness" value={happiness} isDead={isDead} type="happiness" />
              <StatMeter label="Health" value={health} isDead={isDead} type="health" />
            </div>

            {/* Action buttons */}
            <div className="space-y-3">
              <button
                onClick={feedPet}
                disabled={isDead}
                className="w-full py-3 px-6 bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white rounded-xl font-semibold transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-md border-b-4 border-green-600 hover:border-green-700 disabled:border-gray-400"
              >
                Feed
              </button>
              <button
                onClick={playWithPet}
                disabled={isDead}
                className="w-full py-3 px-6 bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-300 text-white rounded-xl font-semibold transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-md border-b-4 border-yellow-600 hover:border-yellow-700 disabled:border-gray-400"
              >
                Play
              </button>
              <button
                onClick={healPet}
                disabled={isDead}
                className="w-full py-3 px-6 bg-red-500 hover:bg-red-600 disabled:bg-gray-300 text-white rounded-xl font-semibold transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-md border-b-4 border-red-600 hover:border-red-700 disabled:border-gray-400"
              >
                Heal
              </button>
            </div>
          </div>

          {/* Pet display area */}
          <div className="flex-1 flex items-end justify-center">
            <div className="w-[min(384px,50vw)] h-[min(384px,50vh)] relative mb-0">
              {isDead ? (
                <div className="absolute bottom-[12vh] left-1/2 -translate-x-1/2">
                  <Tombstone petName={petName} />
                </div>
              ) : (
                <PetContainer isAdult={age.days >= 3}>
                  <PetAnimation />
                </PetContainer>
              )}
            </div>
          </div>

          {/* Right side spacer to balance layout */}
          <div className="w-64" />
        </div>
      </div>

      {/* Death modal */}
      {showDeathModal && (
        <DeathModal 
          petName={petName}
          onReset={handleDeathReset}
        />
      )}

      {/* Info modal */}
      {showInfoModal && (
        <InfoModal 
          title="Caring For Your Sheep"
          onClose={() => setShowInfoModal(false)}
        >
          <GameInfoContent />
        </InfoModal>
      )}
    </div>
  );
}