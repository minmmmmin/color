# Chromalab

自分だけのカラーパレットを作成・管理できるWebアプリケーションです。

## 概要

Chromalabは、直感的な操作で美しい配色を作成できるツールです。
色相やトーン、色相環（2〜6色）に基づいた理論的な配色パターンを簡単に生成し、プロジェクトに活用することができます。

## 主な機能

- **パレット生成**
  - **色相ベース**: 同系色のまとまりのある配色
  - **トーンベース**: 同じトーンで統一した配色
  - **色相環**: 補色、トライアド、テトラードなど、色相環に基づいた2〜6色の配色
- **パレット管理**
  - 作成したパレットの保存
  - 一覧表示（作成日時順）
  - カテゴリによるフィルタリング
- **ユーザー認証**
  - アカウント作成・ログイン（Supabase Auth）
  - ユーザーごとのデータ管理

## 技術スタック

- **Framework**: [Next.js 16 (App Router)](https://nextjs.org/)
- **Language**: TypeScript
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/), [DaisyUI 5](https://daisyui.com/)
- **Backend / Auth**: [Supabase](https://supabase.com/)
- **State / Logic**: React Hooks

## ローカルでの実行方法

1. **リポジトリのクローン**
   ```bash
   git clone <repository-url>
   cd color-study
   ```

2. **依存関係のインストール**
   ```bash
   npm install
   ```

3. **環境変数の設定**
   `.env.local`ファイルを作成し、Supabaseの接続情報を設定します。
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **開発サーバーの起動**
   ```bash
   npm run dev
   ```
   [http://localhost:3000](http://localhost:3000) にアクセスして確認できます。

## ライセンス

This project is licensed under the MIT License.
