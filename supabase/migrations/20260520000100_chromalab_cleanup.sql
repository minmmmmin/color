-- Chromalab 未使用テーブル/カラムのクリーンアップ
--
-- 変更点:
--   1. 未使用テーブル(palette_tags, tags, quiz_history)を削除
--   2. 未使用 enum (quiz_type) を削除
--   3. palettes の二重管理を解消(scheme カラム削除、scheme_id に一本化)
--   4. palettes の未使用カラム(hue_relation, tone_relation)を削除
--   5. palettes.scheme_id を NOT NULL に変更(現状 0 行なので安全)
--
-- CASCADE は意図的に使わない。FK 依存順に DROP する。

begin;

----------------------------------------------------------------
-- 1) 未使用テーブルの削除
----------------------------------------------------------------
-- palette_tags は tags と palettes への FK を持つ。先に消す。
drop table if exists public.palette_tags;
-- tags はもう参照されていない。
drop table if exists public.tags;
-- quiz_history は palettes への FK を持つ。先に消すと quiz_type も自由に消せる。
drop table if exists public.quiz_history;

----------------------------------------------------------------
-- 2) 未使用 enum の削除
----------------------------------------------------------------
drop type if exists public.quiz_type;

----------------------------------------------------------------
-- 3) palettes の未使用カラム削除と scheme_id 一本化
----------------------------------------------------------------
alter table public.palettes drop column if exists scheme;
alter table public.palettes drop column if exists hue_relation;
alter table public.palettes drop column if exists tone_relation;

-- scheme_id は今後必須。現状 palettes は 0 行なので NOT NULL に変更しても安全。
alter table public.palettes alter column scheme_id set not null;

commit;
