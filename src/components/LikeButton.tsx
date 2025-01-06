import React from "react";
import { HeartIcon } from "./icons/HeartIcon";
import { useLikes } from '../hooks/useLikes';
import { useAuth } from '../hooks/useAuth';

interface LikeButtonProps {
  releaseId: string;
}

export function LikeButton({ releaseId }: LikeButtonProps) {
  const { isLiked, toggleLike } = useLikes(releaseId);
  const { user } = useAuth();

  if (!user) return null;

  return (
    <LikeButtonNew
      liked={isLiked}
      onLike={toggleLike}
    />
  );
}

interface LikeButtonNewProps {
  liked: boolean;
  onLike: () => void;
  disabled?: boolean;
  className?: string;
}

export function LikeButtonNew({ liked, onLike, disabled, className = "" }: LikeButtonNewProps) {
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onLike();
      }}
      disabled={disabled}
      className={`group flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed w-8 h-8 transition-all ${className}`}
    >
      <HeartIcon
        liked={liked}
        className={`text-white transition-opacity ${
          liked ? "opacity-100" : "opacity-30 group-hover:opacity-100"
        }`}
      />
    </button>
  );
}