// src/types/palette.ts

/**
 * Represents a color scheme from the database.
 */
export type Scheme = {
  id: number;
  key: string;
  display_name: string;
  category: 'hue' | 'tone' | 'wheel';
  min_colors: number;
  max_colors: number;
};

/**
 * Represents a single color in the palette creation form.
 */
export type PaletteColor = {
  hex: string;
  h: number | null;
  s: number | null;
  l: number | null;
  ratio: number | null;
};
