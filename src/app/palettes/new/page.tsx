'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Scheme, PaletteColor } from '@/types/palette';
import { hexToHsl } from '@/lib/color';

// Import Components
import SchemeSelector from '@/components/SchemeSelector';
import ColorInputRow from '@/components/ColorInputRow';
import PalettePreviewBar from '@/components/PalettePreviewBar'; // Assuming this component exists

// Utility to clamp a number between a min and max
const clamp = (num: number, min: number, max: number) => Math.min(Math.max(num, min), max);

const DEFAULT_COLOR_COUNT = 3;
const MIN_COLORS = 2;
const MAX_COLORS = 6;

const createDefaultColor = (): PaletteColor => ({
  hex: '#FFFFFF',
  h: 0,
  s: 0,
  l: 100,
  ratio: null,
});

const NewPalettePage: React.FC = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedScheme, setSelectedScheme] = useState<Scheme | null>(null);
  const [colors, setColors] = useState<PaletteColor[]>(() => 
    Array.from({ length: DEFAULT_COLOR_COUNT }, createDefaultColor)
  );

  const showRatioInputs = useMemo(() => 
    selectedScheme?.key === 'dominant_color' || selectedScheme?.key === 'dominant_tone',
    [selectedScheme]
  );
  
  const ratioSum = useMemo(() => {
    if (!showRatioInputs) return 100;
    return colors.reduce((acc, color) => acc + (color.ratio ?? 0), 0);
  }, [colors, showRatioInputs]);


  // Effect to adjust color array size and set default ratios when scheme changes
  useEffect(() => {
    const numColors = selectedScheme
      ? clamp(selectedScheme.min_colors, MIN_COLORS, MAX_COLORS)
      : DEFAULT_COLOR_COUNT;

    const newColors = Array.from({ length: numColors }, (_, i) => 
      colors[i] || createDefaultColor()
    );

    // Set default ratios if applicable
    if (selectedScheme?.key === 'dominant_color' || selectedScheme?.key === 'dominant_tone') {
      if (numColors === 2) {
        newColors[0].ratio = 70;
        newColors[1].ratio = 30;
      } else if (numColors === 3) {
        newColors[0].ratio = 70;
        newColors[1].ratio = 20;
        newColors[2].ratio = 10;
      } else if (numColors > 3) {
        newColors[0].ratio = 60;
        newColors[1].ratio = 20;
        newColors[2].ratio = 10;
        for (let i = 3; i < numColors; i++) {
          newColors[i].ratio = i === 3 ? 10 : 0; // Simple default, can be improved
        }
        // Adjust last ratio to make sum 100
        const currentSum = newColors.reduce((acc, c) => acc + (c.ratio ?? 0), 0);
        const lastRatio = newColors[numColors-1].ratio ?? 0;
        newColors[numColors - 1].ratio = Math.max(0, lastRatio + (100 - currentSum));
      }
    } else {
        newColors.forEach(c => c.ratio = null);
    }

    setColors(newColors);
  }, [selectedScheme]);


  const handleSchemeChange = (scheme: Scheme | null) => {
    setSelectedScheme(scheme);
  };

  const handleColorChange = (index: number, newColor: PaletteColor) => {
    const newColors = [...colors];
    newColors[index] = newColor;
    setColors(newColors);
  };

  // For PalettePreviewBar which expects a `role` property
  const previewColors = colors.map(c => ({
    ...c,
    hex: c.h === null ? '#FFFFFF' : c.hex, // Use white for invalid colors
    role: '', // Role is not used in this form
  }));

  return (
    <div className="container mx-auto max-w-3xl p-4">
      <h1 className="text-3xl font-bold mb-6">配色を作る</h1>

      {/* Preview Section */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">プレビュー</h2>
        <PalettePreviewBar colors={previewColors} />
      </div>

      <div className="space-y-8">
        {/* Step 1: Scheme */}
        <section>
          <h2 className="text-xl font-semibold mb-3">1) 技法</h2>
          <SchemeSelector
            selectedSchemeId={selectedScheme?.id ?? null}
            onSchemeChange={handleSchemeChange}
          />
        </section>

        {/* Step 2: Colors */}
        <section>
          <div className="flex items-center justify-between mb-3">
             <h2 className="text-xl font-semibold">2) 色</h2>
             {showRatioInputs && ratioSum !== 100 && (
                <div className="text-xs text-warning font-semibold">
                    比率の合計が100%ではありません (現在 {ratioSum}%)
                </div>
             )}
          </div>
          <div className="space-y-4">
            {colors.map((color, index) => (
              <ColorInputRow
                key={index}
                index={index}
                color={color}
                onColorChange={handleColorChange}
                showRatio={showRatioInputs}
              />
            ))}
          </div>
        </section>

        {/* Step 3: Memo */}
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

      {/* Action Button */}
      <div className="mt-12 text-center">
        <button className="btn btn-primary btn-wide" disabled>
          内容を確認
        </button>
        <p className="text-xs text-base-content/60 mt-2">（このボタンはまだ機能しません）</p>
      </div>
    </div>
  );
};

export default NewPalettePage;
