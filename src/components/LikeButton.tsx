import React, { useState, useEffect } from "react";
import { HeartIcon } from "./icons/HeartIcon";
import { useLikes } from "../hooks/useLikes";
import { useAuth } from "../contexts/AuthContext";

interface LikeButtonProps {
  releaseId: string;
}

export function LikeButton({ releaseId }: LikeButtonProps) {
  const { isLiked, likesCount, toggleLike } = useLikes(releaseId);
  const { user } = useAuth();
  const [isAnimating, setIsAnimating] = useState(false);
  const [isSliding, setIsSliding] = useState(false);

  if (!user) return null;

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isSliding) return;
    setIsAnimating(true);
    setIsSliding(true);
    toggleLike();
    // Reset sliding state after animation completes
    setTimeout(() => setIsSliding(false), 300);
  };

  return (
    <button
      onClick={handleClick}
      className={`release__like-button group ${
        isLiked
          ? "release__like-button--liked"
          : "release__like-button--not-liked"
      }`}
    >
      <HeartIcon
        liked={isLiked}
        className={`release__like-button__icon ${
          isLiked
            ? "release__like-button__icon--liked group-hover:scale-90"
            : "release__like-button__icon--not-liked group-hover:opacity-100 group-hover:text-white group-hover:scale-110"
        } ${isAnimating ? "animate-heart-like" : ""}`}
        onAnimationEnd={() => setIsAnimating(false)}
      />
      <div className="flex justify-end">{likesCount}</div>
    </button>
  );
}
