const COLORS = [
  '#FF6B6B', // Bright Red
  '#4ECDC4', // Bright Teal
  '#45B7D1', // Bright Blue
  '#FFD93D', // Bright Yellow
  '#6C5CE7', // Bright Purple
  '#51CF66', // Bright Green
  '#FF922B', // Bright Orange
  '#FF85C0', // Bright Pink
];

const PIXEL_SIZE = 2; // Smaller pixels (2px)
const GRID_SIZE = 20; // More pixels (20x20 grid)
const TOTAL_SIZE = GRID_SIZE * PIXEL_SIZE; // 40x40 pixels total

/**
 * Simple hash function that returns a number between 0 and 1
 */
function hash(str: string, index: number): number {
  let h = 0;
  const input = str + index;
  for (let i = 0; i < input.length; i++) {
    h = ((h << 5) - h) + input.charCodeAt(i);
    h = h >>> 0; // Convert to unsigned 32-bit integer
  }
  return (h % 1000) / 1000;
}

/**
 * Generates a pixel art avatar as an SVG data URL
 */
export function generatePixelAvatarDataURL(seed?: string | null): string {
  const id = seed || 'default';
  
  // Start building SVG with crisp edges rendering
  let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${TOTAL_SIZE}" height="${TOTAL_SIZE}" viewBox="0 0 ${TOTAL_SIZE} ${TOTAL_SIZE}" shape-rendering="crispEdges">`;
  
  // Background - using a bright color from the palette
  const bgColorIndex = Math.floor(hash(id, 0) * COLORS.length);
  svg += `<rect width="${TOTAL_SIZE}" height="${TOTAL_SIZE}" fill="${COLORS[bgColorIndex]}"/>`;
  
  // Generate pattern
  const halfWidth = Math.floor(GRID_SIZE / 2);
  
  // Create pattern arrays for pixels and colors
  const pattern: boolean[][] = Array(GRID_SIZE).fill(false)
    .map(() => Array(halfWidth).fill(false));
  const colors: (number | null)[][] = Array(GRID_SIZE).fill(null)
    .map(() => Array(halfWidth).fill(null));
  
  // Generate base pattern with varying density
  for (let y = 0; y < GRID_SIZE; y++) {
    for (let x = 0; x < halfWidth; x++) {
      // Calculate center-weighted density
      const centerX = Math.abs(x - halfWidth/2) / halfWidth;
      const centerY = Math.abs(y - GRID_SIZE/2) / GRID_SIZE;
      const distanceFromCenter = Math.sqrt(centerX * centerX + centerY * centerY);
      
      // Lower threshold for more pixels, vary by distance from center
      const threshold = 0.2 + (distanceFromCenter * 0.3);
      pattern[y][x] = hash(id, y * GRID_SIZE + x) > threshold;
      
      if (pattern[y][x]) {
        // Use multiple hashes for more varied color selection
        const h1 = hash(id, y * 19 + x * 31);
        const h2 = hash(id, y * 23 + x * 37);
        const h3 = hash(id, y * 29 + x * 41);
        
        // Add color variation based on position
        const positionInfluence = (x + y) / (GRID_SIZE + halfWidth);
        const colorValue = (h1 + h2 + h3) / 3 + (positionInfluence * 0.2);
        
        // Ensure we don't pick the same color as the background
        let colorIndex = Math.floor((colorValue % 1) * (COLORS.length - 1));
        if (colorIndex >= bgColorIndex) colorIndex++; // Skip background color
        colors[y][x] = colorIndex;
      }
    }
  }
  
  // Enhance pattern with additional pixels
  for (let y = 1; y < GRID_SIZE - 1; y++) {
    for (let x = 1; x < halfWidth - 1; x++) {
      // Add some random single pixels for texture
      if (!pattern[y][x] && hash(id, y * 43 + x * 47) > 0.8) {
        pattern[y][x] = true;
        // Ensure we don't pick the same color as the background
        let colorIndex = Math.floor(hash(id, y * 53 + x * 59) * (COLORS.length - 1));
        if (colorIndex >= bgColorIndex) colorIndex++;
        colors[y][x] = colorIndex;
      }
    }
  }
  
  // Draw the pattern
  for (let y = 0; y < GRID_SIZE; y++) {
    for (let x = 0; x < halfWidth; x++) {
      if (pattern[y][x]) {
        const color = COLORS[colors[y][x]!];
        
        // Left side
        const px = x * PIXEL_SIZE;
        const py = y * PIXEL_SIZE;
        svg += `<rect x="${px}" y="${py}" width="${PIXEL_SIZE}" height="${PIXEL_SIZE}" fill="${color}"/>`;
        
        // Right side (mirror)
        const mirrorX = (GRID_SIZE - 1 - x) * PIXEL_SIZE;
        svg += `<rect x="${mirrorX}" y="${py}" width="${PIXEL_SIZE}" height="${PIXEL_SIZE}" fill="${color}"/>`;
      }
    }
  }
  
  svg += '</svg>';
  
  // Convert to data URL with minimal encoding
  const encoded = svg
    .replace(/#/g, '%23')
    .replace(/</g, '%3C')
    .replace(/>/g, '%3E')
    .replace(/"/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
    
  return `data:image/svg+xml,${encoded}`;
}
