import type { Metadata } from "next";
import Link from "next/link";

/** ISR: 24時間ごとに再検証（静的コンテンツ） */
export const revalidate = 86400;

export const metadata: Metadata = {
  title: "Cookie ポリシー",
  description:
    "Menpass の Cookie ポリシー。Cookie の使用目的と管理方法についてご説明します。",
  openGraph: {
    title: "Cookie ポリシー | Menpass",
    description:
      "Menpass の Cookie ポリシー。Cookie の使用目的と管理方法についてご説明します。",
    url: "https://menpass.jp/legal/cookies",
  },
};

const sections = [
  { id: "what-is-cookie", label: "Cookie とは" },
  { id: "cookie-types", label: "使用している Cookie の種類" },
  { id: "cookie-list", label: "Cookie 一覧" },
  { id: "cookie-management", label: "Cookie の管理方法" },
  { id: "amendment", label: "ポリシーの改定" },
  { id: "contact", label: "お問い合わせ" },
] as const;

export default function CookiePolicyPage() {
  return (
    <div className="container mx-auto max-w-3xl px-4 py-12">
      {/* ページタイトル */}
      <h1 className="mb-2 text-3xl font-bold tracking-tight">
        Cookie ポリシー
      </h1>
      <p className="mb-8 text-sm text-muted-foreground">
        制定日: 2026年3月1日 / 最終更新日: 2026年3月1日
      </p>

      {/* 注記 */}
      <div className="mb-8 rounded-lg border border-yellow-300 bg-yellow-50 p-4 text-sm text-yellow-800 dark:border-yellow-700 dark:bg-yellow-950 dark:text-yellow-200">
        ※ 本ポリシーは弁護士によるレビューを受けていません。正式な法的文書として使用する前に、専門家の確認を受けることを推奨します。
      </div>

      {/* 目次 */}
      <nav className="mb-12 rounded-lg border bg-muted/40 p-6">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          目次
        </h2>
        <ol className="list-decimal space-y-1 pl-5 text-sm">
          {sections.map((s) => (
            <li key={s.id}>
              <a
                href={`#${s.id}`}
                className="text-primary underline-offset-4 hover:underline"
              >
                {s.label}
              </a>
            </li>
          ))}
        </ol>
      </nav>

      {/* 本文 */}
      <div className="prose prose-neutral dark:prose-invert max-w-none space-y-10 text-sm leading-relaxed [&_h2]:scroll-mt-20">
        {/* 1. Cookie とは */}
        <section id="what-is-cookie">
          <h2 className="text-xl font-semibold">1. Cookie とは</h2>
          <p>
            Cookie とは、ウェブサイトがユーザーのブラウザに保存する小さなテキストファイルです。Cookie は、ユーザーの設定を記憶したり、ログイン状態を維持したり、サービスの利用状況を分析したりするために使用されます。
          </p>
          <p>
            本サービス（Menpass）では、サービスの提供・改善に必要な範囲で Cookie およびこれに類する技術（ローカルストレージ等）を使用しています。
          </p>
        </section>

        {/* 2. 使用している Cookie の種類 */}
        <section id="cookie-types">
          <h2 className="text-xl font-semibold">2. 使用している Cookie の種類</h2>

          <h3 className="mt-4 text-base font-medium">2-1. 必須 Cookie</h3>
          <p>
            サービスの基本機能を提供するために必要な Cookie です。これらの Cookie がないと、ログインやセッション管理等の基本機能が正常に動作しません。必須 Cookie を無効にすることはできません。
          </p>
          <ul className="list-disc space-y-1 pl-5">
            <li>
              <span className="font-medium">認証・セッション管理:</span>{" "}
              Supabase Auth が発行するセッショントークンを管理し、ログイン状態を維持します
            </li>
            <li>
              <span className="font-medium">オンボーディング:</span>{" "}
              初回利用時のガイダンスの表示/非表示を管理します
            </li>
          </ul>

          <h3 className="mt-4 text-base font-medium">2-2. 分析 Cookie</h3>
          <p>
            サービスの品質向上やエラー改善のために使用する Cookie です。
          </p>
          <ul className="list-disc space-y-1 pl-5">
            <li>
              <span className="font-medium">Sentry（エラー監視）:</span>{" "}
              アプリケーションのエラー情報を収集し、サービスの安定性向上に活用します
            </li>
          </ul>
        </section>

        {/* 3. Cookie 一覧 */}
        <section id="cookie-list">
          <h2 className="text-xl font-semibold">3. Cookie 一覧</h2>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full border-collapse border text-sm">
              <thead>
                <tr className="bg-muted/40">
                  <th className="border px-4 py-2 text-left font-medium">Cookie 名</th>
                  <th className="border px-4 py-2 text-left font-medium">種別</th>
                  <th className="border px-4 py-2 text-left font-medium">目的</th>
                  <th className="border px-4 py-2 text-left font-medium">有効期限</th>
                  <th className="border px-4 py-2 text-left font-medium">提供元</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border px-4 py-2">sb-*-auth-token</td>
                  <td className="border px-4 py-2">必須</td>
                  <td className="border px-4 py-2">Supabase 認証セッションの管理</td>
                  <td className="border px-4 py-2">セッション / 最大1年</td>
                  <td className="border px-4 py-2">Supabase</td>
                </tr>
                <tr>
                  <td className="border px-4 py-2">onboarding_completed</td>
                  <td className="border px-4 py-2">必須</td>
                  <td className="border px-4 py-2">オンボーディング完了状態の記録</td>
                  <td className="border px-4 py-2">1年</td>
                  <td className="border px-4 py-2">自社</td>
                </tr>
                <tr>
                  <td className="border px-4 py-2">sentryReplaySession</td>
                  <td className="border px-4 py-2">分析</td>
                  <td className="border px-4 py-2">エラー発生時のセッション追跡</td>
                  <td className="border px-4 py-2">セッション</td>
                  <td className="border px-4 py-2">Sentry</td>
                </tr>
                <tr>
                  <td className="border px-4 py-2">_sentry-*</td>
                  <td className="border px-4 py-2">分析</td>
                  <td className="border px-4 py-2">エラートラッキング</td>
                  <td className="border px-4 py-2">セッション</td>
                  <td className="border px-4 py-2">Sentry</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* 4. Cookie の管理方法 */}
        <section id="cookie-management">
          <h2 className="text-xl font-semibold">4. Cookie の管理方法</h2>
          <p>
            ほとんどのブラウザでは、Cookie の受け入れ・拒否・削除を設定で管理できます。ただし、必須 Cookie を無効にした場合、本サービスの一部機能が正常に動作しなくなる可能性があります。
          </p>

          <h3 className="mt-4 text-base font-medium">主要ブラウザでの Cookie 設定方法</h3>
          <ul className="list-disc space-y-1 pl-5">
            <li>
              <span className="font-medium">Google Chrome:</span>{" "}
              設定 → プライバシーとセキュリティ → Cookie と他のサイトデータ
            </li>
            <li>
              <span className="font-medium">Mozilla Firefox:</span>{" "}
              設定 → プライバシーとセキュリティ → Cookie とサイトデータ
            </li>
            <li>
              <span className="font-medium">Safari:</span>{" "}
              環境設定 → プライバシー → Cookie と Web サイトのデータ
            </li>
            <li>
              <span className="font-medium">Microsoft Edge:</span>{" "}
              設定 → Cookie とサイトのアクセス許可 → Cookie とサイトデータの管理と削除
            </li>
          </ul>
          <p className="mt-3">
            Cookie を削除した場合、ログイン状態が解除される等、一部の設定がリセットされます。
          </p>
        </section>

        {/* 5. ポリシーの改定 */}
        <section id="amendment">
          <h2 className="text-xl font-semibold">5. ポリシーの改定</h2>
          <p>
            本 Cookie ポリシーは、使用する Cookie の変更やサービス内容の変更に伴い、改定することがあります。改定後のポリシーは、本ページに掲載された時点で効力を生じるものとします。
          </p>
        </section>

        {/* 6. お問い合わせ */}
        <section id="contact">
          <h2 className="text-xl font-semibold">6. お問い合わせ</h2>
          <p>
            本 Cookie ポリシーに関するお問い合わせは、以下の連絡先までお願いいたします。
          </p>
          <div className="mt-4 rounded-lg border bg-muted/40 p-4">
            <p className="font-medium">Menpass 運営事務局</p>
            <p className="mt-1">
              メール:{" "}
              <a
                href="mailto:support@menpass.jp"
                className="text-primary underline underline-offset-4"
              >
                support@menpass.jp
              </a>
            </p>
          </div>
        </section>
      </div>

      {/* 関連リンク */}
      <div className="mt-10 text-sm">
        <h2 className="mb-2 font-semibold">関連ページ</h2>
        <ul className="list-disc space-y-1 pl-5">
          <li>
            <Link
              href="/legal/privacy"
              className="text-primary underline-offset-4 hover:underline"
            >
              プライバシーポリシー
            </Link>
          </li>
          <li>
            <Link
              href="/legal/terms"
              className="text-primary underline-offset-4 hover:underline"
            >
              利用規約
            </Link>
          </li>
        </ul>
      </div>

      {/* フッターリンク */}
      <div className="mt-16 border-t pt-6 text-center text-sm text-muted-foreground">
        <Link
          href="/"
          className="text-primary underline-offset-4 hover:underline"
        >
          トップページに戻る
        </Link>
      </div>
    </div>
  );
}
