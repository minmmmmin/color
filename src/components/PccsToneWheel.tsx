'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
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
import { isRecommendedSwatch } from '@/lib/scheme/matcher';
import type { Technique } from '@/lib/scheme/types';
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
  /**
   * 推奨ハイライト計算のアンカー色。null の場合は推奨ヒントを表示しない
   * (全スウォッチが通常表示)。
   */
  anchor?: { tone_id: string | null; h: number | null } | null;
  /** 選択中の技法。null の場合は推奨ヒントを表示しない。 */
  technique?: Technique | null;
};

// 楕円配置の座標 (%, container 基準)。参考画像のPCCSトーンマップを再現。
const CHROMATIC_LAYOUT: { key: ChromaticToneCode; x: number; y: number }[] = [
  { key: 'p', x: 10, y: 10 },
  { key: 'lt', x: 30, y: 10 },
  { key: 'b', x: 50, y: 22 },
  { key: 'ltg', x: 10, y: 34 },
  { key: 'sf', x: 30, y: 34 },
  { key: 'g', x: 10, y: 58 },
  { key: 'd', x: 30, y: 58 },
  { key: 's', x: 50, y: 44 },
  { key: 'v', x: 70, y: 44 },
  { key: 'dp', x: 50, y: 70 },
  { key: 'dkg', x: 10, y: 82 },
  { key: 'dk', x: 30, y: 82 },
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
    const d = Math.min(Math.abs(hueDeg - h), 360 - Math.abs(hueDeg - h));
    if (d < bestDist) {
      bestDist = d;
      best = hueNum;
    }
  }
  return best;
};

// CSS変数で wheel サイズを定義し、clamp() でビューポート幅に応じてスケールする。
// 各値は root container で `--wheel-size` から派生する。
const WHEEL_SIZE = 'var(--wheel-size)';
const WHEEL_RADIUS = 'calc(var(--wheel-size) * 0.36)';
const SWATCH_SIZE = 'calc(var(--wheel-size) * 0.20)';

type Computed = {
  hex: string;
  h: number;
  s: number;
  l: number;
};

const computeColor = (toneCode: ToneCode, hueNum: PccsHue | null): Computed => {
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
  isRecommended: (hueNum: PccsHue) => boolean;
  recommendActive: boolean;
}> = ({
  toneCode,
  dbTone,
  selectedToneCode,
  selectedHueNum,
  onSelect,
  isRecommended,
  recommendActive,
}) => {
  const isMissing = !dbTone;
  const isThisTone = selectedToneCode === toneCode;

  return (
    <div
      className="relative"
      style={{ width: WHEEL_SIZE, height: WHEEL_SIZE }}
      title={isMissing ? `${toneCode} (DB未登録)` : undefined}
    >
      <div className="absolute inset-0 rounded-full bg-base-100 border border-base-300 flex items-center justify-center pointer-events-none">
        <span className="text-xs sm:text-sm font-bold font-mono select-none">
          {toneCode}
        </span>
      </div>
      {TWELVE_HUES.map((hueNum) => {
        const angle = hueToAngleDeg(hueNum);
        const computed = computeColor(toneCode, hueNum);
        const isSelected = isThisTone && selectedHueNum === hueNum;
        const hueInfo = PCCS_HUES[hueNum];
        const dimmed = recommendActive && !isSelected && !isRecommended(hueNum);

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
            className={`absolute rounded-sm border transition-all ${
              isSelected
                ? 'ring-2 ring-primary ring-offset-1 z-10 scale-125'
                : 'border-base-300/50 hover:scale-110'
            } ${isMissing ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'} ${
              dimmed ? 'opacity-25 saturate-50' : ''
            }`}
            style={{
              width: SWATCH_SIZE,
              height: SWATCH_SIZE,
              backgroundColor: computed.hex,
              left: '50%',
              top: '50%',
              transform: `translate(-50%, -50%) rotate(${angle}deg) translateY(calc(-1 * ${WHEEL_RADIUS})) rotate(-${angle}deg)`,
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
  isRecommended: (code: AchromaticToneCode) => boolean;
  recommendActive: boolean;
}> = ({
  dbTonesByKey,
  selectedToneCode,
  onSelect,
  isRecommended,
  recommendActive,
}) => {
  return (
    <div className="flex flex-col gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg border border-base-300 bg-base-100 self-start">
      {ACHROMATIC_ORDER.map((code) => {
        const dbTone = dbTonesByKey.get(code);
        const t = PCCS_TONES[code];
        const computed = computeColor(code, null);
        const isSelected = selectedToneCode === code;
        const isMissing = !dbTone;
        const dimmed = recommendActive && !isSelected && !isRecommended(code);

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
            className={`flex flex-col items-center gap-1 transition-all ${
              isMissing ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'
            } ${dimmed ? 'opacity-30' : ''}`}
          >
            <div
              className={`rounded border-2 transition-all ${
                isSelected
                  ? 'border-primary ring-2 ring-primary ring-offset-1 scale-110'
                  : 'border-base-300 hover:scale-105'
              }`}
              style={{
                width: 'calc(var(--wheel-size) * 0.42)',
                height: 'calc(var(--wheel-size) * 0.42)',
                backgroundColor: computed.hex,
              }}
            />
            <span className="text-[9px] sm:text-[10px] font-mono">{code}</span>
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
  anchor = null,
  technique = null,
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

  // アンカー色を (toneCode, hueNum) 形式に正規化。
  const anchorCandidate = useMemo<{
    toneCode: ToneCode;
    hueNum: PccsHue | null;
  } | null>(() => {
    if (!anchor || !anchor.tone_id) return null;
    const t = dbTones.find((x) => x.id === anchor.tone_id);
    if (!t) return null;
    const code = t.key as ToneCode;
    if (!(code in PCCS_TONES)) return null;
    const hueNum = PCCS_TONES[code].isChromatic
      ? findNearestHueNum(anchor.h)
      : null;
    return { toneCode: code, hueNum };
  }, [anchor, dbTones]);

  const recommendActive = anchorCandidate !== null && technique !== null;

  const isRecommendedChromatic = useCallback(
    (toneCode: ChromaticToneCode, hueNum: PccsHue): boolean => {
      if (!anchorCandidate || !technique) return true;
      return isRecommendedSwatch(
        { toneCode, hueNum },
        anchorCandidate,
        technique,
      );
    },
    [anchorCandidate, technique],
  );

  const isRecommendedAchromatic = useCallback(
    (code: AchromaticToneCode): boolean => {
      if (!anchorCandidate || !technique) return true;
      return isRecommendedSwatch(
        { toneCode: code, hueNum: null },
        anchorCandidate,
        technique,
      );
    },
    [anchorCandidate, technique],
  );

  if (loading) {
    return <div className="text-center p-8">トーンを読み込み中...</div>;
  }
  if (error) {
    return <div className="alert alert-error text-sm">{error}</div>;
  }

  return (
    <div
      className="w-full max-w-3xl mx-auto"
      style={
        {
          '--wheel-size': 'clamp(56px, 11vw, 96px)',
        } as React.CSSProperties
      }
    >
      <div className="flex gap-2 sm:gap-4">
        <AchromaticColumn
          dbTonesByKey={dbTonesByKey}
          selectedToneCode={selectedToneCode}
          onSelect={onSelect}
          isRecommended={isRecommendedAchromatic}
          recommendActive={recommendActive}
        />

        <div className="relative flex-1" style={{ aspectRatio: '5 / 4' }}>
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
                isRecommended={(hueNum) => isRecommendedChromatic(key, hueNum)}
                recommendActive={recommendActive}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PccsToneWheel;
