// 配色技法のルール表現に使う型定義
// 「色相差」「トーン関係」を discriminated union で持ち、
// 判定エンジン(matcher)と生成エンジン(generator)から共通利用する。

import type { ToneCode } from './pccs';

/**
 * 配色技法の上位分類。UIのグルーピングや学習導線に使う。
 */
export type SchemeCategory =
  | 'hue_diff' // 色相差ベース(同一/隣接/類似/中差/対照/補色)
  | 'tone_diff' // トーン差ベース(同一/類似/対照トーン)
  | 'dominant' // 共通項配色(ドミナントカラー/トーン)
  | 'tone_combo' // トーン組み合わせ(トーンオントーン/イントーン/トーナル)
  | 'nuance' // 微差配色(カマイユ/フォカマイユ)
  | 'harmony' // 色相-トーン関係(ナチュラル/コンプレックス)
  | 'n_colors' // 色数指定(ビコロール/トリコロール)
  | 'wheel_division' // 色相環n等分(ダイアード〜ヘクサード、スプリットコンプリ)
  | 'adjustment'; // 調整技法(アクセント/セパレーション/グラデーション)

/**
 * 色相ルール。
 * - diff_range: 色相環上の差を min..max で許容
 * - equal_division: 色相環を n 等分
 * - split_complementary: 補色の両隣
 * - natural_harmony: 黄に近い色相ほど明、青紫に近い色相ほど暗
 * - complex_harmony: ナチュラルの逆
 * - any: 色相は問わない
 */
export type HueRule =
  | { kind: 'diff_range'; min: number; max: number }
  | { kind: 'equal_division'; n: 2 | 3 | 4 | 5 | 6 }
  | { kind: 'split_complementary' }
  | { kind: 'natural_harmony' }
  | { kind: 'complex_harmony' }
  | { kind: 'any' };

/**
 * トーンルール。
 * - same: 全色同一トーン
 * - similar: 近いトーン(明度・彩度の差が小さい)
 * - contrast: 明度または彩度の差が大きい組み合わせ
 * - lightness_contrast: 同一色相での明度差を重視(トーンオントーン)
 * - specific: 特定のトーン集合からのみ選ぶ
 * - any: トーンは問わない
 */
export type ToneRule =
  | { kind: 'same' }
  | { kind: 'similar' }
  | { kind: 'contrast' }
  | { kind: 'lightness_contrast' }
  | { kind: 'specific'; tones: ToneCode[] }
  | { kind: 'any' };

/**
 * 配色生成・判定での優先度。UIや学習導線で目立たせるかの指標。
 */
export type GenerationPriority = 'high' | 'medium' | 'low';

/**
 * 配色技法の宣言定義。色数・色相ルール・トーンルール・印象を保持する。
 * 判定関数からはこの定義をそのまま参照し、kind に応じてロジックを分岐する。
 */
export type Technique = {
  id: string;
  nameJa: string;
  category: SchemeCategory;
  colorCount: { min: number; max: number };
  hueRule: HueRule;
  toneRule: ToneRule;
  description: string;
  impression: string[];
  generationPriority: GenerationPriority;
};

/**
 * 調整技法。ベース配色に対して後から適用する操作として表現する。
 * - accent: 1色を強い対比で差し込む
 * - separation: 無彩色で区切る
 * - gradation: 段階的に変化させる
 */
export type AdjustmentKind = 'accent' | 'separation' | 'gradation';

export type AdjustmentTechnique = {
  id: AdjustmentKind;
  nameJa: string;
  description: string;
  impression: string[];
};

/**
 * 配色イメージのプリセット定義。
 * 色相群・トーン群を「好まれる傾向」として持ち、判定・生成の両方で利用する。
 */
export type ImagePreset = {
  id: string;
  nameJa: string;
  keywords: string[];
  hueRange: {
    description: string;
    /** PCCS色相番号の集合(空配列なら色相は問わない) */
    preferredHues: number[];
  };
  toneRange: {
    description: string;
    tones: ToneCode[];
  };
};
