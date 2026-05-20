import type { Metadata } from 'next';
import { Geist, Geist_Mono, Yusei_Magic } from 'next/font/google';
import { AuthProvider } from '@/context/AuthContext';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

// Chromalab タイトル専用フォント。CSS 変数 --font-yusei-magic として公開する。
const yuseiMagic = Yusei_Magic({
  variable: '--font-yusei-magic',
  weight: '400',
  subsets: ['latin'],
  display: 'swap',
});

const rawSiteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? process.env.VERCEL_URL;
const siteUrl = rawSiteUrl
  ? rawSiteUrl.startsWith('http')
    ? rawSiteUrl
    : `https://${rawSiteUrl}`
  : 'http://localhost:3000';

export const metadata: Metadata = {
  title: 'Chromalab',
  description: '配色を学ぶためのカラーツール',
  metadataBase: new URL(siteUrl),

  openGraph: {
    title: 'Chromalab',
    description: '配色を学ぶためのカラーツール',
    images: [
      {
        url: '/ogp.png',
        width: 1200,
        height: 1200,
        alt: 'Chromalab',
      },
    ],
  },
  twitter: {
    card: 'summary',
    title: 'Chromalab',
    description: '配色を学ぶためのカラーツール',
    images: ['/ogp.png'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${yuseiMagic.variable} antialiased`}
      >
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
