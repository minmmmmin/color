'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { User } from '@supabase/supabase-js';
import { Scheme, PaletteColor } from '@/types/palette';
import { createClient } from '@/lib/supabase/client';
import { techniquesById } from '@/lib/scheme/techniques';

// Import Components
import SchemeSelector from '@/components/SchemeSelector';
import PalettePreviewBar from '@/components/PalettePreviewBar';
import PccsToneWheel from '@/components/PccsToneWheel';

const MIN_COLORS = 2;
const MAX_COLORS = 6;

const createDefaultColor = (): PaletteColor => ({
  hex: '#FFFFFF',
  h: 0,
  s: 0,
  l: 100,
  ratio: null,
  tone_id: null,
});

const NewPaletteForm: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  const paletteId = searchParams.get('edit');
  const isEditMode = Boolean(paletteId);

  // Auth & Data State
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [schemes, setSchemes] = useState<Scheme[]>([]);

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedScheme, setSelectedScheme] = useState<Scheme | null>(null);
  const [colors, setColors] = useState<PaletteColor[]>(() =>
    Array.from({ length: MIN_COLORS }, createDefaultColor),
  );

  // アクティブスロット (常に1つが選択中)。スウォッチクリックでここに即適用する。
  const [activeIndex, setActiveIndex] = useState<number>(0);

  // Submission State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch initial data (user and all schemes)
  useEffect(() => {
    const fetchInitialData = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);

      const { data: schemesData } = await supabase
        .from('schemes')
        .select('*')
        .order('display_name');
      if (schemesData) setSchemes(schemesData as Scheme[]);

      if (!isEditMode) {
        setIsLoading(false);
      }
    };
    fetchInitialData();
  }, [supabase, isEditMode]);

  // Fetch palette data if in edit mode
  useEffect(() => {
    if (!isEditMode || schemes.length === 0) return;

    const fetchPaletteData = async () => {
      setIsLoading(true);
      const { data: paletteData, error: paletteError } = await supabase
        .from('palettes')
        .select('*, palette_colors(*)')
        .eq('id', paletteId)
        .single();

      if (paletteError || !paletteData) {
        setError('編集対象のパレットを読み込めませんでした。');
        setIsLoading(false);
        return;
      }

      setTitle(paletteData.title || '');
      setDescription(paletteData.description || '');

      const foundScheme = schemes.find((s) => s.id === paletteData.scheme_id);
      setSelectedScheme(foundScheme || null);

      if (paletteData.palette_colors) {
        const sortedDbColors = [...paletteData.palette_colors].sort((a, b) =>
          (a.role || '').localeCompare(b.role || ''),
        );

        const fetchedColors = sortedDbColors.map((c) => ({
          hex: c.hex,
          h: c.h,
          s: c.s,
          l: c.l,
          ratio: c.ratio,
          tone_id: c.tone_id,
        }));

        setColors(fetchedColors);
      }
      setIsLoading(false);
    };

    fetchPaletteData();
  }, [isEditMode, paletteId, supabase, schemes]);

  // Adjust color count based on selected scheme (only in new mode)
  useEffect(() => {
    if (isEditMode || !selectedScheme) {
      return;
    }

    const newColorCount = selectedScheme.min_colors;
    if (newColorCount < MIN_COLORS || newColorCount > MAX_COLORS) return;

    setColors((currentColors) => {
      const currentLength = currentColors.length;
      if (currentLength === newColorCount) {
        return currentColors;
      }

      if (currentLength < newColorCount) {
        return [
          ...currentColors,
          ...Array.from(
            { length: newColorCount - currentLength },
            createDefaultColor,
          ),
        ];
      } else {
        return currentColors.slice(0, newColorCount);
      }
    });
  }, [selectedScheme, isEditMode]);

  const handleSave = async () => {
    setError(null);
    setIsSubmitting(true);

    if (!user || !selectedScheme) {
      setError('ログインと技法の選択は必須です。');
      setIsSubmitting(false);
      return;
    }

    const paletteDetails = {
      user_id: user.id,
      is_official: false,
      scheme_id: selectedScheme.id,
      title,
      description,
    };

    try {
      let upsertedPaletteId: string;

      if (isEditMode && paletteId) {
        const { data, error: updateError } = await supabase
          .from('palettes')
          .update(paletteDetails)
          .eq('id', paletteId)
          .select('id')
          .single();
        if (updateError) throw updateError;
        upsertedPaletteId = data.id;
        const { error: deleteError } = await supabase
          .from('palette_colors')
          .delete()
          .eq('palette_id', upsertedPaletteId);
        if (deleteError) throw deleteError;
      } else {
        const { data, error: insertError } = await supabase
          .from('palettes')
          .insert(paletteDetails)
          .select('id')
          .single();
        if (insertError) throw insertError;
        upsertedPaletteId = data.id;
      }

      const colorsToInsert = colors.map((c, i) => ({
        palette_id: upsertedPaletteId,
        role: `color${i + 1}`,
        hex: c.hex,
        h: c.h!,
        s: c.s!,
        l: c.l!,
        ratio: c.ratio,
        tone_id: c.tone_id,
      }));
      const { error: colorsError } = await supabase
        .from('palette_colors')
        .insert(colorsToInsert);
      if (colorsError) throw colorsError;

      router.push(`/palettes/${upsertedPaletteId}`);
    } catch (e: unknown) {
      const err = e as { message: string; details?: string };
      setError(`保存に失敗しました: ${err.message} (${err.details || ''})`);
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  // colors の長さが activeIndex を下回らないようにクランプ
  useEffect(() => {
    if (activeIndex >= colors.length) {
      setActiveIndex(Math.max(0, colors.length - 1));
    }
  }, [activeIndex, colors.length]);

  const activeColor = colors[activeIndex] ?? null;

  // 選択中の技法の宣言定義(matcher 用)。
  const currentTechnique = useMemo(() => {
    if (!selectedScheme) return null;
    return techniquesById[selectedScheme.key] ?? null;
  }, [selectedScheme]);

  // 推奨ヒントのアンカー: 最初に色を選んだスロット (tone_id が入った最初の色)。
  // 編集中のスロット自体はアンカーから除外する(自分自身を基準にしない)。
  const anchor = useMemo(() => {
    const idx = colors.findIndex(
      (c, i) => c.tone_id !== null && i !== activeIndex,
    );
    if (idx === -1) return null;
    const c = colors[idx];
    return { tone_id: c.tone_id, h: c.h };
  }, [colors, activeIndex]);

  if (isLoading) return <div className="text-center p-12">読み込み中...</div>;
  if (!user)
    return (
      <div className="text-center p-12">
        <p className="mb-4">この機能を利用するにはログインが必要です。</p>
        <Link href="/login" className="btn btn-primary">
          ログインページへ
        </Link>
      </div>
    );

  return (
    <div className="container mx-auto max-w-4xl p-4">
      <h1 className="text-3xl font-bold mb-6">
        {isEditMode ? '配色を編集' : '配色を作る'}
      </h1>
      {error && <div className="alert alert-error mb-6">{error}</div>}

      <div className="mb-8">
        <PalettePreviewBar colors={colors.map((c) => ({ ...c, role: '' }))} />
      </div>

      <div className="space-y-12">
        <section>
          <h2 className="text-xl font-semibold mb-3">1) 技法</h2>
          <SchemeSelector
            schemes={schemes}
            selectedSchemeId={selectedScheme?.id ?? null}
            onSchemeChange={setSelectedScheme}
          />
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">2) 色</h2>
          <p className="text-sm text-base-content/70 mb-4">
            スロットを選び、PCCSトーン図のスウォッチをクリックすると即時反映されます。
          </p>
          <div className="flex flex-wrap gap-3 mb-6">
            {colors.map((color, index) => (
              <button
                key={index}
                type="button"
                onClick={() => setActiveIndex(index)}
                className={`cursor-pointer rounded-lg p-2 border-2 transition-all ${
                  activeIndex === index
                    ? 'border-primary ring-2 ring-primary ring-offset-2 scale-105'
                    : 'border-base-300 hover:border-base-content/30'
                }`}
                aria-pressed={activeIndex === index}
              >
                <div
                  className="w-16 h-16 rounded"
                  style={{ backgroundColor: color.hex }}
                />
                <div className="text-[10px] text-center mt-1 text-base-content/70">
                  スロット {index + 1}
                </div>
                <div className="text-[10px] text-center font-mono">
                  {color.hex}
                </div>
              </button>
            ))}
          </div>

          {currentTechnique && anchor && (
            <p className="text-xs text-base-content/60 mb-2">
              「{currentTechnique.nameJa}
              」のルールに合う候補をハイライト表示しています(他も自由に選べます)
            </p>
          )}
          <PccsToneWheel
            selectedToneId={activeColor?.tone_id ?? null}
            selectedHue={activeColor?.h ?? null}
            anchor={anchor}
            technique={currentTechnique}
            onSelect={(sel) => {
              const newColors = [...colors];
              newColors[activeIndex] = {
                ...newColors[activeIndex],
                hex: sel.hex,
                h: sel.h,
                s: sel.s,
                l: sel.l,
                tone_id: sel.tone.id,
              };
              setColors(newColors);
            }}
          />
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">3) メモ (任意)</h2>
          <div className="space-y-4">
            <input
              type="text"
              placeholder="配色のタイトル"
              className="input input-bordered w-full"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <textarea
              className="textarea textarea-bordered w-full"
              placeholder="説明やメモ"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            ></textarea>
          </div>
        </section>
      </div>

      <div className="mt-12 text-center flex justify-center gap-4">
        <Link href="/" className="btn">
          キャンセル
        </Link>
        <button
          className="btn btn-primary"
          onClick={handleSave}
          disabled={isSubmitting}
        >
          {isSubmitting ? '保存中...' : isEditMode ? '更新する' : '保存する'}
        </button>
      </div>
    </div>
  );
};

export default NewPaletteForm;
