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
  signUpEmail?: { email: string } | null;
}

interface AuthContextType extends AuthState {
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, options?: { data: { username: string } }) => Promise<{ user: User | null; error: Error | null }>;
  signOut: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

const initialState: AuthState = {
  user: null,
  email: '',
  loading: true,
  isAdmin: false,
  canManageReleases: false,
  signUpEmail: null,
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
        console.log('[AuthContext] Initializing auth state...');
        const sessionData = await cache.get('auth:session', 
          () => supabase.auth.getSession(),
          { ttl: 60 * 1000 }
        );
        
        if (!mounted) return;
        
        const session = sessionData.data.session;
        console.log('[AuthContext] Auth session:', {
          hasSession: !!session,
          userId: session?.user?.id,
          email: session?.user?.email,
          role: session?.user?.role,
          aud: session?.user?.aud,
          exp: session?.expires_at ? new Date(session.expires_at * 1000).toISOString() : null
        });

        if (session?.user) {
          updateState({
            user: session.user,
            email: session.user.email ?? '',
            loading: false
          });
          console.log('[AuthContext] Auth state updated with user');
        } else {
          updateState({ loading: false });
          console.log('[AuthContext] Auth state updated without user');
        }

        // Set up auth subscription
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
          if (!mounted) return;
          
          const startTime = performance.now();
          console.log('[AuthContext] Auth state change:', { event, userId: session?.user?.id });
          
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
            console.log(`[AuthContext] Auth state change (${event}) took ${Math.round(performance.now() - startTime)}ms`);
          }
        });

        authSubscription = subscription;
      } catch (error) {
        console.error('[AuthContext] Error initializing auth:', error);
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

  const signUp = async (email: string, password: string, options?: { data: { username: string } }) => {
    const { user, error } = await supabase.auth.signUp({ email, password }, options);
    return { user, error };
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  const value = useMemo(() => ({
    ...state,
    signIn,
    signUp,
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
