import React from "react";
import { supabase } from "../lib/supabase";

export function SignOutButton() {
  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <button onClick={handleSignOut} className="sidebar__footer-legal-link">
      Sign Out
    </button>
  );
}
