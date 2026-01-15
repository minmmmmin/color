'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { User } from '@supabase/supabase-js';
import { Scheme, PaletteColor, PaletteColorDB, Tone } from '@/types/palette';
import { createClient } from '@/lib/supabaseClient';
import { isValidHex, hslToHex } from '@/lib/color';

// Import Components
import SchemeSelector from '@/components/SchemeSelector';
import PalettePreviewBar from '@/components/PalettePreviewBar';
import ToneSelector from '@/components/ToneSelector';
import HueSlider from '@/components/HueSlider';

const clamp = (num: number, min: number, max: number) => Math.min(Math.max(num, min), max);

const DEFAULT_COLOR_COUNT = 3;
const MIN_COLORS = 2;
const MAX_COLORS = 6;

const createDefaultColor = (): PaletteColor => ({
  hex: '#FFFFFF', h: 0, s: 0, l: 100, ratio: null, tone_id: null
});

const NewPalettePage: React.FC = () => {
  const router = useRouter();
  const supabase = createClient();

  // Auth State
  const [user, setUser] = useState<User | null>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedScheme, setSelectedScheme] = useState<Scheme | null>(null);
  const [colors, setColors] = useState<PaletteColor[]>(() =>
    Array.from({ length: DEFAULT_COLOR_COUNT }, createDefaultColor)
  );

  // Color Editing State
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [editingTone, setEditingTone] = useState<Tone | null>(null);
  const [editingHue, setEditingHue] = useState<number>(0);

  // Submission State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Derived state for the color editor preview
  const editingColor = useMemo(() => {
    if (!editingTone) return { hex: '#808080', h: 0, s: 0, l: 50 };
    const h = Math.round(editingHue / 15) * 15 % 360;
    const s = Math.round((editingTone.s_min + editingTone.s_max) / 2);
    const l = Math.round((editingTone.l_min + editingTone.l_max) / 2);
    const hex = hslToHex(h, s, l);
    return { hex, h, s, l };
  }, [editingTone, editingHue]);

  // Check user on mount
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user); setIsLoadingUser(false);
    };
    getUser();
  }, [supabase]);

  // Adjust color count when scheme changes
  useEffect(() => {
    if (!selectedScheme) return;
    const numColors = clamp(selectedScheme.min_colors, MIN_COLORS, MAX_COLORS);
    if (numColors === colors.length) return;
    const newColors = Array.from({ length: numColors }, (_, i) => colors[i] || createDefaultColor());
    setColors(newColors);
  }, [selectedScheme, colors]);

  const handleSelectSlot = (index: number) => {
    setActiveIndex(index);
    // Initialize editor with the selected slot's values if they exist
    const currentColor = colors[index];
    setEditingHue(currentColor.h ?? 0);
    // Note: We don't have the full Tone object here, so we can't pre-select it.
    // The user will have to re-select the tone.
    setEditingTone(null);
  };

  const handleSetColor = () => {
    if (activeIndex === null || !editingTone) return;
    const newColors = [...colors];
    newColors[activeIndex] = {
      ...newColors[activeIndex], // keep ratio
      hex: editingColor.hex,
      h: editingColor.h,
      s: editingColor.s,
      l: editingColor.l,
      tone_id: editingTone.id,
    };
    setColors(newColors);
    setActiveIndex(null); // Close editor after setting color
  };

  const handleSave = async () => {
    setError(null);
    setIsSubmitting(true);

    if (!user || !selectedScheme) {
      setError("ログインと技法の選択は必須です。");
      setIsSubmitting(false);
      return;
    }
    if (colors.some(c => !isValidHex(c.hex) || c.h === null)) {
      setError("すべての色スロットに有効な色を設定してください。");
      setIsSubmitting(false);
      return;
    }

    let paletteId: string | null = null;
    try {
      console.log('送信scheme:', { // デバッグ用ログ
        key: selectedScheme?.key,
        category: selectedScheme?.category,
      });
      const { data: paletteData, error: paletteError } = await supabase.from("palettes").insert({
        user_id: user.id, is_official: false, scheme: selectedScheme.category, title, description,
      }).select("id").single();
      if (paletteError) throw new Error(`パレットの保存に失敗: ${paletteError.message}`);
      paletteId = paletteData.id;

      const colorsToInsert: Omit<PaletteColorDB, 'id'>[] = colors.map((c, i) => ({
        palette_id: paletteId!, role: `color${i + 1}`, hex: c.hex, h: c.h!, s: c.s!, l: c.l!, ratio: c.ratio, tone_id: c.tone_id,
      }));
      const { error: colorsError } = await supabase.from("palette_colors").insert(colorsToInsert);
      if (colorsError) throw new Error(`色の保存に失敗: ${colorsError.message}`);

      router.push(`/palettes/${paletteId}`);
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : '不明なエラー';
      setError(errorMessage);
      if (paletteId) await supabase.from("palettes").delete().eq("id", paletteId);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingUser) return <div className="text-center p-12">読み込み中...</div>;
  if (!user) return (
    <div className="text-center p-12">
      <p className="mb-4">この機能を利用するにはログインが必要です。</p>
      <Link href="/login" className="btn btn-primary">ログインページへ</Link>
    </div>
  );

  return (
    <div className="container mx-auto max-w-4xl p-4">
      <h1 className="text-3xl font-bold mb-6">配色を作る</h1>
      {error && <div className="alert alert-error mb-6">{error}</div>}

      <div className="mb-8"><PalettePreviewBar colors={colors.map(c => ({ ...c, role: '' }))} /></div>

      <div className="space-y-12">
        <section>
          <h2 className="text-xl font-semibold mb-3">1) 技法</h2>
          <SchemeSelector selectedSchemeId={selectedScheme?.id ?? null} onSchemeChange={setSelectedScheme} />
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">2) 色 (トーンで選ぶ)</h2>
          <p className="text-sm text-base-content/70 mb-4">下の色スロットを選択して、トーンと色相で色を作成してください。</p>

          {/* Color Slots */}
          <div className="flex flex-wrap gap-4 mb-8">
            {colors.map((color, index) => (
              <div key={index} onClick={() => handleSelectSlot(index)} className={`cursor-pointer rounded-lg p-2 border-2 ${activeIndex === index ? 'border-primary' : 'border-base-300'}`}>
                <div className="w-16 h-16 rounded" style={{ backgroundColor: color.hex }}></div>
                <div className="text-xs text-center mt-1 font-mono">{color.hex}</div>
              </div>
            ))}
          </div>

          {/* Color Editor */}
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
                <button className="btn btn-primary" onClick={handleSetColor} disabled={!editingTone}>
                  この色にする
                </button>
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

      <div className="mt-12 text-center">
        <button className="btn btn-primary btn-wide" onClick={handleSave} disabled={isSubmitting}>
          {isSubmitting ? '保存中...' : '保存する'}
        </button>
      </div>
    </div>
  );
};

export default NewPalettePage;
