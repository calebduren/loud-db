import React, { createContext, useContext, useEffect, useState, useRef, useMemo } from 'react';
import { User } from '@supabase/supabase-js';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useProfile } from '../hooks/useProfile';

interface AuthContextType {
  user: User | null;
  email: string;
  loading: boolean;
  isAdmin: boolean;
  canManageReleases: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [email, setEmail] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { profile, loading: profileLoading } = useProfile(user?.id);

  // Cache previous permissions
  const prevPermissionsRef = useRef({
    canManageReleases: false,
    isAdmin: false
  });

  // Update permissions cache when profile changes
  useEffect(() => {
    if (!profileLoading && profile) {
      prevPermissionsRef.current = {
        canManageReleases: profile.role === 'admin' || profile.role === 'creator',
        isAdmin: profile.role === 'admin'
      };
    }
  }, [profile, profileLoading]);

  // Use cached permissions if still loading
  const canManageReleases = profileLoading 
    ? prevPermissionsRef.current.canManageReleases 
    : (profile?.role === 'admin' || profile?.role === 'creator');
    
  const isAdmin = profileLoading 
    ? prevPermissionsRef.current.isAdmin 
    : profile?.role === 'admin';

  useEffect(() => {
    let mounted = true;

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return;
      setUser(session?.user ?? null);
      setEmail(session?.user?.email ?? '');
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;
      
      if (event === 'SIGNED_OUT') {
        setUser(null);
        setEmail('');
        navigate('/');
      } else if (session?.user) {
        setUser(session.user);
        setEmail(session.user.email ?? '');
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [navigate]);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  const value = React.useMemo(() => ({
    user,
    email,
    loading: loading || profileLoading,
    isAdmin,
    canManageReleases,
    signIn,
    signOut,
  }), [user, email, loading, profileLoading, isAdmin, canManageReleases]);

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
