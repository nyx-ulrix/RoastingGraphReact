/**
 * DTR (Development Time Ratio) Calculation Utilities
 * 
 * Provides functions for calculating and visualizing the Development Time Ratio,
 * which measures the percentage of roast time after first crack.
 */

/**
 * Calculate Development Time Ratio
 * DTR(%) = (DevelopmentTime / TotalRoastTime) × 100
 * 
 * @param firstCrackTime - Time in seconds when first crack occurred (null if not yet)
 * @param totalTime - Total roast time in seconds
 * @returns DTR as a percentage (0-100)
 */
export const calculateDTR = (firstCrackTime: number | null, totalTime: number): number => {
  if (firstCrackTime === null || totalTime === 0) return 0;
  const developmentTime = totalTime - firstCrackTime;
  return (developmentTime / totalTime) * 100;
};

/**
 * Get color for DTR progress bar based on percentage
 * Color progression: #DAA06D (0%) → #7B3F00 (30%) → #000000 (100%)
 * 
 * @param dtr - Development Time Ratio as a percentage
 * @returns Hex color string
 */
export const getDTRColor = (dtr: number): string => {
  if (dtr === 0) return '#DAA06D'; // Light tan/brown
  if (dtr <= 30) {
    // Light tan to medium brown (0-30%)
    const ratio = dtr / 30;
    return interpolateColor('#DAA06D', '#7B3F00', ratio);
  } else {
    // Medium brown to black (30-100%)
    const ratio = (dtr - 30) / 70;
    return interpolateColor('#7B3F00', '#000000', ratio);
  }
};

/**
 * Interpolate between two hex colors
 * 
 * @param color1 - Starting hex color (e.g., '#DAA06D')
 * @param color2 - Ending hex color (e.g., '#7B3F00')
 * @param ratio - Interpolation ratio (0-1)
 * @returns Interpolated hex color string
 */
export const interpolateColor = (color1: string, color2: string, ratio: number): string => {
  const hex = (x: string) => parseInt(x, 16);
  const r1 = hex(color1.substring(1, 3));
  const g1 = hex(color1.substring(3, 5));
  const b1 = hex(color1.substring(5, 7));
  const r2 = hex(color2.substring(1, 3));
  const g2 = hex(color2.substring(3, 5));
  const b2 = hex(color2.substring(5, 7));
  
  const r = Math.round(r1 + (r2 - r1) * ratio);
  const g = Math.round(g1 + (g2 - g1) * ratio);
  const b = Math.round(b1 + (b2 - b1) * ratio);
  
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
};


