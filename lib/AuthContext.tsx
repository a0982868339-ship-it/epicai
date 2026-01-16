
'use client';

import React, { useState, useEffect, createContext, useContext } from 'react';
import { UserProfile } from '../types';
import { supabase } from './supabaseClient';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  signIn: () => void; // Legacy, usually handled via auth page
  signOut: () => void;
  refreshProfile: () => void;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchProfile = async (userId: string, email: string) => {
    try {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();
        
        if (data) {
            setUser({ ...data, email }); // Ensure email is present
        } else {
            // Profile doesn't exist yet (first login webhook might not have fired or manual creation needed)
            // Create a temporary default profile object locally
            setUser({
                id: userId,
                email: email,
                subscription_plan: 'free',
                monthly_generations_used: 0,
                total_credits: 5, // Free trial credits
                created_at: new Date().toISOString()
            });
        }
    } catch (error) {
        console.error('Error fetching profile:', error);
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => {
    // Check active session
    const checkSession = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
            await fetchProfile(session.user.id, session.user.email!);
        } else {
            setLoading(false);
        }
    };

    checkSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
            await fetchProfile(session.user.id, session.user.email!);
        } else if (event === 'SIGNED_OUT') {
            setUser(null);
            router.push('/');
        }
    });

    return () => {
        subscription.unsubscribe();
    };
  }, [router]);

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  const refreshProfile = async () => {
    if (user?.id) {
        // Simple re-fetch
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
             await fetchProfile(session.user.id, session.user.email!);
        }
    }
  }

  // Legacy placeholder
  const signIn = () => router.push('/auth');

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
};
