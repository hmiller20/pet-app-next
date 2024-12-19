'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useGame } from '@/contexts/GameContext';

export default function NamePetPage() {
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();
  const { savePetData, petType } = useGame();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check if name contains at least one letter
    if (!name.match(/[a-zA-Z]/)) {
      setError('Name must contain at least one letter');
      return;
    }

    if (name.trim()) {
      await savePetData(petType!, name);
      router.push('/game');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 p-8 flex items-center justify-center">
      <div className="bg-white rounded-3xl shadow-xl p-8 w-full max-w-md">
        <h1 className="text-3xl font-bold text-center text-green-800 mb-8">
          Name Your Sheep!
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError(''); // Clear error when user types
              }}
              placeholder="Enter your sheep's name"
              className={`w-full px-4 py-3 rounded-xl border text-black ${error ? 'border-red-300 focus:border-red-500 focus:ring-red-200' : 'border-gray-200 focus:border-green-500 focus:ring-green-200'} focus:ring-2 outline-none transition-all duration-200`}
              maxLength={20}
              required
            />
            {error && (
              <p className="text-red-500 text-sm pl-1">
                {error}
              </p>
            )}
          </div>

          <button
            type="submit"
            className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-md"
          >
            Confirm Name
          </button>
        </form>
      </div>
    </div>
  );
}