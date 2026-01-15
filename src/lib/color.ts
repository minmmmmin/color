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

  const l = (max + min) / 2;

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

/**
 * Converts HSL color values to a hex color string.
 * @param h Hue (0-360)
 * @param s Saturation (0-100)
 * @param l Lightness (0-100)
 * @returns A 6-digit hex color string (e.g., "#RRGGBB").
 */
export const hslToHex = (h: number, s: number, l: number): string => {
  s /= 100;
  l /= 100;

  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  let r = 0, g = 0, b = 0;

  if (0 <= h && h < 60) {
    r = c; g = x; b = 0;
  } else if (60 <= h && h < 120) {
    r = x; g = c; b = 0;
  } else if (120 <= h && h < 180) {
    r = 0; g = c; b = x;
  } else if (180 <= h && h < 240) {
    r = 0; g = x; b = c;
  } else if (240 <= h && h < 300) {
    r = x; g = 0; b = c;
  } else if (300 <= h && h < 360) {
    r = c; g = 0; b = x;
  }

  const toHex = (n: number) => {
    const hex = Math.round((n + m) * 255).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
};
