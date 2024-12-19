'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { AnimatedBackground } from '@/components/backgrounds/AnimatedBackground';

export default function LoginPage() {
  const router = useRouter();
  const { signInWithGoogle } = useAuth();

  const handleSignIn = async () => {
    try {
      const success = await signInWithGoogle();
      if (success) {
        router.push('/menu');
      }
    } catch (error) {
      console.error('Error signing in:', error);
    }
  };

  return (
    <div className="min-h-screen w-full flex justify-center items-center fixed inset-0 overflow-hidden">
      <AnimatedBackground />
      
      <div className="bg-white/90 backdrop-blur-md p-10 rounded-3xl shadow-xl max-w-md w-[90%] relative z-10 transition-all duration-300 text-center">
        <h1 className="text-4xl font-bold text-indigo-900 mb-4">
          Pocket Sheep
        </h1>
        
        <p className="text-lg text-gray-600 mb-8 leading-relaxed">
          Care for your own virtual pet!
        </p>
        
        <button
          onClick={handleSignIn}
          className="flex items-center justify-center gap-3 w-full max-w-xs mx-auto bg-white hover:bg-gray-50 text-gray-700 px-6 py-3 rounded-xl border border-gray-200 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] group shadow-md"
        >
          <svg viewBox="0 0 24 24" className="w-6 h-6" aria-hidden="true">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
          <span className="font-medium">Continue with Google</span>
        </button>
      </div>
    </div>
  );
}