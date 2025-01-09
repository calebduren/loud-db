import React, { useMemo } from "react";

interface PixelAvatarProps {
  seed: string;
  size?: number;
  className?: string;
}

export function PixelAvatar({
  seed,
  size = 32,
  className = "",
}: PixelAvatarProps) {
  const svgSize = 32;
  const rectWidth = 1;
  const rectHeight = 16;
  const skewAngle = 0;
  const numRects = 320;
  const numColors = 64;
  const overflow = 4;

  // Generate deterministic rectangles based on seed
  const rects = useMemo(() => {
    // Create multiple hash values from seed for more randomness
    const hashValues = Array.from(seed).map((char, i) => {
      return Array.from(seed.slice(i)).reduce((acc, c) => {
        return c.charCodeAt(0) + ((acc << 5) - acc);
      }, char.charCodeAt(0));
    });

    // Pre-generate a smaller set of colors
    const baseColors = Array.from({ length: numColors }, (_, i) => {
      const value1 = Math.abs(
        (hashValues[(i * 13) % hashValues.length] + i) * 15485863
      );
      const value2 = Math.abs(
        (hashValues[(i * 17) % hashValues.length] + i) * 32452843
      );
      const value3 = Math.abs(
        (hashValues[(i * 19) % hashValues.length] + i) * 49979687
      );

      const rnd1 = (value1 % 233280) / 233280;
      const rnd2 = (value2 % 233280) / 233280;
      const rnd3 = (value3 % 233280) / 233280;

      const hue = Math.floor(rnd1 * 360);
      const saturation = 80 + Math.floor(rnd2 * 20); // High saturation (80-100%)
      const lightness = 45 + Math.floor(rnd3 * 25); // Brighter (45-70%)
      return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
    });

    // Use first color as background
    const backgroundColor = baseColors[0];

    // Generate positions and assign colors randomly
    return {
      backgroundColor,
      rectangles: Array.from({ length: numRects }, (_, i) => {
        const value1 = Math.abs(
          (hashValues[i % hashValues.length] + i) * 15485863
        );
        const value2 = Math.abs(
          (hashValues[(i * 3) % hashValues.length] + i) * 32452843
        );
        const value3 = Math.abs(
          (hashValues[(i * 7) % hashValues.length] + i) * 49979687
        );

        const rnd1 = (value1 % 233280) / 233280;
        const rnd2 = (value2 % 233280) / 233280;
        const rnd3 = (value3 % 233280) / 233280;

        const angle = rnd1 * Math.PI * 2;
        const radius = Math.sqrt(rnd2) * (svgSize / 2 + overflow);
        const x = Math.floor(svgSize / 2 + radius * Math.cos(angle));
        const y = Math.floor(svgSize / 6 + radius * Math.sin(angle));

        // Pick a random color from our base colors
        const colorIndex = Math.floor(rnd3 * numColors);

        return {
          x,
          y,
          color: baseColors[colorIndex],
        };
      }),
    };
  }, [seed]);

  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        overflow: "hidden",
      }}
      className={className}
    >
      <svg
        viewBox="0 0 32 32"
        width={size}
        height={size}
        style={{ background: rects.backgroundColor }}
      >
        {rects.rectangles.map((rect, i) => (
          <g key={i} transform={`skewX(${skewAngle})`}>
            <rect
              x={rect.x}
              y={rect.y}
              width={rectWidth}
              height={rectHeight}
              fill={rect.color}
            />
          </g>
        ))}
      </svg>
    </div>
  );
}
