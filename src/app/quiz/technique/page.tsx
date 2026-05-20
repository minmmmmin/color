import React from 'react';
import Link from 'next/link';
import TechniqueQuiz from './TechniqueQuiz';

const TechniqueQuizPage = () => {
  return (
    <main className="min-h-screen bg-base-200 p-4 sm:p-8">
      <div className="max-w-3xl mx-auto">
        <header className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">技法あてクイズ</h1>
            <p className="text-sm text-base-content/70 mt-1">
              公式パレットから配色技法を4択で当てましょう。
            </p>
          </div>
          <div className="flex gap-2">
            <Link href="/quiz/history" className="btn btn-ghost btn-sm">
              履歴
            </Link>
            <Link href="/" className="btn btn-ghost btn-sm">
              ← ホーム
            </Link>
          </div>
        </header>

        <TechniqueQuiz />
      </div>
    </main>
  );
};

export default TechniqueQuizPage;
