// src/types/palette.ts

/**
 * Represents a color in the palette creation form state.
 */
export type PaletteColor = {
  hex: string;
  h: number | null;
  s: number | null;
  l: number | null;
  ratio: number | null;
  tone_id: string | null;
};

/**
 * Represents a color scheme from the 'schemes' database table.
 */
export type Scheme = {
  id: string; // UUID
  key: string;
  display_name: string;
  category: 'hue' | 'tone' | 'wheel';
  min_colors: number;
  max_colors: number;
};

/**
 * Represents a PCCS tone from the 'tones' database table.
 */
export type Tone = {
    id: string; // UUID
    key: string;
    code: string;
    display_name: string;
    category: string;
    s_min: number;
    s_max: number;
    l_min: number;
    l_max: number;
    sort_order: number;
};

/**
 * Represents a full palette record from the 'palettes' table, potentially with joined data.
 */
export type Palette = {
  id: string; // UUID
  created_at?: string;
  user_id: string; // UUID
  is_official: boolean;
  scheme: string; // The key of the scheme, e.g. 'triad'
  title: string | null;
  description: string | null;
  // Joined data
  schemes?: {
    display_name: string;
  } | null;
  palette_colors?: PaletteColorDB[];
};

/**
 * Represents a color record in the 'palette_colors' database table.
 */
export type PaletteColorDB = {
  id?: number; // Optional as it's auto-incremented on DB
  palette_id: string; // UUID, foreign key to palettes.id
  role: string;
  hex: string;
  h: number;
  s: number;
  l: number;
  ratio: number | null;
  tone_id: string | null;
};

