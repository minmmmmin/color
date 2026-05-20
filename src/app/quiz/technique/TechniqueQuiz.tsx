'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import PalettePreviewBar from '@/components/PalettePreviewBar';
import type { Scheme } from '@/types/palette';

type PaletteColor = {
  hex: string;
  role: string;
  ratio: number | null;
};

type OfficialPalette = {
  id: string;
  title: string | null;
  scheme_id: string;
  palette_colors: PaletteColor[];
};

type Question = {
  palette: OfficialPalette;
  correctScheme: Scheme;
  choices: Scheme[]; // includes correct
};

const QUESTIONS_PER_SESSION = 10;
const CHOICES_PER_QUESTION = 4;

const shuffle = <T,>(arr: T[]): T[] => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

const buildQuestions = (
  palettes: OfficialPalette[],
  schemes: Scheme[],
): Question[] => {
  const schemesById = new Map(schemes.map((s) => [s.id, s]));
  const picked = shuffle(palettes).slice(0, QUESTIONS_PER_SESSION);

  return picked.flatMap<Question>((p) => {
    const correct = schemesById.get(p.scheme_id);
    if (!correct) return [];
    const distractors = shuffle(
      schemes.filter((s) => s.id !== correct.id),
    ).slice(0, CHOICES_PER_QUESTION - 1);
    const choices = shuffle([correct, ...distractors]);
    return [{ palette: p, correctScheme: correct, choices }];
  });
};

const TechniqueQuiz: React.FC = () => {
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);

  const [index, setIndex] = useState(0);
  const [selectedSchemeId, setSelectedSchemeId] = useState<string | null>(null);
  const [revealedCount, setRevealedCount] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchInitial = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUserId(user?.id ?? null);

      const [{ data: palettesData, error: pErr }, { data: schemesData, error: sErr }] =
        await Promise.all([
          supabase
            .from('palettes')
            .select(
              'id, title, scheme_id, palette_colors(hex, role, ratio)',
            )
            .eq('is_official', true),
          supabase.from('schemes').select('*'),
        ]);

      if (pErr || sErr) {
        setError(pErr?.message || sErr?.message || '読み込みに失敗しました');
        setLoading(false);
        return;
      }

      const palettes = (palettesData as OfficialPalette[]) || [];
      const schemes = (schemesData as Scheme[]) || [];

      if (palettes.length === 0 || schemes.length < CHOICES_PER_QUESTION) {
        setError('クイズ用の公式パレットまたは技法が不足しています。');
        setLoading(false);
        return;
      }

      setQuestions(buildQuestions(palettes, schemes));
      setLoading(false);
    };
    fetchInitial();
  }, [supabase]);

  const current = questions[index] ?? null;
  const isRevealed = current !== null && revealedCount > index;
  const isFinished = revealedCount >= questions.length && questions.length > 0;

  const handleSelect = async (schemeId: string) => {
    if (!current || isRevealed || submitting) return;
    setSubmitting(true);
    setSelectedSchemeId(schemeId);
    const correct = schemeId === current.correctScheme.id;
    setRevealedCount((c) => c + 1);
    if (correct) setCorrectCount((c) => c + 1);

    if (userId) {
      const { error: insertError } = await supabase
        .from('quiz_attempts')
        .insert({
          user_id: userId,
          quiz_type: 'technique_guess',
          palette_id: current.palette.id,
          correct_scheme_id: current.correctScheme.id,
          selected_scheme_id: schemeId,
          is_correct: correct,
        });
      if (insertError) {
        console.error('クイズ結果保存失敗:', insertError);
      }
    }
    setSubmitting(false);
  };

  const handleNext = () => {
    setSelectedSchemeId(null);
    setIndex((i) => i + 1);
  };

  const handleRestart = () => {
    setIndex(0);
    setSelectedSchemeId(null);
    setRevealedCount(0);
    setCorrectCount(0);
    setLoading(true);
    // 同一セッションで再シャッフル
    setTimeout(() => {
      setQuestions((qs) => shuffle(qs));
      setLoading(false);
    }, 0);
  };

  const accuracy = useMemo(() => {
    if (revealedCount === 0) return 0;
    return Math.round((correctCount / revealedCount) * 100);
  }, [correctCount, revealedCount]);

  if (loading) {
    return (
      <div className="text-center p-12">
        <span className="loading loading-spinner loading-lg" />
      </div>
    );
  }
  if (error) {
    return <div className="alert alert-error">{error}</div>;
  }
  if (!userId) {
    return (
      <div className="text-center p-12">
        <p className="mb-4">クイズに挑戦するにはログインが必要です。</p>
        <Link href="/login" className="btn btn-primary">
          ログインページへ
        </Link>
      </div>
    );
  }

  if (isFinished) {
    return (
      <div className="card bg-base-100 shadow-lg max-w-xl mx-auto">
        <div className="card-body items-center text-center">
          <h2 className="card-title text-2xl">結果</h2>
          <p className="text-5xl font-bold my-4">
            {correctCount} / {questions.length}
            <span className="text-xl text-base-content/70 ml-2">
              ({accuracy}%)
            </span>
          </p>
          <div className="card-actions">
            <button onClick={handleRestart} className="btn btn-primary">
              もう一度
            </button>
            <Link href="/quiz/history" className="btn btn-ghost">
              履歴を見る
            </Link>
            <Link href="/" className="btn btn-ghost">
              ホームへ
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!current) return null;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex justify-between items-center text-sm text-base-content/70">
        <span>
          問題 {index + 1} / {questions.length}
        </span>
        <span>
          正解 {correctCount} / {revealedCount}
          {revealedCount > 0 && ` (${accuracy}%)`}
        </span>
      </div>

      <div className="card bg-base-100 shadow">
        <div className="card-body">
          <h2 className="card-title text-lg">この配色は何の技法でしょう?</h2>
          <PalettePreviewBar colors={current.palette.palette_colors ?? []} />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {current.choices.map((scheme) => {
          const isCorrect = scheme.id === current.correctScheme.id;
          const isPicked = scheme.id === selectedSchemeId;
          let cls = 'btn justify-start text-left h-auto py-3';
          if (isRevealed) {
            if (isCorrect) cls += ' btn-success';
            else if (isPicked) cls += ' btn-error';
            else cls += ' btn-outline opacity-60';
          } else {
            cls += isPicked ? ' btn-primary' : ' btn-outline';
          }
          return (
            <button
              key={scheme.id}
              type="button"
              disabled={isRevealed || submitting}
              onClick={() => handleSelect(scheme.id)}
              className={cls}
            >
              {scheme.display_name}
            </button>
          );
        })}
      </div>

      {isRevealed && (
        <div className="alert">
          <div>
            <p className="font-semibold">
              {selectedSchemeId === current.correctScheme.id
                ? '正解!'
                : `不正解 — 正解は「${current.correctScheme.display_name}」`}
            </p>
            {current.palette.title && (
              <p className="text-sm text-base-content/70 mt-1">
                出題パレット: {current.palette.title}
              </p>
            )}
          </div>
          <button onClick={handleNext} className="btn btn-primary">
            {index + 1 < questions.length ? '次へ' : '結果を見る'}
          </button>
        </div>
      )}
    </div>
  );
};

export default TechniqueQuiz;
