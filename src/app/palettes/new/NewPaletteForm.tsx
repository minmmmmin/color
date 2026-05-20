'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { User } from '@supabase/supabase-js';
import { Scheme, PaletteColor } from '@/types/palette';
import { createClient } from '@/lib/supabase/client';

// Import Components
import SchemeSelector from '@/components/SchemeSelector';
import PalettePreviewBar from '@/components/PalettePreviewBar';
import PccsToneWheel, {
  type PccsSelection,
} from '@/components/PccsToneWheel';

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

  // Color Editing State
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [pendingSelection, setPendingSelection] =
    useState<PccsSelection | null>(null);

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

  const handleSelectSlot = (index: number) => {
    setActiveIndex(index);
    setPendingSelection(null);
  };

  const activeColor = activeIndex !== null ? colors[activeIndex] : null;

  const previewColor = useMemo(() => {
    if (pendingSelection) {
      return {
        hex: pendingSelection.hex,
        label: `${pendingSelection.toneCode}${
          pendingSelection.hueNum ? `-${pendingSelection.hueNum}` : ''
        }`,
      };
    }
    if (activeColor) {
      return { hex: activeColor.hex, label: activeColor.hex };
    }
    return null;
  }, [pendingSelection, activeColor]);

  const handleApply = () => {
    if (activeIndex === null || !pendingSelection) return;
    const newColors = [...colors];
    newColors[activeIndex] = {
      ...newColors[activeIndex],
      hex: pendingSelection.hex,
      h: pendingSelection.h,
      s: pendingSelection.s,
      l: pendingSelection.l,
      tone_id: pendingSelection.tone.id,
    };
    setColors(newColors);
    setActiveIndex(null);
    setPendingSelection(null);
  };

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
            下の色スロットを選び、PCCSトーン図から(トーン×色相)を1つ選択してください。
          </p>
          <div className="flex flex-wrap gap-3 mb-6">
            {colors.map((color, index) => (
              <button
                key={index}
                type="button"
                onClick={() => handleSelectSlot(index)}
                className={`cursor-pointer rounded-lg p-2 border-2 transition-all ${
                  activeIndex === index
                    ? 'border-primary ring-2 ring-primary ring-offset-2 scale-105'
                    : 'border-base-300 hover:border-base-content/30'
                }`}
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

          {activeIndex !== null && (
            <div className="p-4 border-2 border-primary rounded-lg space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h3 className="font-semibold">
                  スロット {activeIndex + 1} の色を編集中
                </h3>
                {previewColor && (
                  <div className="flex items-center gap-3">
                    <div
                      className="w-12 h-12 rounded border border-base-300"
                      style={{ backgroundColor: previewColor.hex }}
                    />
                    <div className="text-sm">
                      <div className="font-mono">{previewColor.hex}</div>
                      {previewColor.label !== previewColor.hex && (
                        <div className="text-xs text-base-content/70">
                          {previewColor.label}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <PccsToneWheel
                selectedToneId={
                  pendingSelection?.tone.id ?? activeColor?.tone_id ?? null
                }
                selectedHue={pendingSelection?.h ?? activeColor?.h ?? null}
                onSelect={setPendingSelection}
              />

              <div className="flex justify-end gap-2 sticky bottom-2 bg-base-100/80 backdrop-blur p-2 rounded">
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => {
                    setActiveIndex(null);
                    setPendingSelection(null);
                  }}
                >
                  キャンセル
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleApply}
                  disabled={!pendingSelection}
                >
                  この色にする
                </button>
              </div>
            </div>
          )}
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
