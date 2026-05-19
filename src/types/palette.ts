// src/types/palette.ts

// SchemeCategory は src/lib/scheme/types.ts の定義を正とする。
// ここでは既存コードからのインポート互換のため re-export する。
export type { SchemeCategory } from '@/lib/scheme/types';
import type { SchemeCategory } from '@/lib/scheme/types';

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
  category: SchemeCategory;
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
 * 配色技法は scheme_id(schemes.id への FK)で保持し、表示やカテゴリは join した schemes 経由で取る。
 */
export type Palette = {
  id: string; // UUID
  created_at?: string;
  user_id: string; // UUID
  is_official: boolean;
  scheme_id: string; // UUID, foreign key to schemes.id
  title: string | null;
  description: string | null;
  // Joined data
  schemes?: {
    display_name: string;
    category: SchemeCategory;
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
