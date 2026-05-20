'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

type AttemptRow = {
  id: string;
  quiz_type: string;
  is_correct: boolean;
  created_at: string;
  correct_scheme: { display_name: string; key: string } | null;
  selected_scheme: { display_name: string } | null;
  palette: { id: string; title: string | null } | null;
};

const QuizHistoryPage = () => {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [authed, setAuthed] = useState<boolean>(true);
  const [attempts, setAttempts] = useState<AttemptRow[]>([]);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const load = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setAuthed(false);
        setLoading(false);
        return;
      }

      const { data, error: dbErr } = await supabase
        .from('quiz_attempts')
        .select(
          `
          id, quiz_type, is_correct, created_at,
          correct_scheme:schemes!quiz_attempts_correct_scheme_id_fkey(display_name, key),
          selected_scheme:schemes!quiz_attempts_selected_scheme_id_fkey(display_name),
          palette:palettes(id, title)
          `,
        )
        .order('created_at', { ascending: false })
        .limit(200);

      if (dbErr) {
        setError(dbErr.message);
      } else {
        setAttempts((data as unknown as AttemptRow[]) || []);
      }
      setLoading(false);
    };
    load();
  }, [supabase]);

  const summary = useMemo(() => {
    const total = attempts.length;
    const correct = attempts.filter((a) => a.is_correct).length;
    return {
      total,
      correct,
      accuracy: total === 0 ? 0 : Math.round((correct / total) * 100),
    };
  }, [attempts]);

  const handleClearAll = async () => {
    setDeleting(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setDeleting(false);
      return;
    }
    const { error: delErr } = await supabase
      .from('quiz_attempts')
      .delete()
      .eq('user_id', user.id);
    if (delErr) {
      setError(delErr.message);
    } else {
      setAttempts([]);
    }
    setDeleting(false);
    (
      document.getElementById('clear-history-modal') as HTMLDialogElement | null
    )?.close();
  };

  const byTechnique = useMemo(() => {
    const map = new Map<
      string,
      { name: string; total: number; correct: number }
    >();
    for (const a of attempts) {
      const key = a.correct_scheme?.key ?? 'unknown';
      const name = a.correct_scheme?.display_name ?? '(不明)';
      const entry = map.get(key) ?? { name, total: 0, correct: 0 };
      entry.total += 1;
      if (a.is_correct) entry.correct += 1;
      map.set(key, entry);
    }
    return [...map.values()].sort((a, b) => b.total - a.total);
  }, [attempts]);

  if (loading) {
    return (
      <main className="min-h-screen bg-base-200 p-8 text-center">
        <span className="loading loading-spinner loading-lg" />
      </main>
    );
  }
  if (!authed) {
    return (
      <main className="min-h-screen bg-base-200 p-8 text-center">
        <p className="mb-4">学習履歴を見るにはログインが必要です。</p>
        <Link href="/login" className="btn btn-primary">
          ログインページへ
        </Link>
      </main>
    );
  }
  if (error) {
    return (
      <main className="min-h-screen bg-base-200 p-8">
        <div className="alert alert-error">{error}</div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-base-200 p-4 sm:p-8">
      <div className="max-w-3xl mx-auto">
        <header className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">クイズ履歴</h1>
            <p className="text-sm text-base-content/70 mt-1">
              これまでの解答の通算成績と、最近の解答ログ。
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href="/quiz/technique" className="btn btn-primary btn-sm">
              クイズに挑戦
            </Link>
            <button
              type="button"
              className="btn btn-error btn-outline btn-sm"
              disabled={attempts.length === 0 || deleting}
              onClick={() =>
                (
                  document.getElementById(
                    'clear-history-modal',
                  ) as HTMLDialogElement | null
                )?.showModal()
              }
            >
              履歴を全消去
            </button>
            <Link href="/" className="btn btn-ghost btn-sm">
              ← ホーム
            </Link>
          </div>
        </header>

        <dialog id="clear-history-modal" className="modal">
          <div className="modal-box">
            <h3 className="font-bold text-lg">履歴を全消去しますか?</h3>
            <p className="py-3 text-sm">
              これまでの解答ログ ({attempts.length} 件)
              をすべて削除します。元に戻せません。
            </p>
            <div className="modal-action">
              <form method="dialog">
                <button className="btn btn-ghost">キャンセル</button>
              </form>
              <button
                type="button"
                className="btn btn-error"
                disabled={deleting}
                onClick={handleClearAll}
              >
                {deleting ? '削除中...' : '消去する'}
              </button>
            </div>
          </div>
          <form method="dialog" className="modal-backdrop">
            <button>close</button>
          </form>
        </dialog>

        <section className="grid grid-cols-3 gap-3 mb-8">
          <div className="card bg-base-100 shadow">
            <div className="card-body items-center text-center p-4">
              <p className="text-xs text-base-content/70">解答数</p>
              <p className="text-2xl font-bold">{summary.total}</p>
            </div>
          </div>
          <div className="card bg-base-100 shadow">
            <div className="card-body items-center text-center p-4">
              <p className="text-xs text-base-content/70">正解数</p>
              <p className="text-2xl font-bold">{summary.correct}</p>
            </div>
          </div>
          <div className="card bg-base-100 shadow">
            <div className="card-body items-center text-center p-4">
              <p className="text-xs text-base-content/70">正答率</p>
              <p className="text-2xl font-bold">{summary.accuracy}%</p>
            </div>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-lg font-semibold mb-3">技法別の成績</h2>
          {byTechnique.length === 0 ? (
            <p className="text-sm text-base-content/70">
              まだ解答がありません。
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="table table-sm">
                <thead>
                  <tr>
                    <th>技法</th>
                    <th className="text-right">正解</th>
                    <th className="text-right">解答</th>
                    <th className="text-right">正答率</th>
                  </tr>
                </thead>
                <tbody>
                  {byTechnique.map((t) => (
                    <tr key={t.name}>
                      <td>{t.name}</td>
                      <td className="text-right">{t.correct}</td>
                      <td className="text-right">{t.total}</td>
                      <td className="text-right">
                        {Math.round((t.correct / t.total) * 100)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-3">最近の解答 (最大200件)</h2>
          {attempts.length === 0 ? (
            <p className="text-sm text-base-content/70">
              まだ解答がありません。
            </p>
          ) : (
            <ul className="space-y-2">
              {attempts.slice(0, 50).map((a) => (
                <li
                  key={a.id}
                  className="card bg-base-100 shadow-sm card-compact"
                >
                  <div className="card-body flex-row items-center justify-between">
                    <div>
                      <p className="text-sm">
                        正解:{' '}
                        <span className="font-semibold">
                          {a.correct_scheme?.display_name ?? '(不明)'}
                        </span>
                        {!a.is_correct && a.selected_scheme && (
                          <>
                            {' / 回答: '}
                            <span className="text-error">
                              {a.selected_scheme.display_name}
                            </span>
                          </>
                        )}
                      </p>
                      <p className="text-xs text-base-content/60">
                        {new Date(a.created_at).toLocaleString('ja-JP')}
                        {a.palette?.title && ` · ${a.palette.title}`}
                      </p>
                    </div>
                    <span
                      className={`badge ${a.is_correct ? 'badge-success' : 'badge-error'}`}
                    >
                      {a.is_correct ? '○' : '×'}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
};

export default QuizHistoryPage;
