import Image from 'next/image';
import Link from 'next/link';

function StepCard({
  n,
  title,
  desc,
  bullets,
  imageSrc,
  imageAlt,
  imageRight = true,
  priority = false,
}: {
  n: number;
  title: string;
  desc: string;
  bullets: string[];
  imageSrc?: string;
  imageAlt?: string;
  imageRight?: boolean;
  priority?: boolean;
}) {
  const text = (
    <div>
      <div className="flex items-center gap-3 mb-3">
        <div className="badge badge-primary badge-lg">{n}</div>
        <h2 className="text-2xl sm:text-3xl font-semibold">{title}</h2>
      </div>

      <p className="text-base leading-relaxed text-base-content/80 mb-4">
        {desc}
      </p>

      <ul className="list-disc list-inside ml-4 space-y-2 text-base-content/80">
        {bullets.map((b, i) => (
          <li key={i}>{b}</li>
        ))}
      </ul>
    </div>
  );

  const image = imageSrc && imageAlt && (
    <div className="rounded-2xl border border-base-300 bg-base-100 shadow-sm overflow-hidden">
      <div className="bg-base-200 group">
        <Image
          src={imageSrc}
          alt={imageAlt}
          width={1200}
          height={800}
          className="w-full h-auto transition-transform duration-300 group-hover:scale-105"
          sizes="(min-width: 1024px) 50vw, 100vw"
          priority={priority}
        />
      </div>
    </div>
  );

  return (
    <section className="mb-10">
      <div
        className={`grid gap-6 ${image ? 'lg:grid-cols-2' : 'lg:grid-cols-1'}`}
      >
        {imageRight ? (
          <>
            {text}
            {image}
          </>
        ) : (
          <>
            {image}
            {text}
          </>
        )}
      </div>
    </section>
  );
}

export default function UsagePage() {
  return (
    <main className="min-h-screen bg-base-200 p-4 sm:p-8 md:p-12">
      <div className="max-w-7xl mx-auto">
        {/* Top bar */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex flex-wrap gap-2">
            <a href="#create" className="btn btn-outline btn-sm">
              配色を作る
            </a>
            <a href="#browse" className="btn btn-outline btn-sm">
              一覧
            </a>
            <a href="#images" className="btn btn-outline btn-sm">
              配色イメージ
            </a>
            <a href="#quiz" className="btn btn-outline btn-sm">
              クイズ
            </a>
            <a href="#faq" className="btn btn-outline btn-sm">
              FAQ
            </a>
          </div>
          <Link href="/" className="btn btn-ghost btn-sm">
            ← ホーム
          </Link>
        </div>

        {/* Hero */}
        <div className="rounded-3xl border border-base-300 bg-base-100 p-6 sm:p-8 md:p-10 shadow-sm mb-10">
          <h1 className="text-4xl sm:text-5xl font-bold mb-3">
            <span className="font-yusei">Chromalab</span> の使い方
          </h1>
          <p className="text-base sm:text-lg text-base-content/70">
            PCCS (Practical Color Co-ordinate System)
            に基づいて、配色技法を学びながら自分のカラーパレットを作れるツールです。色彩検定2級レベルの学習にも対応しています。
          </p>
        </div>

        {/* 1. 配色を作る */}
        <div id="create" />
        <StepCard
          n={1}
          title="配色を作る"
          priority
          desc="「＋ 新しく作る」(モバイルは右下の丸ボタン) から作成画面へ。PCCSトーン図から (トーン × 色相) を直感的に選びます。"
          bullets={[
            'まず配色技法を選択 (同一色相配色 / 補色色相配色 など)',
            '色スロットをタップして「アクティブ」にする',
            'PCCSトーン図 (有彩色12トーン×12色相 + 無彩色5色) からスウォッチをクリック → 即時反映',
            '技法選択中は「その技法のルールに合う候補」がハイライト表示される (他も自由に選べます)',
            'タイトルとメモを入れて保存',
          ]}
          imageSrc="/usage/create.png"
          imageAlt="パレット作成画面"
        />

        {/* 2. 一覧で見る */}
        <div id="browse" />
        <StepCard
          n={2}
          title="一覧で見る"
          imageRight={false}
          desc="公式の配色技法サンプルと、自分のパレットが一覧で並びます。"
          bullets={[
            'カテゴリで絞り込み (色相差ベース / トーン差ベース / ハーモニーなど 9 カテゴリ)',
            '作成者で絞り込み (全て / 公式 / 自分のみ)',
            'カードをクリックして詳細を確認、自分のパレットは編集・削除可能',
          ]}
          imageSrc="/usage/browse.png"
          imageAlt="パレット一覧画面"
        />

        {/* 3. 配色イメージ */}
        <div id="images" />
        <StepCard
          n={3}
          title="配色イメージで印象を学ぶ"
          desc="ヘッダーの「配色イメージ」ページでは、色彩検定2級で扱う代表的な配色イメージ (爽やか / クール / ロマンティック など) を、好まれる色相とトーンのセットで確認できます。"
          bullets={[
            '印象キーワードと好まれる色相 / トーンの組み合わせを一覧表示',
            '配色を作るときの「狙い」を決めるヒントになる',
          ]}
        />

        {/* 4. クイズ */}
        <div id="quiz" />
        <StepCard
          n={4}
          title="クイズで技法を覚える"
          desc="公式パレットからランダムに10問出題され、4択でその配色がどの技法かを当てます。色彩検定2級の学習にも有効。"
          bullets={[
            'ヘッダー「クイズ」または モバイルメニューから挑戦',
            '解答ごとに○×と正解技法が即時フィードバック',
            '結果は自動で保存され、後から履歴として振り返れる',
          ]}
        />

        {/* 5. 履歴 */}
        <StepCard
          n={5}
          title="クイズ履歴で復習する"
          desc="クイズページ右上「履歴」または モバイルメニュー「クイズ履歴」から、これまでの解答ログを確認できます。"
          bullets={[
            '通算 解答数 / 正解数 / 正答率を表示',
            '技法別の正答率テーブルで、苦手な技法を把握',
            '直近の解答ログ (正解技法 / 自分の回答 / 日時) を一覧化',
            '「履歴を全消去」ボタンで成績をリセット可能',
          ]}
        />

        {/* FAQ */}
        <div id="faq" className="mt-14" />
        <section className="rounded-3xl border border-base-300 bg-base-100 p-6 sm:p-8 shadow-sm">
          <h2 className="text-3xl font-semibold mb-5">FAQ</h2>

          <div className="space-y-3">
            <div className="collapse collapse-arrow border border-base-300 bg-base-200 rounded-2xl">
              <input type="checkbox" />
              <div className="collapse-title text-lg font-medium">
                ログインしないと使えませんか?
              </div>
              <div className="collapse-content text-base-content/80">
                パレット一覧や配色イメージページの閲覧はログインなしでも可能です。パレットの作成・保存、クイズへの挑戦、履歴の確認にはログインが必要です。
              </div>
            </div>

            <div className="collapse collapse-arrow border border-base-300 bg-base-200 rounded-2xl">
              <input type="checkbox" />
              <div className="collapse-title text-lg font-medium">
                公式パレットは削除できますか?
              </div>
              <div className="collapse-content text-base-content/80">
                公式パレットは閲覧専用です。配色技法のサンプルとしてあらかじめ用意されています。自分が作成したパレットのみ編集・削除できます。
              </div>
            </div>

            <div className="collapse collapse-arrow border border-base-300 bg-base-200 rounded-2xl">
              <input type="checkbox" />
              <div className="collapse-title text-lg font-medium">
                技法ヒントの「ハイライト」はどう計算されている?
              </div>
              <div className="collapse-content text-base-content/80">
                最初に選んだ色をアンカーとして、選択中の技法の色相ルール
                (色相差・色相環n等分・補色など) とトーンルール
                (同一/類似/対照など)
                の両方を満たす候補だけハイライト表示されます。あくまでヒントなのでルール外も選択可能です。
              </div>
            </div>

            <div className="collapse collapse-arrow border border-base-300 bg-base-200 rounded-2xl">
              <input type="checkbox" />
              <div className="collapse-title text-lg font-medium">
                クイズの選択肢はどう決まる?
              </div>
              <div className="collapse-content text-base-content/80">
                正解の技法 1 つと、他の技法からランダムで 3 つの計 4
                つが提示されます。同じ問題が複数回出題されることもあります。
              </div>
            </div>

            <div className="collapse collapse-arrow border border-base-300 bg-base-200 rounded-2xl">
              <input type="checkbox" />
              <div className="collapse-title text-lg font-medium">
                色彩検定にどのくらい対応している?
              </div>
              <div className="collapse-content text-base-content/80">
                色彩検定2級で扱う PCCS 24 色相環・17トーン、主要な配色技法
                (色相差/トーン差/ドミナント/ハーモニー/色相環n等分など)
                をベースに設計しています。出題範囲の暗記補助としてもお使いいただけます。
              </div>
            </div>
          </div>
        </section>

        <div className="flex justify-center">
          <Link href="/" className="btn btn-lg mt-10">
            ホームに戻る
          </Link>
        </div>
      </div>
    </main>
  );
}
