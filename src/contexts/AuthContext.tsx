'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth } from '@/lib/firebase';
import { 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut, 
  User, 
  AuthError 
} from 'firebase/auth';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  signInWithGoogle: () => Promise<boolean>;
  logOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      setUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
      setError(null);
      const result = await signInWithPopup(auth, provider);
      if (result.user) {
        return true;
      }
      return false;
    } catch (error) {
      if ((error as { code?: string }).code === 'auth/popup-closed-by-user') {
        return false;
      }
      throw error;
    }
  };

  const logOut = async () => {
    try {
      setError(null);
      await signOut(auth);
      console.log("Successfully signed out");
      setUser(null);
      router.push('/login');
    } catch (error) {
      console.error("Error signing out:", error);
      const authError = error as AuthError;
      setError(authError.message || 'An error occurred during sign out');
    }
  };

  const value = {
    user,
    loading,
    error,
    signInWithGoogle,
    logOut
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}