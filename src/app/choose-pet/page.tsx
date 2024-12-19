'use client';

import { useRouter } from 'next/navigation';
import { useGame } from '@/contexts/GameContext';

const SHEEP_TYPES = [
  { id: 'blueSheepBaby', name: 'Blue Sheep', color: 'bg-blue-500' },
  { id: 'yellowSheepBaby', name: 'Yellow Sheep', color: 'bg-yellow-400' },
  { id: 'brownSheepBaby', name: 'Brown Sheep', color: 'bg-amber-700' },
  { id: 'pinkSheepBaby', name: 'Pink Sheep', color: 'bg-pink-400' },
];

export default function ChoosePetPage() {
  const router = useRouter();
  const { savePetData } = useGame();

  const handleSelectPet = async (petType: string) => {
    await savePetData(petType, null);
    router.push('/name-pet');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center p-8">
      <div className="max-w-6xl w-full -mt-16">
        <h1 className="text-4xl font-bold text-center text-green-800 mb-12">
          Choose Your Sheep!
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {SHEEP_TYPES.map((sheep) => (
            <button
              key={sheep.id}
              onClick={() => handleSelectPet(sheep.id)}
              className="group relative bg-white rounded-3xl shadow-xl p-8 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] hover:shadow-2xl overflow-hidden"
            >
              <div className="aspect-square mb-6">
                <div className={`w-full h-full rounded-3xl ${sheep.color} transition-transform duration-300 group-hover:-translate-y-2`} />
              </div>
              
              <h2 className="text-xl font-semibold text-gray-800 text-center">
                {sheep.name}
              </h2>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}