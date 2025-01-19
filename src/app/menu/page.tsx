'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useGame } from '@/contexts/GameContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Cloud, CloudBackground, GrassBackground } from '@/components/backgrounds';

// This is the main menu page component
export default function MenuPage() {
  const { logOut } = useAuth();
  const router = useRouter();
  const { petName } = useGame();

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
          
          <Link
            href="/survey"
            className="w-full py-4 px-6 bg-purple-600 hover:bg-purple-700 text-white rounded-2xl font-semibold transition-transform duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-md border-b-4 border-purple-700 hover:border-purple-800"
          >
            <div className="text-center">
              <span className="font-semibold">Survey</span>
            </div>
          </Link>

          <button 
            onClick={handleLogOut}
            className="w-full py-4 px-6 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-2xl font-medium transition-transform duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-md border-2 border-gray-200"
          >
            Log Out
          </button>
        </div>
      </div>
    </div>
  );
}