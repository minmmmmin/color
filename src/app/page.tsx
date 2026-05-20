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
  // パレットの所有者フィルタ: '' = 全て, 'official' = 公式, 'personal' = 自分のみ
  const [ownerFilter, setOwnerFilter] = useState<'' | 'official' | 'personal'>(
    '',
  );

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
          user_id,
          created_at,
          schemes!inner (display_name, category),
          palette_colors (palette_id, hex, role)
        `,
        )
        .order('created_at', { ascending: false });

      if (filter) {
        query = query.eq('schemes.category', filter);
      }

      if (ownerFilter === 'official') {
        query = query.eq('is_official', true);
      } else if (ownerFilter === 'personal') {
        if (!user) {
          setPalettes([]);
          setLoading(false);
          return;
        }
        query = query.eq('user_id', user.id).eq('is_official', false);
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
  }, [filter, ownerFilter, supabase, user]);

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
          <div className="flex flex-row justify-between items-center gap-4">
            <div className="min-w-0">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold truncate font-yusei">
                Chromalab
              </h1>
              <p className="text-sm sm:text-base md:text-lg text-base-content/70 mt-1">
                自分だけのカラーパレットを作ろう
              </p>
            </div>

            {/* Desktop nav (lg+) */}
            <nav className="hidden lg:flex items-center gap-2">
              {isLoadingUser ? (
                <span className="loading loading-spinner loading-sm" />
              ) : user ? (
                <>
                  <span className="text-sm font-medium">{user.email}</span>
                  <button onClick={handleSignOut} className="btn btn-sm">
                    ログアウト
                  </button>
                </>
              ) : (
                <Link href="/login" className="btn btn-primary btn-sm">
                  ログイン
                </Link>
              )}
              <Link href="/usage" className="btn btn-info">
                使い方
              </Link>
              <Link href="/images" className="btn">
                配色イメージ
              </Link>
              <Link href="/quiz/technique" className="btn btn-accent">
                クイズ
              </Link>
              <Link href="/palettes/new" className="btn btn-secondary">
                ＋ 新しく作る
              </Link>
            </nav>

            {/* Mobile hamburger (<lg) */}
            <div className="lg:hidden dropdown dropdown-end">
              <div
                tabIndex={0}
                role="button"
                aria-label="メニューを開く"
                className="btn btn-ghost btn-square"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </div>
              <ul
                tabIndex={0}
                className="menu menu-md dropdown-content bg-base-100 rounded-box z-30 mt-3 w-60 p-2 shadow-lg border border-base-300"
              >
                <li>
                  <Link href="/usage">使い方</Link>
                </li>
                <li>
                  <Link href="/images">配色イメージ</Link>
                </li>
                <li>
                  <Link href="/quiz/technique" className="text-accent">
                    クイズに挑戦
                  </Link>
                </li>
                {user && (
                  <li>
                    <Link href="/quiz/history">クイズ履歴</Link>
                  </li>
                )}
                <div className="divider my-1" />
                {isLoadingUser ? (
                  <li>
                    <span>
                      <span className="loading loading-spinner loading-sm" />
                    </span>
                  </li>
                ) : user ? (
                  <>
                    <li className="menu-title">
                      <span className="text-xs break-all">{user.email}</span>
                    </li>
                    <li>
                      <button onClick={handleSignOut}>ログアウト</button>
                    </li>
                  </>
                ) : (
                  <li>
                    <Link href="/login">ログイン</Link>
                  </li>
                )}
              </ul>
            </div>
          </div>

          {/* New Filters */}
          <div className="mt-8 flex flex-col sm:flex-row gap-4 sm:items-end">
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

            <div className="form-control w-full sm:w-64">
              <label className="label">
                <span className="label-text">作成者で絞り込み</span>
              </label>
              <div className="join">
                <button
                  type="button"
                  className={`btn join-item btn-sm sm:btn-md ${ownerFilter === '' ? 'btn-active btn-primary' : ''}`}
                  onClick={() => setOwnerFilter('')}
                >
                  全て
                </button>
                <button
                  type="button"
                  className={`btn join-item btn-sm sm:btn-md ${ownerFilter === 'official' ? 'btn-active btn-primary' : ''}`}
                  onClick={() => setOwnerFilter('official')}
                >
                  公式
                </button>
                <button
                  type="button"
                  className={`btn join-item btn-sm sm:btn-md ${ownerFilter === 'personal' ? 'btn-active btn-primary' : ''}`}
                  onClick={() => setOwnerFilter('personal')}
                  disabled={!user}
                  title={!user ? 'ログインが必要です' : undefined}
                >
                  自分のみ
                </button>
              </div>
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

      {/* モバイル専用 FAB: ＋新しく作る (lg 以上ではヘッダーに統合されているため非表示) */}
      {user && (
        <Link
          href="/palettes/new"
          aria-label="新しい配色を作る"
          className="lg:hidden btn btn-secondary btn-circle btn-lg shadow-xl fixed bottom-6 right-6 z-20"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-7 w-7"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 4v16m8-8H4"
            />
          </svg>
        </Link>
      )}
    </main>
  );
};

export default HomePage;
