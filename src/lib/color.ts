// src/lib/color.ts

/**
 * Checks if a string is a valid 6-digit hex color code (e.g., #RRGGBB).
 * @param hex The string to validate.
 * @returns True if the string is a valid hex color, otherwise false.
 */
export const isValidHex = (hex: string): boolean => {
  return /^#[0-9a-fA-F]{6}$/.test(hex);
};

/**
 * Converts a hex color string to an HSL object.
 * Assumes hex is a valid 6-digit format starting with #.
 * @param hex The hex color string (e.g., "#RRGGBB").
 * @returns An object { h, s, l } or null if the hex is invalid.
 */
export const hexToHsl = (hex: string): { h: number; s: number; l: number } | null => {
  if (!isValidHex(hex)) {
    return null;
  }

  // Remove the hash
  const sanitizedHex = hex.slice(1);

  // Convert hex to RGB
  let r = parseInt(sanitizedHex.substring(0, 2), 16);
  let g = parseInt(sanitizedHex.substring(2, 4), 16);
  let b = parseInt(sanitizedHex.substring(4, 6), 16);

  // Normalize RGB to 0-1
  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);

  let h = 0, s = 0, l = (max + min) / 2;

  if (max === min) {
    // achromatic
    h = s = 0;
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
};
