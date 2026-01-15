import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Chromalab",
  description: "配色を楽しむ・学ぶためのカラーツール",

  openGraph: {
    title: 'Chromalab',
    description: '配色を楽しむ・学ぶためのカラーツール',
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
    description: '配色を楽しむ・学ぶためのカラーツール',
    images: ['/ogp.png'],
  },
}


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
