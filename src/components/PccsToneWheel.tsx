'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { hslToHex } from '@/lib/color';
import {
  PCCS_HUES,
  PCCS_TONES,
  type AchromaticToneCode,
  type ChromaticToneCode,
  type PccsHue,
  type ToneCode,
} from '@/lib/scheme/pccs';
import type { Tone } from '@/types/palette';

export type PccsSelection = {
  tone: Tone;
  toneCode: ToneCode;
  hueNum: PccsHue | null;
  hex: string;
  h: number;
  s: number;
  l: number;
};

type Props = {
  selectedToneId: string | null;
  selectedHue: number | null;
  onSelect: (selection: PccsSelection) => void;
};

// 楕円配置の座標 (%, container 基準)。参考画像のPCCSトーンマップを再現。
const CHROMATIC_LAYOUT: { key: ChromaticToneCode; x: number; y: number }[] = [
  { key: 'p', x: 28, y: 12 },
  { key: 'lt', x: 48, y: 12 },
  { key: 'b', x: 68, y: 24 },
  { key: 'ltg', x: 28, y: 32 },
  { key: 'sf', x: 48, y: 32 },
  { key: 's', x: 68, y: 52 },
  { key: 'v', x: 90, y: 52 },
  { key: 'g', x: 28, y: 52 },
  { key: 'd', x: 48, y: 52 },
  { key: 'dp', x: 68, y: 72 },
  { key: 'dkg', x: 28, y: 84 },
  { key: 'dk', x: 48, y: 84 },
];

const ACHROMATIC_ORDER: AchromaticToneCode[] = [
  'W',
  'ltGy',
  'mGy',
  'dkGy',
  'Bk',
];

// 12色相 (PCCS の偶数番号 hue): 2,4,...,24
const TWELVE_HUES: PccsHue[] = [2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24];

// Yellow (hue 8) を真上、時計回りに 30° ずつ。
const hueToAngleDeg = (hueNum: PccsHue): number => {
  const idx = (hueNum - 8 + 24) / 2; // hue 8 → 0
  return ((idx % 12) * 30 + 360) % 360;
};

// 入力 H 値を最も近い PCCS 偶数番号 hue にスナップ
const findNearestHueNum = (h: number | null): PccsHue | null => {
  if (h === null) return null;
  let best: PccsHue = 8;
  let bestDist = Infinity;
  for (const hueNum of TWELVE_HUES) {
    const hueDeg = PCCS_HUES[hueNum].representativeHue;
    const d = Math.min(
      Math.abs(hueDeg - h),
      360 - Math.abs(hueDeg - h),
    );
    if (d < bestDist) {
      bestDist = d;
      best = hueNum;
    }
  }
  return best;
};

const WHEEL_SIZE = 124; // px
const WHEEL_RADIUS = 44; // px (中心からスウォッチ中心まで)
const SWATCH_SIZE = 22; // px

type Computed = {
  hex: string;
  h: number;
  s: number;
  l: number;
};

const computeColor = (
  toneCode: ToneCode,
  hueNum: PccsHue | null,
): Computed => {
  const t = PCCS_TONES[toneCode];
  const h = hueNum === null ? 0 : PCCS_HUES[hueNum].representativeHue;
  const s = t.representativeS;
  const l = t.representativeL;
  return { hex: hslToHex(h, s, l), h, s, l };
};

const ToneWheel: React.FC<{
  toneCode: ChromaticToneCode;
  dbTone: Tone | undefined;
  selectedToneCode: ToneCode | null;
  selectedHueNum: PccsHue | null;
  onSelect: (selection: PccsSelection) => void;
}> = ({ toneCode, dbTone, selectedToneCode, selectedHueNum, onSelect }) => {
  const isMissing = !dbTone;
  const isThisTone = selectedToneCode === toneCode;

  return (
    <div
      className="relative"
      style={{ width: WHEEL_SIZE, height: WHEEL_SIZE }}
      title={isMissing ? `${toneCode} (DB未登録)` : undefined}
    >
      <div className="absolute inset-0 rounded-full bg-base-100 border border-base-300 flex items-center justify-center pointer-events-none">
        <span className="text-sm font-bold font-mono select-none">
          {toneCode}
        </span>
      </div>
      {TWELVE_HUES.map((hueNum) => {
        const angle = hueToAngleDeg(hueNum);
        const computed = computeColor(toneCode, hueNum);
        const isSelected = isThisTone && selectedHueNum === hueNum;
        const hueInfo = PCCS_HUES[hueNum];

        return (
          <button
            key={hueNum}
            type="button"
            disabled={isMissing}
            aria-label={`${PCCS_TONES[toneCode].nameJa} ${hueNum}番 ${hueInfo.nameJa}`}
            title={`${toneCode}-${hueNum} ${PCCS_TONES[toneCode].nameJa}×${hueInfo.nameJa}`}
            onClick={() => {
              if (!dbTone) return;
              onSelect({
                tone: dbTone,
                toneCode,
                hueNum,
                ...computed,
              });
            }}
            className={`absolute rounded-sm border transition-transform ${
              isSelected
                ? 'ring-2 ring-primary ring-offset-1 z-10 scale-125'
                : 'border-base-300/50 hover:scale-110'
            } ${isMissing ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'}`}
            style={{
              width: SWATCH_SIZE,
              height: SWATCH_SIZE,
              backgroundColor: computed.hex,
              left: '50%',
              top: '50%',
              transform: `translate(-50%, -50%) rotate(${angle}deg) translateY(-${WHEEL_RADIUS}px) rotate(-${angle}deg)`,
            }}
          />
        );
      })}
    </div>
  );
};

const AchromaticColumn: React.FC<{
  dbTonesByKey: Map<string, Tone>;
  selectedToneCode: ToneCode | null;
  onSelect: (selection: PccsSelection) => void;
}> = ({ dbTonesByKey, selectedToneCode, onSelect }) => {
  return (
    <div className="flex flex-col gap-3 p-3 rounded-lg border border-base-300 bg-base-100">
      {ACHROMATIC_ORDER.map((code) => {
        const dbTone = dbTonesByKey.get(code);
        const t = PCCS_TONES[code];
        const computed = computeColor(code, null);
        const isSelected = selectedToneCode === code;
        const isMissing = !dbTone;

        return (
          <button
            key={code}
            type="button"
            disabled={isMissing}
            aria-label={`${t.nameJa} (${code})`}
            title={isMissing ? `${code} (DB未登録)` : `${code} ${t.nameJa}`}
            onClick={() => {
              if (!dbTone) return;
              onSelect({
                tone: dbTone,
                toneCode: code,
                hueNum: null,
                ...computed,
              });
            }}
            className={`flex flex-col items-center gap-1 ${
              isMissing ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'
            }`}
          >
            <div
              className={`w-12 h-12 rounded border-2 transition-all ${
                isSelected
                  ? 'border-primary ring-2 ring-primary ring-offset-1 scale-110'
                  : 'border-base-300 hover:scale-105'
              }`}
              style={{ backgroundColor: computed.hex }}
            />
            <span className="text-[10px] font-mono">{code}</span>
          </button>
        );
      })}
    </div>
  );
};

const PccsToneWheel: React.FC<Props> = ({
  selectedToneId,
  selectedHue,
  onSelect,
}) => {
  const [dbTones, setDbTones] = useState<Tone[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTones = async () => {
      if (
        !process.env.NEXT_PUBLIC_SUPABASE_URL ||
        !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      ) {
        setError('Supabase接続情報が設定されていません。');
        setLoading(false);
        return;
      }

      const supabase = createClient();
      try {
        const { data, error: dbError } = await supabase
          .from('tones')
          .select(
            'id, key, code, display_name, category, s_min, s_max, l_min, l_max, sort_order',
          )
          .order('sort_order');
        if (dbError) throw dbError;
        setDbTones((data as Tone[]) || []);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : '不明なエラー';
        setError(`トーン取得に失敗: ${msg}`);
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchTones();
  }, []);

  const dbTonesByKey = useMemo(() => {
    const m = new Map<string, Tone>();
    for (const t of dbTones) {
      m.set(t.key, t);
    }
    return m;
  }, [dbTones]);

  const selectedToneCode = useMemo<ToneCode | null>(() => {
    if (!selectedToneId) return null;
    const t = dbTones.find((x) => x.id === selectedToneId);
    if (!t) return null;
    const code = t.key as ToneCode;
    return code in PCCS_TONES ? code : null;
  }, [dbTones, selectedToneId]);

  const selectedHueNum = useMemo<PccsHue | null>(() => {
    if (!selectedToneCode) return null;
    if (!PCCS_TONES[selectedToneCode].isChromatic) return null;
    return findNearestHueNum(selectedHue);
  }, [selectedToneCode, selectedHue]);

  if (loading) {
    return <div className="text-center p-8">トーンを読み込み中...</div>;
  }
  if (error) {
    return <div className="alert alert-error text-sm">{error}</div>;
  }

  return (
    <div className="w-full overflow-x-auto">
      <div className="flex gap-4 min-w-[720px]">
        <AchromaticColumn
          dbTonesByKey={dbTonesByKey}
          selectedToneCode={selectedToneCode}
          onSelect={onSelect}
        />

        <div
          className="relative flex-1"
          style={{ aspectRatio: '11 / 10', minHeight: 460 }}
        >
          {CHROMATIC_LAYOUT.map(({ key, x, y }) => (
            <div
              key={key}
              className="absolute"
              style={{
                left: `${x}%`,
                top: `${y}%`,
                transform: 'translate(-50%, -50%)',
              }}
            >
              <ToneWheel
                toneCode={key}
                dbTone={dbTonesByKey.get(key)}
                selectedToneCode={selectedToneCode}
                selectedHueNum={selectedHueNum}
                onSelect={onSelect}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PccsToneWheel;
