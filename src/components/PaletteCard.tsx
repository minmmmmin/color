'use client';

import React, { useState, useEffect } from 'react';
import PalettePreviewBar from './PalettePreviewBar';

// This type is also defined in page.tsx, consider moving to a central types file
export type PaletteColor = {
  hex: string;
  role: string;
  ratio: number | null;
};

export type PaletteCardProps = {
  id?: string;
  title?: string | null;
  schemeName?: string | null;
  isOfficial?: boolean;
  colors: PaletteColor[];
  createdAt?: string;
};

const PaletteCard: React.FC<PaletteCardProps> = ({
  title,
  schemeName,
  isOfficial = false,
  colors,
  createdAt,
}) => {
  const [copiedHex, setCopiedHex] = useState<string | null>(null);

  // Clear tooltip after a delay
  useEffect(() => {
    if (copiedHex) {
      const timer = setTimeout(() => {
        setCopiedHex(null);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [copiedHex]);

  const handleCopy = (e: React.MouseEvent, hex: string) => {
    e.stopPropagation();
    e.preventDefault();

    if (!navigator.clipboard) {
      console.error('Clipboard API not available.');
      return;
    }
    navigator.clipboard.writeText(hex).catch(err => {
      console.error('Failed to copy text: ', err);
    });
    setCopiedHex(hex);
  };

  const isValidHex = (hex: string) => /^#[0-9A-F]{6}$/i.test(hex);

  const formattedDate = createdAt
    ? new Date(createdAt).toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric' })
    : null;

  return (
    <div className="card card-compact bg-base-100 shadow-md border border-base-300 transition-shadow hover:shadow-lg h-full">
      <div className="card-body">
        {title && <h2 className="card-title !text-base font-medium">{title}</h2>}

        <PalettePreviewBar colors={colors} />

        <div className="flex justify-between items-center mt-3">
          <p className="font-semibold text-base-content/90 text-sm">{schemeName || 'Unnamed Scheme'}</p>
          <div className={`badge badge-sm ${isOfficial ? 'badge-secondary' : 'badge-ghost'}`}>
            {isOfficial ? 'Official' : 'Personal'}
          </div>
        </div>

        {formattedDate && <p className="text-xs text-base-content/60 mt-1">{formattedDate}</p>}

        <div className="card-actions mt-2 flex flex-wrap gap-2 items-center">
          {colors.slice(0, 6).map((color) => ( // Show max 6 colors
            isValidHex(color.hex) && (
              <div
                key={color.hex}
                className={`tooltip tooltip-bottom ${copiedHex === color.hex ? 'tooltip-open tooltip-success' : ''}`}
                data-tip={copiedHex === color.hex ? "Copied!" : `Copy ${color.hex}`}
              >
                <button
                  onClick={(e) => handleCopy(e, color.hex)}
                  className="btn btn-ghost btn-xs font-mono normal-case"
                >
                  <span
                    className="inline-block w-3 h-3 rounded-full mr-1 border border-base-content/20"
                    style={{ backgroundColor: color.hex }}
                  ></span>
                  {color.hex.toUpperCase()}
                </button>
              </div>
            )
          ))}
        </div>
      </div>
    </div>
  );
};

export default PaletteCard;
