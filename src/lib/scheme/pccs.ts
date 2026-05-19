// PCCS(Practical Color Co-ordinate System)の定数定義
// 色彩検定2級で扱う24色相環と17トーンを管理する

/**
 * PCCS色相番号(1〜24)。
 * 1:pR(紫みの赤) から始まり時計回りに 24:RP(赤紫) まで。
 */
export type PccsHue =
  | 1
  | 2
  | 3
  | 4
  | 5
  | 6
  | 7
  | 8
  | 9
  | 10
  | 11
  | 12
  | 13
  | 14
  | 15
  | 16
  | 17
  | 18
  | 19
  | 20
  | 21
  | 22
  | 23
  | 24;

export const PCCS_HUE_COUNT = 24 as const;

/**
 * PCCS色相環の各色相に対する代表 HSL の Hue 値(0-360)と日本語名。
 * Hue値は色相環24等分(15度刻み)を基準にしているが、実際の見えに合わせて微調整している。
 */
export const PCCS_HUES: Record<
  PccsHue,
  { code: string; nameJa: string; representativeHue: number }
> = {
  1: { code: 'pR', nameJa: '紫みの赤', representativeHue: 350 },
  2: { code: 'R', nameJa: '赤', representativeHue: 0 },
  3: { code: 'yR', nameJa: '黄みの赤', representativeHue: 15 },
  4: { code: 'rO', nameJa: '赤みの橙', representativeHue: 25 },
  5: { code: 'O', nameJa: '橙', representativeHue: 35 },
  6: { code: 'yO', nameJa: '黄みの橙', representativeHue: 45 },
  7: { code: 'rY', nameJa: '赤みの黄', representativeHue: 55 },
  8: { code: 'Y', nameJa: '黄', representativeHue: 60 },
  9: { code: 'gY', nameJa: '緑みの黄', representativeHue: 75 },
  10: { code: 'YG', nameJa: '黄緑', representativeHue: 90 },
  11: { code: 'yG', nameJa: '黄みの緑', representativeHue: 120 },
  12: { code: 'G', nameJa: '緑', representativeHue: 140 },
  13: { code: 'bG', nameJa: '青みの緑', representativeHue: 165 },
  14: { code: 'BG', nameJa: '青緑', representativeHue: 180 },
  15: { code: 'BG', nameJa: '青みの青緑', representativeHue: 195 },
  16: { code: 'gB', nameJa: '緑みの青', representativeHue: 210 },
  17: { code: 'B', nameJa: '青', representativeHue: 220 },
  18: { code: 'B', nameJa: '紫みの青', representativeHue: 235 },
  19: { code: 'pB', nameJa: '紫みの青', representativeHue: 250 },
  20: { code: 'V', nameJa: '青紫', representativeHue: 270 },
  21: { code: 'bP', nameJa: '青みの紫', representativeHue: 285 },
  22: { code: 'P', nameJa: '紫', representativeHue: 300 },
  23: { code: 'rP', nameJa: '赤みの紫', representativeHue: 320 },
  24: { code: 'RP', nameJa: '赤紫', representativeHue: 335 },
};

/**
 * PCCS有彩色トーンのキー。
 */
export type ChromaticToneCode =
  | 'v' // vivid
  | 's' // strong
  | 'b' // bright
  | 'p' // pale
  | 'lt' // light
  | 'sf' // soft
  | 'd' // dull
  | 'dp' // deep
  | 'dk' // dark
  | 'ltg' // light grayish
  | 'g' // grayish
  | 'dkg'; // dark grayish

/**
 * PCCS無彩色トーンのキー。
 */
export type AchromaticToneCode = 'W' | 'ltGy' | 'mGy' | 'dkGy' | 'Bk';

export type ToneCode = ChromaticToneCode | AchromaticToneCode;

/**
 * 各トーンの代表 HSL(S/L は 0-100 のパーセント)と日本語名。
 * 配色生成・判定でトーンの距離を計算するための基準値として使う。
 */
export const PCCS_TONES: Record<
  ToneCode,
  {
    nameJa: string;
    isChromatic: boolean;
    representativeS: number;
    representativeL: number;
  }
> = {
  v: {
    nameJa: 'ビビッド',
    isChromatic: true,
    representativeS: 95,
    representativeL: 50,
  },
  s: {
    nameJa: 'ストロング',
    isChromatic: true,
    representativeS: 75,
    representativeL: 50,
  },
  b: {
    nameJa: 'ブライト',
    isChromatic: true,
    representativeS: 70,
    representativeL: 65,
  },
  p: {
    nameJa: 'ペール',
    isChromatic: true,
    representativeS: 35,
    representativeL: 85,
  },
  lt: {
    nameJa: 'ライト',
    isChromatic: true,
    representativeS: 55,
    representativeL: 75,
  },
  sf: {
    nameJa: 'ソフト',
    isChromatic: true,
    representativeS: 40,
    representativeL: 60,
  },
  d: {
    nameJa: 'ダル',
    isChromatic: true,
    representativeS: 35,
    representativeL: 50,
  },
  dp: {
    nameJa: 'ディープ',
    isChromatic: true,
    representativeS: 80,
    representativeL: 35,
  },
  dk: {
    nameJa: 'ダーク',
    isChromatic: true,
    representativeS: 65,
    representativeL: 30,
  },
  ltg: {
    nameJa: 'ライトグレイッシュ',
    isChromatic: true,
    representativeS: 20,
    representativeL: 70,
  },
  g: {
    nameJa: 'グレイッシュ',
    isChromatic: true,
    representativeS: 15,
    representativeL: 50,
  },
  dkg: {
    nameJa: 'ダークグレイッシュ',
    isChromatic: true,
    representativeS: 15,
    representativeL: 25,
  },
  W: {
    nameJa: 'ホワイト',
    isChromatic: false,
    representativeS: 0,
    representativeL: 95,
  },
  ltGy: {
    nameJa: 'ライトグレイ',
    isChromatic: false,
    representativeS: 0,
    representativeL: 75,
  },
  mGy: {
    nameJa: 'ミディアムグレイ',
    isChromatic: false,
    representativeS: 0,
    representativeL: 50,
  },
  dkGy: {
    nameJa: 'ダークグレイ',
    isChromatic: false,
    representativeS: 0,
    representativeL: 25,
  },
  Bk: {
    nameJa: 'ブラック',
    isChromatic: false,
    representativeS: 0,
    representativeL: 10,
  },
};

/**
 * 色相環上の2点間の最短距離(色相差)。0〜12 の整数を返す。
 * 例: hueDistance(2, 14) === 12(補色), hueDistance(1, 24) === 1(隣接)
 */
export const hueDistance = (a: PccsHue, b: PccsHue): number => {
  const raw = Math.abs(a - b);
  return Math.min(raw, PCCS_HUE_COUNT - raw);
};

/**
 * トーン同士の距離をざっくり評価する。
 * 同一: 0、近い: 1、明度差大: 2、対照: 3 を返す簡易ヒューリスティック。
 * 詳細な判定が必要な場合は呼び出し側で representativeS/L を直接見ること。
 */
export const toneDistanceCategory = (
  a: ToneCode,
  b: ToneCode,
): 'same' | 'similar' | 'lightness_contrast' | 'contrast' => {
  if (a === b) return 'same';
  const ta = PCCS_TONES[a];
  const tb = PCCS_TONES[b];
  const dS = Math.abs(ta.representativeS - tb.representativeS);
  const dL = Math.abs(ta.representativeL - tb.representativeL);

  if (ta.isChromatic && tb.isChromatic && dS <= 20 && dL <= 15) {
    return 'similar';
  }
  if (dS <= 25 && dL >= 30) return 'lightness_contrast';
  return 'contrast';
};
