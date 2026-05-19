'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Palette, SchemeCategory } from '@/types/palette';
import PaletteCard, { PaletteCardProps } from '@/components/PaletteCard';
import { useAuth } from '@/context/AuthContext';

const schemeCategories: { value: SchemeCategory; label: string }[] = [
  { value: 'hue_diff', label: '色相差ベース' },
  { value: 'tone_diff', label: 'トーン差ベース' },
  { value: 'dominant', label: 'ドミナント配色' },
  { value: 'tone_combo', label: 'トーン組み合わせ' },
  { value: 'nuance', label: '微差配色(カマイユ系)' },
  { value: 'harmony', label: 'ハーモニー' },
  { value: 'n_colors', label: 'ビコロール/トリコロール' },
  { value: 'wheel_division', label: '色相環n等分配色' },
  { value: 'adjustment', label: '調整技法' },
];

const schemeLabelMap: Record<SchemeCategory, string> = {
  hue_diff: '色相差',
  tone_diff: 'トーン差',
  dominant: 'ドミナント',
  tone_combo: 'トーン組合せ',
  nuance: '微差配色',
  harmony: 'ハーモニー',
  n_colors: 'ビ/トリコロール',
  wheel_division: '色相環n等分',
  adjustment: '調整技法',
};

const HomePage = () => {
  const supabase = createClient();

  const [palettes, setPalettes] = useState<Palette[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Auth State from Context
  const { user, loading: isLoadingUser, signOut } = useAuth();

  // Handlers
  const handleSignOut = () => {
    (document.getElementById('logout-modal') as HTMLDialogElement)?.showModal();
  };

  // Filter state using the new enum values
  const [filter, setFilter] = useState<string>(''); // Empty string for "All"

  // Fetch palettes based on the filter
  useEffect(() => {
    const fetchPalettes = async () => {
      setLoading(true);
      setError(null);

      let query = supabase
        .from('palettes')
        .select(
          `
          id,
          title,
          scheme_id,
          is_official,
          created_at,
          schemes!inner (display_name, category),
          palette_colors (palette_id, hex, role)
        `,
        )
        .order('created_at', { ascending: false });

      if (filter) {
        query = query.eq('schemes.category', filter);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) {
        setError(fetchError.message);
      } else {
        setPalettes(data as unknown as Palette[]);
      }
      setLoading(false);
    };

    fetchPalettes();
  }, [filter, supabase]);

  // Map palettes to card props using the new label map
  const paletteCards: PaletteCardProps[] = useMemo(() => {
    return palettes.map((p) => ({
      id: p.id,
      title: p.title,
      schemeName:
        p.schemes?.display_name ??
        (p.schemes?.category ? schemeLabelMap[p.schemes.category] : ''),
      isOfficial: p.is_official,
      colors: p.palette_colors ?? [],
      createdAt: p.created_at,
    }));
  }, [palettes]);

  return (
    <main className="min-h-screen bg-base-200 p-4 sm:p-8 md:p-12">
      <dialog id="logout-modal" className="modal">
        <div className="modal-box">
          <h3 className="font-bold text-lg">ログアウト</h3>
          <p className="py-4">本当にログアウトしますか？</p>
          <div className="modal-action">
            <form method="dialog">
              <button className="btn btn-ghost mr-2">キャンセル</button>
            </form>
            <button
              className="btn btn-error"
              onClick={async () => {
                (
                  document.getElementById('logout-modal') as HTMLDialogElement
                )?.close();
                await signOut();
              }}
            >
              ログアウト
            </button>
          </div>
        </div>
        <form method="dialog" className="modal-backdrop">
          <button>close</button>
        </form>
      </dialog>
      <div className="max-w-7xl mx-auto">
        <header className="mb-8 md:mb-12">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div>
              <h1 className="text-4xl sm:text-5xl font-bold">Chromalab</h1>
              <p className="text-lg text-base-content/70 mt-1">
                自分だけのカラーパレットを作ろう
              </p>
            </div>

            {/* Auth Buttons / User Info */}
            <div className="flex items-center gap-2">
              {isLoadingUser ? (
                <span className="loading loading-spinner loading-sm"></span>
              ) : user ? (
                <>
                  <span className="text-sm font-medium hidden sm:block">
                    {user.email}
                  </span>
                  <button onClick={handleSignOut} className="btn btn-sm">
                    ログアウト
                  </button>
                </>
              ) : (
                <Link href="/login" className="btn btn-primary btn-sm">
                  ログイン
                </Link>
              )}
              <Link href="/usage" className="btn btn-info btn-md">
                使い方
              </Link>
              <Link href="/palettes/new" className="btn btn-secondary btn-md">
                ＋ 新しく作る
              </Link>
            </div>
          </div>

          {/* New Filters */}
          <div className="mt-8 flex flex-col sm:flex-row gap-4">
            <div className="form-control w-full sm:w-64">
              <label className="label">
                <span className="label-text">カテゴリで絞り込み</span>
              </label>
              <select
                className="select select-bordered"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              >
                <option value="">全て</option>
                {schemeCategories.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </header>

        {loading ? (
          <div className="text-center">
            <span className="loading loading-spinner loading-lg"></span>
          </div>
        ) : error ? (
          <div className="alert alert-error">{error}</div>
        ) : paletteCards.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-xl">まだパレットがありません。</p>
            <p className="mt-2 text-base-content/70">
              最初のパレットを作ってみましょう！
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paletteCards.map((palette) => (
              <Link
                key={palette.id}
                href={`/palettes/${palette.id}`}
                className="block"
              >
                <PaletteCard {...palette} />
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
};

export default HomePage;
