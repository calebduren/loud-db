import React from 'react';
import { LogOut } from 'lucide-react';
import { supabase } from '../lib/supabase';

export function SignOutButton() {
  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <button 
      onClick={handleSignOut}
      className="btn btn-secondary"
    >
      <LogOut className="w-4 h-4 mr-2 inline-block" />
      Sign Out
    </button>
  );
}