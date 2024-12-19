export const DeathModal = ({ petName, onReset }: { petName: string, onReset: () => void }) => (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
    <div className="bg-white rounded-2xl p-8 max-w-sm w-full mx-4 text-center shadow-xl">
      <p className="text-2xl mb-6 text-gray-800">
        {petName} has passed away.
      </p>
      <button 
        onClick={onReset}
        className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-xl font-semibold transition-colors"
      >
        Choose New Pet
      </button>
    </div>
  </div>
);

export const Tombstone = ({ petName }: { petName: string }) => (
  <div className="flex flex-col items-center justify-end h-full">
    <div className="w-48 h-56 relative flex items-center justify-center">
      {/* Tombstone shape */}
      <div className="absolute inset-0 bg-gray-300 rounded-t-3xl" />
      
      {/* Engraved text */}
      <div className="relative text-center text-gray-600">
        <div className="text-2xl font-serif mb-2">RIP</div>
        <div className="text-xl font-serif">{petName}</div>
      </div>
      
      {/* Base of tombstone */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-56 h-8 bg-gray-400 rounded-t-lg" />
    </div>
  </div>
);