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
      className={`release-card__like-button group ${
        isLiked
          ? "text-[#F1977E] hover:text-[#E88468]"
          : "text-white hover:text-white/80"
      }`}
    >
      <HeartIcon
        liked={isLiked}
        className={`transition-all duration-200 ${
          isLiked
            ? "text-[#F1977E] group-hover:text-[#E88468]"
            : "text-white opacity-30 group-hover:opacity-100 group-hover:text-white group-hover:scale-110"
        } ${isAnimating ? "animate-heart-like" : ""}`}
        onAnimationEnd={() => setIsAnimating(false)}
      />
      <div className="flex justify-end">
        {likesCount}
      </div>
    </button>
  );
}
