import React from "react";
import { supabase } from "../lib/supabase";

interface SignOutButtonProps {
  className?: string;
}

export function SignOutButton({ className }: SignOutButtonProps) {
  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <button onClick={handleSignOut} className={className}>
      Sign Out
    </button>
  );
}
