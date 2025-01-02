import React, { useMemo } from 'react';
import { generatePixelAvatarDataURL } from '../../../lib/utils/pixelAvatar';

interface PixelAvatarProps {
  seed: string;
  size?: number;
  className?: string;
}

export function PixelAvatar({ seed, size = 48, className = '' }: PixelAvatarProps) {
  // Memoize the data URL since generation is deterministic
  const dataUrl = useMemo(() => generatePixelAvatarDataURL(seed), [seed]);
  
  return (
    <img
      src={dataUrl}
      alt="Pixel Avatar"
      width={size}
      height={size}
      className={`rounded-full ${className}`}
    />
  );
}
