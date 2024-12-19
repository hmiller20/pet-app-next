   'use client';

   import { useState, useCallback, useEffect } from 'react';

   export function useSound(soundPath: string) {
     const [audio, setAudio] = useState<HTMLAudioElement | null>(null);
     const [canPlay, setCanPlay] = useState(false);
     const [error, setError] = useState<Error | null>(null);

     useEffect(() => {
       const audioElement = new Audio(soundPath);
       
       // Add error handling for loading the audio file
       audioElement.onerror = (e) => {
         console.error(`Error loading audio file ${soundPath}:`, e);
         setError(new Error(`Failed to load sound file: ${soundPath}`));
       };

       setAudio(audioElement);

       return () => {
         audioElement.pause();
         audioElement.src = '';
       };
     }, [soundPath]);

     const enableSound = useCallback(() => {
       setCanPlay(true);
     }, []);

     const play = useCallback(() => {
       if (!audio || error) return;
       
       if (canPlay) {
         audio.currentTime = 0;
         audio.play().catch(err => {
           console.error('Error playing sound:', err);
           setError(err);
         });
       }
     }, [audio, canPlay, error]);

     return { play, enableSound, error };
   }