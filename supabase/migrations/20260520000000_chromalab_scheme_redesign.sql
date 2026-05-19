-- Chromalab 配色技法の再設計マイグレーション
--
-- 変更点:
--   1. scheme_type enum を新カテゴリ集合で置き換え
--   2. palettes.scheme / schemes.category を新 enum 型に移行(値もマップ)
--   3. schemes テーブルを新27技法で再構築
--
-- 旧カテゴリ → 新カテゴリ対応:
--   hue_based  → hue_diff
--   tone_based → tone_diff
--   wheel_2    → wheel_division
--   wheel_3    → wheel_division
--   wheel_4    → wheel_division
--   wheel_5    → wheel_division
--   wheel_6    → wheel_division

begin;

----------------------------------------------------------------
-- 1) 新しい enum 型を作成
----------------------------------------------------------------
create type scheme_type_new as enum (
  'hue_diff',
  'tone_diff',
  'dominant',
  'tone_combo',
  'nuance',
  'harmony',
  'n_colors',
  'wheel_division',
  'adjustment'
);

----------------------------------------------------------------
-- 2) palettes.scheme を新 enum 型に変換(旧値を新値にマップ)
----------------------------------------------------------------
alter table palettes
  alter column scheme type scheme_type_new
  using (
    case scheme::text
      when 'hue_based'  then 'hue_diff'
      when 'tone_based' then 'tone_diff'
      when 'wheel_2'    then 'wheel_division'
      when 'wheel_3'    then 'wheel_division'
      when 'wheel_4'    then 'wheel_division'
      when 'wheel_5'    then 'wheel_division'
      when 'wheel_6'    then 'wheel_division'
      else scheme::text
    end::scheme_type_new
  );

----------------------------------------------------------------
-- 3) schemes.category も同様に変換
----------------------------------------------------------------
alter table schemes
  alter column category type scheme_type_new
  using (
    case category::text
      when 'hue_based'  then 'hue_diff'
      when 'tone_based' then 'tone_diff'
      when 'wheel_2'    then 'wheel_division'
      when 'wheel_3'    then 'wheel_division'
      when 'wheel_4'    then 'wheel_division'
      when 'wheel_5'    then 'wheel_division'
      when 'wheel_6'    then 'wheel_division'
      else category::text
    end::scheme_type_new
  );

----------------------------------------------------------------
-- 4) 旧 enum を破棄し、新 enum を旧名にリネーム
----------------------------------------------------------------
drop type scheme_type;
alter type scheme_type_new rename to scheme_type;

----------------------------------------------------------------
-- 5) schemes テーブルを再構築
----------------------------------------------------------------
truncate table schemes restart identity cascade;

insert into schemes (key, display_name, category, min_colors, max_colors) values
  -- hue_diff
  ('same_hue',              '同一色相配色',            'hue_diff', 2, 6),
  ('adjacent_hue',          '隣接色相配色',            'hue_diff', 2, 4),
  ('similar_hue',           '類似色相配色',            'hue_diff', 2, 4),
  ('medium_difference_hue', '中差色相配色',            'hue_diff', 2, 4),
  ('contrasting_hue',       '対照色相配色',            'hue_diff', 2, 4),
  ('complementary_hue',     '補色色相配色',            'hue_diff', 2, 4),

  -- tone_diff
  ('same_tone',             '同一トーン配色',          'tone_diff', 2, 6),
  ('similar_tone',          '類似トーン配色',          'tone_diff', 2, 6),
  ('contrasting_tone',      '対照トーン配色',          'tone_diff', 2, 6),

  -- dominant
  ('dominant_color',        'ドミナントカラー配色',    'dominant', 3, 6),
  ('dominant_tone',         'ドミナントトーン配色',    'dominant', 3, 6),

  -- tone_combo
  ('tone_on_tone',          'トーンオントーン配色',    'tone_combo', 2, 4),
  ('tone_in_tone',          'トーンイントーン配色',    'tone_combo', 2, 6),
  ('tonal',                 'トーナル配色',            'tone_combo', 2, 6),

  -- nuance
  ('camaieu',               'カマイユ配色',            'nuance', 2, 3),
  ('faux_camaieu',          'フォカマイユ配色',        'nuance', 2, 3),

  -- harmony
  ('natural_harmony',       'ナチュラルハーモニー',    'harmony', 2, 4),
  ('complex_harmony',       'コンプレックスハーモニー','harmony', 2, 4),

  -- n_colors
  ('bicolor',               'ビコロール配色',          'n_colors', 2, 2),
  ('tricolor',              'トリコロール配色',        'n_colors', 3, 3),

  -- wheel_division
  ('dyad',                  'ダイアード',              'wheel_division', 2, 2),
  ('split_complementary',   'スプリットコンプリメンタリー', 'wheel_division', 3, 3),
  ('triad',                 'トライアド',              'wheel_division', 3, 3),
  ('tetrad',                'テトラード',              'wheel_division', 4, 4),
  ('pentad',                'ペンタード',              'wheel_division', 5, 5),
  ('hexad',                 'ヘクサード',              'wheel_division', 6, 6);

commit;
