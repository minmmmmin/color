'use client';

import { PaletteColor } from '@/types/palette';
import React, { useState, useMemo, useCallback } from 'react';
import { HexColorPicker } from 'react-colorful';
import { isValidHex, hexToHsl } from '@/lib/color';

type ColorInputRowProps = {
  index: number;
  color: PaletteColor;
  onColorChange: (index: number, newColor: PaletteColor) => void;
  showRatio: boolean;
};

const ColorInputRow: React.FC<ColorInputRowProps> = ({
  index,
  color,
  onColorChange,
  showRatio,
}) => {
  const [inputValue, setInputValue] = useState(color.hex);
  const [isPickerOpen, setPickerOpen] = useState(false);

  const isInvalid = useMemo(() => !isValidHex(inputValue), [inputValue]);

  const handleHexChange = (newHex: string) => {
    setInputValue(newHex);
    if (isValidHex(newHex)) {
      const hsl = hexToHsl(newHex);
      onColorChange(index, { ...color, hex: newHex, ...hsl });
    } else {
       onColorChange(index, { ...color, hex: newHex, h: null, s: null, l: null });
    }
  };

  const handleRatioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newRatio = e.target.value === '' ? null : parseInt(e.target.value, 10);
    if (newRatio === null || (newRatio >= 0 && newRatio <= 100)) {
       onColorChange(index, { ...color, ratio: newRatio });
    }
  };
  
  const handlePickerChange = useCallback((newHex: string) => {
    setInputValue(newHex);
    const hsl = hexToHsl(newHex);
    onColorChange(index, { ...color, hex: newHex, ...hsl });
  }, [index, color, onColorChange]);


  return (
    <div className="flex flex-col gap-2 p-3 border border-base-300 rounded-lg">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-2 items-center">
        {/* Color Swatch & Picker Toggle */}
        <div className="md:col-span-1 flex items-center justify-center">
          <div
            className={`w-8 h-8 rounded-md border-2 cursor-pointer ${isInvalid ? 'bg-base-200' : ''}`}
            style={{ backgroundColor: isInvalid ? undefined : inputValue }}
            onClick={() => setPickerOpen(!isPickerOpen)}
          />
        </div>

        {/* HEX Input */}
        <div className="md:col-span-3">
          <label className="label py-1">
            <span className="label-text">HEX</span>
          </label>
          <input
            type="text"
            placeholder="#RRGGBB"
            className={`input input-bordered input-sm w-full font-mono ${isInvalid ? 'input-error' : ''}`}
            value={inputValue}
            onChange={(e) => handleHexChange(e.target.value)}
            maxLength={7}
          />
        </div>

        {/* HSL Display */}
        <div className="md:col-span-5 grid grid-cols-3 gap-2">
          <div>
            <label className="label py-1"><span className="label-text">H</span></label>
            <input type="text" readOnly className="input input-ghost input-sm w-full" value={color.h ?? '-'} />
          </div>
          <div>
            <label className="label py-1"><span className="label-text">S</span></label>
            <input type="text" readOnly className="input input-ghost input-sm w-full" value={color.s ?? '-'} />
          </div>
          <div>
            <label className="label py-1"><span className="label-text">L</span></label>
            <input type="text" readOnly className="input input-ghost input-sm w-full" value={color.l ?? '-'} />
          </div>
        </div>
        
        {/* Ratio Input */}
        <div className="md:col-span-3">
          {showRatio && (
             <div>
                <label className="label py-1">
                  <span className="label-text">比率 (%)</span>
                </label>
                <input
                  type="number"
                  placeholder="例: 70"
                  className="input input-bordered input-sm w-full"
                  value={color.ratio ?? ''}
                  onChange={handleRatioChange}
                  min="0"
                  max="100"
                />
             </div>
          )}
        </div>
      </div>
      
      {isInvalid && inputValue.length > 0 && (
        <p className="text-error text-xs mt-1">
          無効なHEXコードです。#RRGGBB形式で入力してください。
        </p>
      )}

      {/* Color Picker Collapse */}
      <div className={`collapse collapse-arrow border border-base-300 bg-base-100 ${isPickerOpen ? 'collapse-open' : ''}`}>
        <div className="collapse-title text-sm font-medium" onClick={() => setPickerOpen(!isPickerOpen)}>
          カラーピッカー
        </div>
        <div className="collapse-content">
            <div className="flex justify-center items-center p-2">
              <HexColorPicker color={isValidHex(inputValue) ? inputValue : '#ffffff'} onChange={handlePickerChange} />
            </div>
        </div>
      </div>

    </div>
  );
};

export default ColorInputRow;
