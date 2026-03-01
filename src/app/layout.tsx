import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { CookieConsent } from "@/components/cookie-consent";
import { SessionMonitor } from "@/components/session-monitor";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

const siteUrl = "https://interviewcoach.jp";
const siteName = "InterviewCoach";
const defaultDescription =
  "面接練習の録音をAIが分析し、回答内容・話し方の両面からフィードバックを自動生成。新卒就活を成功に導くAI面接コーチ。";

export const metadata: Metadata = {
  title: {
    default: siteName,
    template: `%s | ${siteName}`,
  },
  description: defaultDescription,
  metadataBase: new URL(siteUrl),
  openGraph: {
    title: siteName,
    description: defaultDescription,
    type: "website",
    locale: "ja_JP",
    url: siteUrl,
    siteName,
    images: [
      {
        url: "/opengraph-image.png",
        width: 1200,
        height: 630,
        alt: "InterviewCoach - AI面接フィードバック",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: siteName,
    description: defaultDescription,
    images: ["/opengraph-image.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <head>
        {/* Supabase への接続を事前確立して LCP を改善 */}
        <link
          rel="dns-prefetch"
          href={`https://${process.env.NEXT_PUBLIC_SUPABASE_URL?.replace("https://", "") ?? ""}`}
        />
        <link
          rel="preconnect"
          href={`https://${process.env.NEXT_PUBLIC_SUPABASE_URL?.replace("https://", "") ?? ""}`}
          crossOrigin="use-credentials"
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <div className="flex min-h-screen flex-col">
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </div>
        <SessionMonitor />
        <CookieConsent />
      </body>
    </html>
  );
}
