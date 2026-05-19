// 配色イメージのプリセット定義
// 色相は PCCS 色相番号(1-24)で持ち、トーンは pccs.ts の ToneCode を参照する。

import type { ImagePreset } from './types';

export const imagePresets: ImagePreset[] = [
  {
    id: 'casual',
    nameJa: 'カジュアル',
    keywords: ['明るい', '活発', '親しみやすい'],
    hueRange: {
      description: '黄〜橙系を中心に、対比する色相を組み合わせる',
      preferredHues: [5, 6, 7, 8], // O, yO, rY, Y
    },
    toneRange: {
      description: '明るめのトーンを中心に使う',
      tones: ['p', 'lt', 'b', 's', 'v'],
    },
  },
  {
    id: 'classic',
    nameJa: 'クラシック',
    keywords: ['重厚', '円熟', '伝統的'],
    hueRange: {
      description: '茶系・黄赤系・落ち着いた色相',
      preferredHues: [3, 4, 5, 6, 7, 8], // yR, rO, O, yO, rY, Y
    },
    toneRange: {
      description: '低明度・低彩度寄りのトーン',
      tones: ['g', 'd', 'dk', 'dkg'],
    },
  },
  {
    id: 'clear',
    nameJa: 'クリア',
    keywords: ['明るい', 'さわやか', '透明感'],
    hueRange: {
      description: '青系・青緑系を中心に使う',
      preferredHues: [14, 15, 16, 17, 18], // BG, gB, B
    },
    toneRange: {
      description: '高明度・明清色を中心に使う',
      tones: ['p', 'lt'],
    },
  },
  {
    id: 'chic',
    nameJa: 'シック',
    keywords: ['渋い', '洗練', '大人っぽい'],
    hueRange: {
      description: '青紫・青緑など寒色寄り',
      preferredHues: [14, 15, 19, 20, 21], // BG, pB, V, bP
    },
    toneRange: {
      description: '低彩度・暗めのトーン',
      tones: ['ltg', 'g', 'dk', 'dkg'],
    },
  },
  {
    id: 'dynamic',
    nameJa: 'ダイナミック',
    keywords: ['強い', 'はっきり', '派手'],
    hueRange: {
      description: '赤・黄・青など幅広い色相を使う',
      preferredHues: [2, 8, 17], // R, Y, B
    },
    toneRange: {
      description: '高彩度色と無彩色の強いコントラスト',
      tones: ['v', 'b', 's'],
    },
  },
  {
    id: 'modern',
    nameJa: 'モダン',
    keywords: ['現代的', '人工的', '都会的'],
    hueRange: {
      description: '青系を中心に、無彩色と組み合わせる',
      preferredHues: [16, 17, 18, 19], // B 系
    },
    toneRange: {
      description: '低彩度・無彩色・高コントラスト',
      tones: ['d', 'dp', 'ltg', 'sf', 'b', 's', 'v'],
    },
  },
  {
    id: 'warm_natural',
    nameJa: 'ウォームナチュラル',
    keywords: ['穏やか', '素朴', '温もり'],
    hueRange: {
      description: '黄〜黄緑〜緑系を中心に使う',
      preferredHues: [8, 9, 10, 11, 12], // Y, gY, YG, yG, G
    },
    toneRange: {
      description: '自然で穏やかな低〜中彩度トーン',
      tones: ['p', 'ltg', 'sf', 'd', 'dk', 'dp'],
    },
  },
  {
    id: 'fresh_natural',
    nameJa: 'フレッシュナチュラル',
    keywords: ['若々しい', '新鮮', 'さわやか'],
    hueRange: {
      description: '黄緑〜緑〜青緑系を中心に使う',
      preferredHues: [10, 11, 12, 13, 14], // YG, yG, G, bG, BG
    },
    toneRange: {
      description: '明るく軽いトーン',
      tones: ['p', 'lt', 'b'],
    },
  },
  {
    id: 'elegant',
    nameJa: 'エレガント',
    keywords: ['女性的', '気品', '優雅'],
    hueRange: {
      description: '紫〜赤紫系を中心に使う',
      preferredHues: [22, 23, 24], // P, rP, RP
    },
    toneRange: {
      description: '明るめ〜中明度、低〜中彩度',
      tones: ['p', 'lt', 'b', 'ltg'],
    },
  },
  {
    id: 'romantic',
    nameJa: 'ロマンチック',
    keywords: ['かわいい', '可憐', '愛らしい'],
    hueRange: {
      description: '赤紫〜赤〜黄みの色相',
      preferredHues: [24, 1, 2, 3, 4], // RP, pR, R, yR, rO
    },
    toneRange: {
      description: '淡く明るいトーン',
      tones: ['p', 'lt'],
    },
  },
];

export const imagePresetsById: Record<string, ImagePreset> = Object.fromEntries(
  imagePresets.map((p) => [p.id, p]),
);
