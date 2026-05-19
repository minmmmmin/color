import React from 'react';
import Link from 'next/link';
import { imagePresets } from '@/lib/scheme/imagePresets';
import {
  PCCS_HUES,
  PCCS_TONES,
  type PccsHue,
  type ToneCode,
} from '@/lib/scheme/pccs';
import { hslToHex } from '@/lib/color';

const ImagesPage = () => {
  return (
    <main className="min-h-screen bg-base-200 p-4 sm:p-8">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold">配色イメージ</h1>
            <p className="text-base-content/70 mt-1">
              色彩検定2級で扱う代表的な配色イメージ。好まれる色相とトーンで印象を作ります。
            </p>
          </div>
          <Link href="/" className="btn btn-ghost">
            ← ホーム
          </Link>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {imagePresets.map((preset) => (
            <article
              key={preset.id}
              className="card bg-base-100 shadow-md hover:shadow-lg transition-shadow"
            >
              <div className="card-body">
                <h2 className="card-title text-xl">{preset.nameJa}</h2>

                <div className="flex flex-wrap gap-1 mb-3">
                  {preset.keywords.map((k) => (
                    <span key={k} className="badge badge-outline badge-sm">
                      {k}
                    </span>
                  ))}
                </div>

                <section className="mb-4">
                  <p className="text-sm font-semibold mb-1">好まれる色相</p>
                  <p className="text-xs text-base-content/70 mb-2">
                    {preset.hueRange.description}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {preset.hueRange.preferredHues.map((h) => {
                      const hue = PCCS_HUES[h as PccsHue];
                      const color = hslToHex(hue.representativeHue, 80, 55);
                      return (
                        <div
                          key={h}
                          className="flex flex-col items-center"
                          title={`${h}: ${hue.nameJa}`}
                        >
                          <div
                            className="w-10 h-10 rounded-full border border-base-300"
                            style={{ backgroundColor: color }}
                          />
                          <span className="text-[10px] mt-1 font-mono">
                            {h}:{hue.code}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </section>

                <section>
                  <p className="text-sm font-semibold mb-1">好まれるトーン</p>
                  <p className="text-xs text-base-content/70 mb-2">
                    {preset.toneRange.description}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {preset.toneRange.tones.map((t) => {
                      const tone = PCCS_TONES[t as ToneCode];
                      const color = hslToHex(
                        0,
                        tone.representativeS,
                        tone.representativeL,
                      );
                      return (
                        <div
                          key={t}
                          className="flex flex-col items-center"
                          title={tone.nameJa}
                        >
                          <div
                            className="w-12 h-10 rounded border border-base-300"
                            style={{ backgroundColor: color }}
                          />
                          <span className="text-[10px] mt-1 font-mono">
                            {t}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </section>
              </div>
            </article>
          ))}
        </div>
      </div>
    </main>
  );
};

export default ImagesPage;
