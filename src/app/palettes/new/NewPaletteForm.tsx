'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { User } from '@supabase/supabase-js';
import { Scheme, PaletteColor, PaletteColorDB, Tone, SchemeCategory } from '@/types/palette';
import { createClient } from '@/lib/supabase/client';
import { isValidHex, hslToHex } from '@/lib/color';

// Import Components
import SchemeSelector from '@/components/SchemeSelector';
import PalettePreviewBar from '@/components/PalettePreviewBar';
import ToneSelector from '@/components/ToneSelector';
import HueSlider from '@/components/HueSlider';

const clamp = (num: number, min: number, max: number) => Math.min(Math.max(num, min), max);

const MIN_COLORS = 2;
const MAX_COLORS = 6;

const createDefaultColor = (): PaletteColor => ({
  hex: '#FFFFFF', h: 0, s: 0, l: 100, ratio: null, tone_id: null
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
    Array.from({ length: MIN_COLORS }, createDefaultColor)
  );

  // Color Editing State
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [editingTone, setEditingTone] = useState<Tone | null>(null);
  const [editingHue, setEditingHue] = useState<number>(0);

  // Submission State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch initial data (user and all schemes)
  useEffect(() => {
    const fetchInitialData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      const { data: schemesData } = await supabase.from('schemes').select('*').order('display_name');
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

      const foundScheme = schemes.find(s => s.category === paletteData.scheme);
      setSelectedScheme(foundScheme || null);

      if (paletteData.palette_colors) {
        // First, sort the original array safely
        const sortedDbColors = [...paletteData.palette_colors].sort((a, b) =>
          (a.role || '').localeCompare(b.role || '')
        );

        // Then, map the sorted array to the state shape
        const fetchedColors = sortedDbColors.map(c => ({
          hex: c.hex, h: c.h, s: c.s, l: c.l, ratio: c.ratio, tone_id: c.tone_id,
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

    setColors(currentColors => {
      const currentLength = currentColors.length;
      if (currentLength === newColorCount) {
        return currentColors;
      }

      if (currentLength < newColorCount) {
        return [
          ...currentColors,
          ...Array.from({ length: newColorCount - currentLength }, createDefaultColor)
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
      setError("ログインと技法の選択は必須です。");
      setIsSubmitting(false);
      return;
    }

    const paletteDetails = {
      user_id: user.id,
      is_official: false,
      scheme: selectedScheme.category as SchemeCategory,
      title,
      description,
    };

    try {
      let upsertedPaletteId: string;

      if (isEditMode && paletteId) {
        const { data, error: updateError } = await supabase
          .from('palettes').update(paletteDetails).eq('id', paletteId).select('id').single();
        if (updateError) throw updateError;
        upsertedPaletteId = data.id;
        const { error: deleteError } = await supabase.from('palette_colors').delete().eq('palette_id', upsertedPaletteId);
        if (deleteError) throw deleteError;
      } else {
        const { data, error: insertError } = await supabase
          .from('palettes').insert(paletteDetails).select('id').single();
        if (insertError) throw insertError;
        upsertedPaletteId = data.id;
      }

      const colorsToInsert = colors.map((c, i) => ({
        palette_id: upsertedPaletteId, role: `color${i + 1}`, hex: c.hex, h: c.h!, s: c.s!, l: c.l!, ratio: c.ratio, tone_id: c.tone_id,
      }));
      const { error: colorsError } = await supabase.from('palette_colors').insert(colorsToInsert);
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

  const editingColor = useMemo(() => {
    if (!editingTone) return { hex: '#808080', h: 0, s: 0, l: 50 };
    const h = Math.round(editingHue / 15) * 15 % 360;
    const s = Math.round((editingTone.s_min + editingTone.s_max) / 2);
    const l = Math.round((editingTone.l_min + editingTone.l_max) / 2);
    const hex = hslToHex(h, s, l);
    return { hex, h, s, l };
  }, [editingTone, editingHue]);

  const handleSelectSlot = (index: number) => {
    setActiveIndex(index);
    const currentColor = colors[index];
    setEditingHue(currentColor.h ?? 0);
    setEditingTone(null);
  };

  const handleSetColor = () => {
    if (activeIndex === null || !editingTone) return;
    const newColors = [...colors];
    newColors[activeIndex] = {
      ...newColors[activeIndex],
      hex: editingColor.hex, h: editingColor.h, s: editingColor.s, l: editingColor.l, tone_id: editingTone.id,
    };
    setColors(newColors);
    setActiveIndex(null);
  };

  if (isLoading) return <div className="text-center p-12">読み込み中...</div>;
  if (!user) return (
    <div className="text-center p-12">
      <p className="mb-4">この機能を利用するにはログインが必要です。</p>
      <Link href="/login" className="btn btn-primary">ログインページへ</Link>
    </div>
  );

  return (
    <div className="container mx-auto max-w-4xl p-4">
      <h1 className="text-3xl font-bold mb-6">{isEditMode ? '配色を編集' : '配色を作る'}</h1>
      {error && <div className="alert alert-error mb-6">{error}</div>}

      <div className="mb-8"><PalettePreviewBar colors={colors.map(c => ({ ...c, role: '' }))} /></div>

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
          <h2 className="text-xl font-semibold mb-3">2) 色 (トーンで選ぶ)</h2>
          <p className="text-sm text-base-content/70 mb-4">下の色スロットを選択して、トーンと色相で色を作成してください。</p>
          <div className="flex flex-wrap gap-4 mb-8">
            {colors.map((color, index) => (
              <div key={index} onClick={() => handleSelectSlot(index)} className={`cursor-pointer rounded-lg p-2 border-2 ${activeIndex === index ? 'border-primary' : 'border-base-300'}`}>
                <div className="w-16 h-16 rounded" style={{ backgroundColor: color.hex }}></div>
                <div className="text-xs text-center mt-1 font-mono">{color.hex}</div>
              </div>
            ))}
          </div>
          {activeIndex !== null && (
            <div className="p-4 border-2 border-primary rounded-lg space-y-6">
              <h3 className="font-semibold">スロット {activeIndex + 1} の色を編集中...</h3>
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div>
                  <div className="flex justify-center items-center w-full h-40 rounded-lg mb-4" style={{ backgroundColor: editingColor.hex }}>
                    <span className="p-2 bg-black/30 text-white rounded font-mono">{editingColor.hex}</span>
                  </div>
                  <HueSlider hue={editingHue} onHueChange={setEditingHue} />
                </div>
                <div>
                  <h4 className="font-medium mb-2">トーンを選択</h4>
                  <ToneSelector selectedToneId={editingTone?.id ?? null} onToneSelect={setEditingTone} />
                </div>
              </div>
              <div className="text-center">
                <button className="btn btn-primary" onClick={handleSetColor} disabled={!editingTone}>この色にする</button>
              </div>
            </div>
          )}
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">3) メモ (任意)</h2>
          <div className="space-y-4">
            <input type="text" placeholder="配色のタイトル" className="input input-bordered w-full" value={title} onChange={(e) => setTitle(e.target.value)} />
            <textarea className="textarea textarea-bordered w-full" placeholder="説明やメモ" value={description} onChange={(e) => setDescription(e.target.value)} rows={3}></textarea>
          </div>
        </section>
      </div>

      <div className="mt-12 text-center flex justify-center gap-4">
        <Link href="/" className="btn">
          キャンセル
        </Link>
        <button className="btn btn-primary" onClick={handleSave} disabled={isSubmitting}>
          {isSubmitting ? '保存中...' : (isEditMode ? '更新する' : '保存する')}
        </button>
      </div>
    </div>
  );
};

export default NewPaletteForm;
