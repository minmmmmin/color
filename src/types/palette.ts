export type Scheme = {
  id: string;
  key: string;
  display_name: string;
  category: 'hue' | 'tone' | 'wheel';
  min_colors: number;
  max_colors: number;
};

export type PaletteColor = {
  hex: string;
  h: number | null;
  s: number | null;
  l: number | null;
  ratio: number | null;
};
