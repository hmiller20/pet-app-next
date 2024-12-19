interface PetStats {
    hunger: number;
    happiness: number;
    health: number;
  }
  
  export const calculateDecayedStats = (stats: PetStats, lastSaved: number): PetStats => {
      const now = Date.now();
      const secondsPassed = Math.max(0, (now - lastSaved) / 1000); // Convert to seconds
      const decayRate = 2; // 2% per second (instead of 1% per minute)
      const decay = secondsPassed * decayRate;
    
      console.log('Calculating decay:', {
        currentTime: new Date(now).toISOString(),
        lastSavedTime: new Date(lastSaved).toISOString(),
        secondsPassed,
        decayRate,
        totalDecay: decay,
        originalStats: stats
      });
    
      const decayedStats: PetStats = {
        hunger: Math.max(0, Math.min(100, stats.hunger - decay)),
        happiness: Math.max(0, Math.min(100, stats.happiness - decay)),
        health: Math.max(0, Math.min(100, stats.health - decay))
      };
    
      console.log('Decayed stats:', decayedStats);
    
      return decayedStats;
  };