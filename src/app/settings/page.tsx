'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useGame } from '@/contexts/GameContext';
import { InfoModal } from '@/components/InfoModal';

function getSunPosition() {
  const now = new Date();
  const hours = now.getHours() + now.getMinutes() / 60;
  
  // Convert 24 hour time to a percentage of the day (0-100)
  // 0 = midnight, 25 = 6am, 50 = noon, 75 = 6pm, 100 = midnight
  const dayProgress = (hours / 24) * 100;
  
  // Calculate gradient position
  // Morning: top-left to bottom-right
  // Noon: top to bottom
  // Evening: top-right to bottom-left
  // Night: subtle gradient
  
  if (hours >= 6 && hours < 18) {
    // Daytime: move from left to right
    const progress = ((hours - 6) / 12) * 100; // 0-100 during day
    return {
      background: `linear-gradient(${135 + progress}deg, 
        var(--sun-color) 0%,
        var(--sky-color) 60%,
        var(--sky-color) 100%)`,
      '--sun-color': hours < 12 ? 'rgb(250, 219, 95)' : 'rgb(251, 191, 36)',
      '--sky-color': 'rgb(56, 189, 248)'
    } as React.CSSProperties;
  } else {
    // Nighttime: subtle gradient
    return {
      background: 'linear-gradient(to bottom, rgb(30, 58, 138), rgb(29, 78, 216))'
    } as React.CSSProperties;
  }
}

export default function SettingsPage() {
  const router = useRouter();
  const { logOut } = useAuth();
  const { resetGame, petName } = useGame();
  const [showStoryModal, setShowStoryModal] = useState(false);
  const [gradientStyle, setGradientStyle] = useState<React.CSSProperties>(getSunPosition());

  useEffect(() => {
    // Update every minute
    const interval = setInterval(() => {
      setGradientStyle(getSunPosition());
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  const handleLogOut = async () => {
    await logOut();
    router.push('/login');
  };

  const handleResetGame = async () => {
    if (window.confirm('Are you sure you want to reset your game? This cannot be undone.')) {
      await resetGame();
      router.push('/choose-pet');
    }
  };

  const StoryContent = () => (
    <>
      <p>
        Late one stormy evening, while walking near the mystical hills of Sheep Town, 
        you heard a soft bleating sound coming from behind a fallen log. There, shivering 
        and alone, you found a baby sheep, separated from its family during the seasonal 
        migration of the Great Sheep Herds.
      </p>

      <p>
        The little one was scared but looked up at you with trusting eyes. You learned 
        that during the massive thunderstorm, many young sheep became separated from their 
        families as the herds rushed to seek shelter. The Sheep Town Rangers are working 
        tirelessly to reunite families, but it will take time - the herds have scattered 
        across many hills and valleys.
      </p>

      <p>
        Until your little sheep can be reunited with its herd, it needs a caring guardian 
        to help it grow strong and healthy. As its caregiver, you'll need to:
      </p>

      <ul className="list-disc pl-6 space-y-2">
        <li>Provide food and nourishment to help it grow</li>
        <li>Play with it to keep its spirits high</li>
        <li>Tend to its health to ensure it thrives</li>
      </ul>

      <p>
        With your help, your sheep can grow from a vulnerable baby into a strong, confident 
        adult. The bond you form will be special - while the sheep may eventually return to 
        Sheep Town, you'll always be its first friend and protector who helped it through 
        a difficult time.
      </p>

      <p className="italic">
        Will you open your heart and home to this little one who needs your help? Your 
        journey of care and friendship begins now...
      </p>
    </>
  );

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden transition-all duration-1000"
      style={gradientStyle}
    >
      {/* Decorative circles - adjusted for time of day */}
      <div className="absolute top-20 left-20 w-64 h-64 bg-white/10 rounded-full blur-2xl" />
      <div className="absolute bottom-20 right-20 w-96 h-96 bg-white/5 rounded-full blur-2xl" />
      
      <div className="max-w-md w-full bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-8 space-y-8 transition-all duration-300 border border-white/50">
        <h1 className="text-4xl font-bold text-center text-sky-800 mb-8">
          Settings
        </h1>
        
        <div className="flex flex-col space-y-4">
          <button 
            onClick={() => setShowStoryModal(true)}
            className="w-full py-4 px-6 bg-sky-600 hover:bg-sky-700 text-white rounded-2xl font-semibold transition-transform duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-md border-b-4 border-sky-700 hover:border-sky-800"
          >
            {petName}'s Story
          </button>

          <button 
            onClick={handleResetGame}
            className="w-full py-4 px-6 bg-sky-400 hover:bg-sky-500 text-white rounded-2xl font-semibold transition-transform duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-md border-b-4 border-sky-500 hover:border-sky-600"
          >
            Reset Game
          </button>

          <button 
            onClick={() => router.push('/menu')}
            className="w-full py-4 px-6 bg-sky-800 hover:bg-sky-900 text-white rounded-2xl font-semibold transition-transform duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-md border-b-4 border-sky-900 hover:border-sky-950"
          >
            Back to Menu
          </button>
        </div>

        {showStoryModal && (
          <InfoModal 
            title={`${petName}'s Story`}
            onClose={() => setShowStoryModal(false)}
          >
            <StoryContent />
          </InfoModal>
        )}
      </div>
    </div>
  );
}