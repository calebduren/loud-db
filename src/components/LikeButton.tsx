import React from 'react';
import { Heart } from 'lucide-react';
import { useLikes } from '../hooks/useLikes';
import { useAuth } from '../hooks/useAuth';

interface LikeButtonProps {
  releaseId: string;
}

export function LikeButton({ releaseId }: LikeButtonProps) {
  const { isLiked, likesCount, toggleLike } = useLikes(releaseId);
  const { user } = useAuth();

  if (!user) return null;

  return (
    <button
      onClick={toggleLike}
      className="flex items-center gap-1 text-sm"
    >
      <Heart
        className={`w-4 h-4 ${
          isLiked 
            ? 'fill-red-500 text-red-500' 
            : 'text-gray-500 hover:text-red-500'
        }`}
      />
      <span className="text-gray-600">{likesCount}</span>
    </button>
  );
}