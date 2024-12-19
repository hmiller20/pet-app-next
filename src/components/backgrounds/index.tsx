'use client';

import { useMemo } from 'react';

export function Cloud({ className = "", index = 0 }: { className?: string; index?: number }) {
  const cloudStyle = useMemo(() => {
    const sizeMultiplier = 0.9 + Math.random() * 0.2;
    const baseWidth = 'min(120px, 15vw)';
    const baseHeight = 'min(60px, 7.5vw)';
    
    const verticalPositions = [4, 8, 12, 20, 28].map(v => `${v}vh`);
    const randomOffset = Math.random() * 4;
    const verticalPosition = `calc(${verticalPositions[index]} + ${randomOffset}vh)`;
    
    return {
      width: baseWidth,
      height: baseHeight,
      top: verticalPosition,
    };
  }, [index]);

  const bumpStyles = useMemo(() => {
    return [...Array(3)].map((_, i) => ({
      width: `${30 + Math.random() * 40}%`,
      height: `${80 + Math.random() * 40}%`,
      left: `${10 + (i * 25) + (Math.random() * 10)}%`,
      top: `${-(80 + Math.random() * 40)/2}%`,
    }));
  }, []);

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

export function CloudBackground() {
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

export function GrassBackground() {
  return (
    <div className="absolute bottom-0 left-0 right-0">
      {/* Main grass layer */}
      <div className="h-[min(96px,12vh)] bg-green-500 relative">
        {/* Dotted texture overlay */}
        <div className="absolute inset-0 opacity-10">
          {[...Array(8)].map((_, i) => (
            <div 
              key={i}
              className="h-[min(12px,1.5vh)] flex justify-around"
              style={{
                transform: `translateX(${i % 2 ? 'min(10px,1.25vw)' : '0'})`
              }}
            >
              {[...Array(20)].map((_, j) => (
                <div 
                  key={j}
                  className="w-[min(4px,0.5vw)] h-[min(4px,0.5vw)] bg-black rounded-full"
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