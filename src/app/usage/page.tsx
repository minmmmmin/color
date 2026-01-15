import Image from "next/image";
import Link from "next/link";

function Step({
  n,
  title,
  desc,
  bullets,
  imageSrc,
  imageAlt,
}: {
  n: number;
  title: string;
  desc: string;
  bullets: string[];
  imageSrc: string;
  imageAlt: string;
}) {
  return (
    <section className="mb-10">
      <div className="grid gap-6 lg:grid-cols-2">
        <div>
          <div className="flex items-center gap-3 mb-3">
            <div className="badge badge-primary badge-lg">{n}</div>
            <h2 className="text-3xl font-semibold">{title}</h2>
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

        <div className="rounded-2xl border border-base-300 bg-base-100 shadow-sm overflow-hidden">

          <div className="bg-base-200 group">
            <Image
              src={imageSrc}
              alt={imageAlt}
              width={1200}
              height={800}
              className="w-full h-auto transition-transform duration-300 group-hover:scale-105"
              sizes="(min-width: 1024px) 50vw, 100vw"
              priority={n === 1}
            />
          </div>

        </div>
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
              作成
            </a>
            <a href="#browse" className="btn btn-outline btn-sm">
              閲覧
            </a>
            <a href="#faq" className="btn btn-outline btn-sm">
              FAQ
            </a>
          </div>
        </div>

        {/* Hero */}
        <div className="rounded-3xl border border-base-300 bg-base-100 p-6 sm:p-8 md:p-10 shadow-sm mb-10">
          <h1 className="text-4xl sm:text-5xl font-bold mb-3">
            Chromalab の使い方
          </h1>
          <p className="text-lg text-base-content/70 leading-relaxed max-w-3xl">
            ざっくり2ステップ。作って、一覧で見返す。
          </p>
        </div>

        <div id="create" />
        <Step
          n={1}
          title="パレットを作る"
          desc="「＋ 新しく作る」から作成画面へ。技法を選んで保存します。"
          bullets={[
            "技法（配色の作り方）を選ぶ",
            "色を調整（hex入力でもOK）",
            "タイトルを入れて保存",
          ]}
          imageSrc="/usage/create.png"
          imageAlt="パレット作成画面"
        />

        <div id="browse" />
        <Step
          n={2}
          title="一覧で見る"
          desc="公式パレットや自分のパレットが一覧に並びます。"
          bullets={[
            "カテゴリで絞り込み",
            "カードで配色を確認",
            "自分のパレットは編集・削除できる",
          ]}
          imageSrc="/usage/browse.png"
          imageAlt="パレット一覧画面"
        />

        {/* FAQ */}
        <div id="faq" className="mt-14" />
        <section className="rounded-3xl border border-base-300 bg-base-100 p-6 sm:p-8 shadow-sm">
          <h2 className="text-3xl font-semibold mb-5">FAQ</h2>

          <div className="space-y-3">
            <div className="collapse collapse-arrow border border-base-300 bg-base-200 rounded-2xl">
              <input type="checkbox" />
              <div className="collapse-title text-lg font-medium">
                公式パレットは削除できますか？
              </div>
              <div className="collapse-content text-base-content/80">
                公式は閲覧専用です。自分が作成したパレットのみ削除できます。
              </div>
            </div>

            <div className="collapse collapse-arrow border border-base-300 bg-base-200 rounded-2xl">
              <input type="checkbox" />
              <div className="collapse-title text-lg font-medium">
                ログインしないと保存できませんか？
              </div>
              <div className="collapse-content text-base-content/80">
                一覧の閲覧は可能です。保存や編集はログインが必要です。
              </div>
            </div>
          </div>
        </section>

        <div className="flex justify-center">
          <Link href="/" className="btn btn-lg mt-10">
            戻る
          </Link>
        </div>

      </div>
    </main>
  );
}
