import React, { useState, useContext } from "react";
import { Link } from "react-router-dom";
import { User, Settings, LogOut } from "lucide-react";
import { AuthContext } from "../../contexts/AuthContext";
import { useProfile } from "../../hooks/useProfile";
import { supabase } from "../../lib/supabase";
import { PixelAvatar } from "./profile/PixelAvatar";

export function UserMenu() {
  const { user } = useContext(AuthContext);
  const { profile } = useProfile(user?.id);
  const [isOpen, setIsOpen] = useState(false);

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      setIsOpen(false);
    } catch (error) {
      console.error("[UserMenu] Error signing out:", error);
    }
  };

  if (!profile) return null;

  return (
    <div className="relative">
      {/* Avatar Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 hover:opacity-80 transition-opacity"
      >
        <div className="w-8 h-8 rounded-full overflow-hidden bg-white/10">
          {profile.avatar_url ? (
            <img
              src={profile.avatar_url}
              alt={profile.username}
              className="w-full h-full object-cover"
            />
          ) : (
            <PixelAvatar seed={profile.username} size={32} />
          )}
        </div>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-56 bg-[var(--color-gray-800)] rounded-lg shadow-lg overflow-hidden z-20">
            <div className="px-4 py-3 border-b border-white/10">
              <p className="font-medium">{profile.username}</p>
              <p className="text-sm text-white/60">{user?.email}</p>
            </div>

            <div className="p-2">
              <Link
                to={`/u/${profile.username}`}
                className="flex items-center gap-2 w-full p-2 text-sm text-white/80 hover:bg-white/10 rounded-md"
                onClick={() => setIsOpen(false)}
              >
                <User className="w-4 h-4" />
                View Profile
              </Link>

              <Link
                to="/profile/preferences"
                className="flex items-center gap-2 w-full p-2 text-sm text-white/80 hover:bg-white/10 rounded-md"
                onClick={() => setIsOpen(false)}
              >
                <Settings className="w-4 h-4" />
                Settings
              </Link>

              <button
                onClick={handleSignOut}
                className="flex items-center gap-2 w-full p-2 text-sm text-red-500 hover:bg-white/10 rounded-md"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
