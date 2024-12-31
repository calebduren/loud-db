import React from 'react';
import { User } from 'lucide-react';
import { Profile } from '../../../types/database';
import { formatDate } from '../../../lib/utils/dateUtils';

interface ProfileHeaderProps {
  profile: Profile;
}

export function ProfileHeader({ profile }: ProfileHeaderProps) {
  return (
    <div className="flex items-center gap-6 mb-8">
      <div className="relative w-24 h-24 rounded-full overflow-hidden bg-white/10">
        {profile.avatar_url ? (
          <img 
            src={profile.avatar_url} 
            alt={profile.username}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <User className="w-12 h-12 text-white/40" />
          </div>
        )}
      </div>
      
      <div>
        <h1 className="text-3xl font-bold mb-1">{profile.username}</h1>
        <p className="text-white/60">
          Member since {formatDate(profile.created_at)}
        </p>
      </div>
    </div>
  );
}