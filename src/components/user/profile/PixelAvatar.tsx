import React, { useMemo } from "react";

interface PixelAvatarProps {
  seed: string;
  size?: number;
  className?: string;
}

export function PixelAvatar({
  seed,
  size = 48,
  className = "",
}: PixelAvatarProps) {
  const svgSize = 40;
  const rectWidth = 3;
  const rectHeight = 20;
  const skewAngle = -12; // Degrees to slant the rectangles
  const numRects = 64;
  const numColors = 100;
  const overflow = 0;

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
      const saturation = 30 + Math.floor(rnd2 * 40); // Reduced saturation range (30-70%)
      const lightness = 35 + Math.floor(rnd3 * 25); // Narrower lightness range (35-60%)
      return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
    });

    // Generate positions and assign colors randomly
    return Array.from({ length: numRects }, (_, i) => {
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
      const y = Math.floor(svgSize / 2 + radius * Math.sin(angle));

      // Pick a random color from our base colors
      const colorIndex = Math.floor(rnd3 * numColors);

      return {
        x,
        y,
        color: baseColors[colorIndex],
      };
    });
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
        viewBox="0 0 40 40"
        width={size}
        height={size}
        style={{ background: "#2E2E2E" }}
      >
        {rects.map((rect, i) => (
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
