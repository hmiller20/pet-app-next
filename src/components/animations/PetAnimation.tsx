'use client';

import Lottie, { LottieRefCurrentProps, LottieComponentProps } from "lottie-react";
import { useRef, useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useGame } from "@/contexts/GameContext";
import { usePathname } from 'next/navigation';

// Animation type definitions
type EmotionalState = 'happy' | 'neutral' | 'sad' | 'sick';
type AnimationType = Record<EmotionalState, unknown>;
type AnimationsType = Record<string, AnimationType>;

// Import all baby animations for each color
import blueSheepBabyHappy from "@/assets/animations/pets/sheep/baby/blue/blueSheepBabyHappy.json";
import blueSheepBabyNeutral from "@/assets/animations/pets/sheep/baby/blue/blueSheepBabyNeutral.json";
import blueSheepBabySad from "@/assets/animations/pets/sheep/baby/blue/blueSheepBabySad.json";
import blueSheepBabySick from "@/assets/animations/pets/sheep/baby/blue/blueSheepBabySick.json";

import yellowSheepBabyHappy from "@/assets/animations/pets/sheep/baby/yellow/yellowSheepBabyHappy.json";
import yellowSheepBabyNeutral from "@/assets/animations/pets/sheep/baby/yellow/yellowSheepBabyNeutral.json";
import yellowSheepBabySad from "@/assets/animations/pets/sheep/baby/yellow/yellowSheepBabySad.json";
import yellowSheepBabySick from "@/assets/animations/pets/sheep/baby/yellow/yellowSheepBabySick.json";

import brownSheepBabyHappy from "@/assets/animations/pets/sheep/baby/brown/brownSheepBabyHappy.json";
import brownSheepBabyNeutral from "@/assets/animations/pets/sheep/baby/brown/brownSheepBabyNeutral.json";
import brownSheepBabySad from "@/assets/animations/pets/sheep/baby/brown/brownSheepBabySad.json";
import brownSheepBabySick from "@/assets/animations/pets/sheep/baby/brown/brownSheepBabySick.json";

import pinkSheepBabyHappy from "@/assets/animations/pets/sheep/baby/pink/pinkSheepBabyHappy.json";
import pinkSheepBabyNeutral from "@/assets/animations/pets/sheep/baby/pink/pinkSheepBabyNeutral.json";
import pinkSheepBabySad from "@/assets/animations/pets/sheep/baby/pink/pinkSheepBabySad.json";
import pinkSheepBabySick from "@/assets/animations/pets/sheep/baby/pink/pinkSheepBabySick.json";

// Import all adult animations for each color
import blueSheepAdultHappy from "@/assets/animations/pets/sheep/adult/blue/blueSheepAdultHappy.json";
import blueSheepAdultNeutral from "@/assets/animations/pets/sheep/adult/blue/blueSheepAdultNeutral.json";
import blueSheepAdultSad from "@/assets/animations/pets/sheep/adult/blue/blueSheepAdultSad.json";
import blueSheepAdultSick from "@/assets/animations/pets/sheep/adult/blue/blueSheepAdultSick.json";

import yellowSheepAdultHappy from "@/assets/animations/pets/sheep/adult/yellow/yellowSheepAdultHappy.json";
import yellowSheepAdultNeutral from "@/assets/animations/pets/sheep/adult/yellow/yellowSheepAdultNeutral.json";
import yellowSheepAdultSad from "@/assets/animations/pets/sheep/adult/yellow/yellowSheepAdultSad.json";
import yellowSheepAdultSick from "@/assets/animations/pets/sheep/adult/yellow/yellowSheepAdultSick.json";

import brownSheepAdultHappy from "@/assets/animations/pets/sheep/adult/brown/brownSheepAdultHappy.json";
import brownSheepAdultNeutral from "@/assets/animations/pets/sheep/adult/brown/brownSheepAdultNeutral.json";
import brownSheepAdultSad from "@/assets/animations/pets/sheep/adult/brown/brownSheepAdultSad.json";
import brownSheepAdultSick from "@/assets/animations/pets/sheep/adult/brown/brownSheepAdultSick.json";

import pinkSheepAdultHappy from "@/assets/animations/pets/sheep/adult/pink/pinkSheepAdultHappy.json";
import pinkSheepAdultNeutral from "@/assets/animations/pets/sheep/adult/pink/pinkSheepAdultNeutral.json";
import pinkSheepAdultSad from "@/assets/animations/pets/sheep/adult/pink/pinkSheepAdultSad.json";
import pinkSheepAdultSick from "@/assets/animations/pets/sheep/adult/pink/pinkSheepAdultSick.json";

const ANIMATIONS: AnimationsType = {
  // Baby animations
  blueSheepBaby: {
    happy: blueSheepBabyHappy,
    neutral: blueSheepBabyNeutral,
    sad: blueSheepBabySad,
    sick: blueSheepBabySick
  },
  yellowSheepBaby: {
    happy: yellowSheepBabyHappy,
    neutral: yellowSheepBabyNeutral,
    sad: yellowSheepBabySad,
    sick: yellowSheepBabySick
  },
  brownSheepBaby: {
    happy: brownSheepBabyHappy,
    neutral: brownSheepBabyNeutral,
    sad: brownSheepBabySad,
    sick: brownSheepBabySick
  },
  pinkSheepBaby: {
    happy: pinkSheepBabyHappy,
    neutral: pinkSheepBabyNeutral,
    sad: pinkSheepBabySad,
    sick: pinkSheepBabySick
  },
  // Adult animations
  blueSheepAdult: {
    happy: blueSheepAdultHappy,
    neutral: blueSheepAdultNeutral,
    sad: blueSheepAdultSad,
    sick: blueSheepAdultSick
  },
  yellowSheepAdult: {
    happy: yellowSheepAdultHappy,
    neutral: yellowSheepAdultNeutral,
    sad: yellowSheepAdultSad,
    sick: yellowSheepAdultSick
  },
  brownSheepAdult: {
    happy: brownSheepAdultHappy,
    neutral: brownSheepAdultNeutral,
    sad: brownSheepAdultSad,
    sick: brownSheepAdultSick
  },
  pinkSheepAdult: {
    happy: pinkSheepAdultHappy,
    neutral: pinkSheepAdultNeutral,
    sad: pinkSheepAdultSad,
    sick: pinkSheepAdultSick
  }
};

interface AnimationProps {
    v: string;
    fr: number;
    ip: number;
    op: number;
    w: number;
    h: number;
    nm: string;
    ddd: number;
    assets: unknown[];
    layers: unknown[];
  }

const PetAnimation = () => {
  console.log('Animation data:', blueSheepAdultSick);
  const lottieRef = useRef<LottieRefCurrentProps>(null);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const pathname = usePathname();
  const { petType, isAdult, hunger, happiness, health } = useGame();

  // Determine emotional state based on stats
  const getEmotionalState = (
    hunger: number,
    happiness: number,
    health: number
  ): EmotionalState => {
    // Health check first (overrides other states)
    if (health < 50) return 'sick';
    
    // Happy check
    if (hunger >= 90 && happiness >= 90 && health >= 90) return 'happy';
    
    // Sad check
    if (hunger < 50 || happiness < 50) return 'sad';
    
    // Default to neutral
    return 'neutral';
  };

  useEffect(() => {
    if (!petType) return;

    // Convert petType to the correct age version
    const baseType = petType.replace('Baby', '').replace('Adult', '');
    const ageType = isAdult ? 'Adult' : 'Baby';
    const fullPetType = `${baseType}${ageType}`;
    
    // Get emotional state
    const emotionalState = getEmotionalState(hunger, happiness, health);
    
    // Get the appropriate animation
    const animationSet = ANIMATIONS[fullPetType];
    const animationData = animationSet?.[emotionalState] as AnimationProps | undefined;
    
    console.log('Animation Data:', {
      petType,
      isAdult,
      baseType,
      fullPetType,
      emotionalState,
      stats: { hunger, happiness, health },
      exists: !!animationData,
    });

    if (animationData) {
      const requiredProps = ['v', 'fr', 'ip', 'op', 'w', 'h', 'nm', 'ddd', 'assets', 'layers'];
      const missingProps = requiredProps.filter(prop => !(prop in animationData));
      
      if (missingProps.length > 0) {
        console.error('Animation file is missing required properties:', missingProps);
        setError(`Invalid animation format: missing ${missingProps.join(', ')}`);
      } else {
        setError(null);
      }
    } else {
      console.error('Animation file failed to load for:', fullPetType, emotionalState);
      setError(`No animation found for ${fullPetType} in ${emotionalState} state`);
    }
  }, [petType, isAdult, hunger, happiness, health]);

  // Don't render on login screen or if not authenticated
  if (pathname === '/login' || !user) {
    return null;
  }

  // Don't render on choose-pet screen
  if (pathname === '/choose-pet') {
    return null;
  }

  // If there's an error or no petType, show error state with details
  if (error || !petType) {
    return (
      <div className="pet-display">
        <div className="pet-sprite">🐑</div>
        {error && (
          <div style={{ color: 'red', marginTop: '10px' }}>
            Animation Error: {error}
          </div>
        )}
      </div>
    );
  }

  // Get current animation based on state
  const baseType = petType.replace('Baby', '').replace('Adult', '');
  const ageType = isAdult ? 'Adult' : 'Baby';
  const fullPetType = `${baseType}${ageType}`;
  const emotionalState = getEmotionalState(hunger, happiness, health);
  const animationData = ANIMATIONS[fullPetType]?.[emotionalState];

  const handleError = (e: unknown) => {
    console.error('Lottie animation error:', e);
    setError(`Lottie error: ${e instanceof Error ? e.message : 'Unknown error'}`);
  };

  return (
    <div className="pet-display">
      <Lottie
        lottieRef={lottieRef}
        animationData={animationData}
        loop={true}
        autoplay={true}
        onLoadedImages={() => {
          console.log('Animation loaded:', fullPetType, emotionalState);
        }}
        onError={handleError}
        style={{
          width: '500px',
          height: '400px',
          margin: 'auto',
          display: 'block',
        }}
      />
    </div>
  );
};

export default PetAnimation;