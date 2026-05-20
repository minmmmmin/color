// 配色技法ルール(HueRule / ToneRule)を、PCCS の (色相番号, トーン) ペアに対して
// 「推奨できるかどうか」を判定する関数群。UI のヒント表示用。
//
// 厳密な配色判定(完成形の良し悪し)とは別に、ここでは
// 「アンカー色 1 つに対して候補色 1 つが技法のルールを満たすか」だけを見る。

import {
  PCCS_TONES,
  PCCS_HUE_COUNT,
  hueDistance,
  toneDistanceCategory,
  type PccsHue,
  type ToneCode,
} from './pccs';
import type { HueRule, ToneRule, Technique } from './types';

type Candidate = { toneCode: ToneCode; hueNum: PccsHue | null };

const isAchromatic = (toneCode: ToneCode): boolean =>
  !PCCS_TONES[toneCode].isChromatic;

/**
 * 色相ルールが満たされるか。
 * 無彩色は色相を持たないので、`any` 以外のルールでは false を返す。
 */
const evalHueRule = (
  candidate: Candidate,
  anchor: Candidate,
  rule: HueRule,
): boolean => {
  // 無彩色は色相ルールから外す(any 以外は推奨しない)。
  if (isAchromatic(candidate.toneCode) || isAchromatic(anchor.toneCode)) {
    return rule.kind === 'any';
  }
  if (candidate.hueNum === null || anchor.hueNum === null) {
    return rule.kind === 'any';
  }

  switch (rule.kind) {
    case 'any':
      return true;
    case 'diff_range': {
      const d = hueDistance(candidate.hueNum, anchor.hueNum);
      return d >= rule.min && d <= rule.max;
    }
    case 'equal_division': {
      // 色相環 24 を n 等分。aHue + k * 24/n を最も近い整数色相に丸めて一致を見る。
      const step = PCCS_HUE_COUNT / rule.n;
      for (let k = 0; k < rule.n; k++) {
        const targetRaw = (anchor.hueNum + k * step) % PCCS_HUE_COUNT;
        // PCCS 色相は 1..24。0 を 24 にラップ。
        const target =
          ((Math.round(targetRaw) - 1 + PCCS_HUE_COUNT) % PCCS_HUE_COUNT) + 1;
        if (target === candidate.hueNum) return true;
      }
      return false;
    }
    case 'split_complementary': {
      // 補色(diff = 12)の両隣 = diff 10 または 11 を許容。
      const d = hueDistance(candidate.hueNum, anchor.hueNum);
      return d === 10 || d === 11;
    }
    case 'natural_harmony':
    case 'complex_harmony': {
      // 色相×トーンの関係を見る複雑なルール。
      // ナチュラル: 黄に近い色相ほど明るく、青紫に近い色相ほど暗く。
      // コンプレックス: その逆。
      // 候補色相の「黄からの距離」と「明度」の関係をアンカーと比較する。
      const yellowHue = 8; // PCCS では 8:Y が最も明るい基準
      const dA = hueDistance(anchor.hueNum, yellowHue);
      const dC = hueDistance(candidate.hueNum, yellowHue);
      const lA = PCCS_TONES[anchor.toneCode].representativeL;
      const lC = PCCS_TONES[candidate.toneCode].representativeL;
      // 同位置/同明度は推奨対象に含む。
      if (rule.kind === 'natural_harmony') {
        return (dC > dA && lC <= lA) || (dC < dA && lC >= lA) || dC === dA;
      } else {
        return (dC > dA && lC >= lA) || (dC < dA && lC <= lA) || dC === dA;
      }
    }
    default: {
      const _exhaustive: never = rule;
      void _exhaustive;
      return true;
    }
  }
};

/**
 * トーンルールが満たされるか。
 * 既存の `toneDistanceCategory` を利用して same/similar/contrast を判定する。
 */
const evalToneRule = (
  candidate: Candidate,
  anchor: Candidate,
  rule: ToneRule,
): boolean => {
  switch (rule.kind) {
    case 'any':
      return true;
    case 'same':
      return candidate.toneCode === anchor.toneCode;
    case 'specific':
      return rule.tones.includes(candidate.toneCode);
    case 'similar': {
      const cat = toneDistanceCategory(candidate.toneCode, anchor.toneCode);
      return cat === 'same' || cat === 'similar';
    }
    case 'contrast': {
      const cat = toneDistanceCategory(candidate.toneCode, anchor.toneCode);
      return cat === 'contrast' || cat === 'lightness_contrast';
    }
    case 'lightness_contrast': {
      const cat = toneDistanceCategory(candidate.toneCode, anchor.toneCode);
      return cat === 'lightness_contrast';
    }
    default: {
      const _exhaustive: never = rule;
      void _exhaustive;
      return true;
    }
  }
};

/**
 * 候補色 (toneCode, hueNum) がアンカー色 + 技法に対して推奨できるかを返す。
 * hue/tone の両ルールを満たすときのみ true。
 */
export const isRecommendedSwatch = (
  candidate: Candidate,
  anchor: Candidate,
  technique: Technique,
): boolean => {
  return (
    evalHueRule(candidate, anchor, technique.hueRule) &&
    evalToneRule(candidate, anchor, technique.toneRule)
  );
};

/**
 * アンカー色がチャート上に存在しないとき(技法未選択、アンカー未確定など)に
 * 全候補を有効として扱うためのフラグ。
 */
export const noAnchorYet = (anchor: Candidate | null): anchor is null =>
  anchor === null;
