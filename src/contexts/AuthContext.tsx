import React, { createContext, useContext, useEffect, useState, useRef, useMemo, useTransition } from 'react';
import { User, AuthChangeEvent, AuthSubscription } from '@supabase/supabase-js';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useProfile } from '../hooks/useProfile';
import { cache } from '../lib/cache';

interface AuthState {
  user: User | null;
  email: string;
  loading: boolean;
  isAdmin: boolean;
  canManageReleases: boolean;
}

interface AuthContextType extends AuthState {
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

const initialState: AuthState = {
  user: null,
  email: '',
  loading: true,
  isAdmin: false,
  canManageReleases: false,
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>(initialState);
  const [isPending, startTransition] = useTransition();
  const navigate = useNavigate();
  const { profile, loading: profileLoading } = useProfile(state.user?.id);
  const stateRef = useRef(state);
  stateRef.current = state;

  // Batch state updates
  const updateState = (updates: Partial<AuthState>) => {
    startTransition(() => {
      setState(prev => {
        const next = { ...prev, ...updates };
        return Object.keys(updates).some(key => prev[key as keyof AuthState] !== next[key as keyof AuthState])
          ? next
          : prev;
      });
    });
  };

  // Initialize auth state
  useEffect(() => {
    let mounted = true;
    let authSubscription: AuthSubscription | null = null;
    const startTime = performance.now();

    async function initAuth() {
      try {
        const sessionData = await cache.get('auth:session', 
          () => supabase.auth.getSession(),
          { ttl: 60 * 1000 }
        );
        
        if (!mounted) return;
        
        const session = sessionData.data.session;
        if (session?.user) {
          updateState({
            user: session.user,
            email: session.user.email ?? '',
            loading: false
          });
        } else {
          updateState({ loading: false });
        }

        // Set up auth subscription
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
          if (!mounted) return;
          
          const startTime = performance.now();
          
          if (event === 'SIGNED_OUT') {
            cache.clear();
            updateState({
              user: null,
              email: '',
              isAdmin: false,
              canManageReleases: false
            });
            navigate('/');
          } else if (session?.user && stateRef.current.user?.id !== session.user.id) {
            updateState({
              user: session.user,
              email: session.user.email ?? '',
              loading: false
            });
          }

          if (process.env.NODE_ENV === 'development') {
            console.log(`Auth state change (${event}) took ${Math.round(performance.now() - startTime)}ms`);
          }
        });

        authSubscription = subscription;
      } catch (error) {
        console.error('Error initializing auth:', error);
        if (mounted) updateState({ loading: false });
      }
    }

    initAuth();

    return () => {
      mounted = false;
      if (authSubscription) {
        authSubscription.unsubscribe();
      }
    };
  }, [navigate]);

  // Update permissions when profile changes
  useEffect(() => {
    if (profileLoading) return;
    
    const isAdmin = profile?.role === 'admin';
    const canManageReleases = isAdmin || profile?.role === 'creator';

    if (state.isAdmin !== isAdmin || state.canManageReleases !== canManageReleases) {
      updateState({ isAdmin, canManageReleases });
    }
  }, [profile, profileLoading]);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  const value = useMemo(() => ({
    ...state,
    signIn,
    signOut
  }), [state]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
