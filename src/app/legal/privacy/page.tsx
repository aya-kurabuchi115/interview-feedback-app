import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "プライバシーポリシー",
  description:
    "InterviewCoach のプライバシーポリシー。個人情報の取り扱いについてご説明します。",
  openGraph: {
    title: "プライバシーポリシー | InterviewCoach",
    description:
      "InterviewCoach のプライバシーポリシー。個人情報の取り扱いについてご説明します。",
    url: "https://interviewcoach.jp/legal/privacy",
  },
};

const sections = [
  { id: "introduction", label: "はじめに" },
  { id: "definition", label: "個人情報の定義" },
  { id: "collection", label: "収集する情報" },
  { id: "purpose", label: "利用目的" },
  { id: "third-party", label: "第三者提供" },
  { id: "audio-data", label: "音声データの取り扱い" },
  { id: "management", label: "個人情報の管理・保護" },
  { id: "retention", label: "保管期間と削除" },
  { id: "deletion-request", label: "データ削除リクエスト" },
  { id: "rights", label: "お客様の権利" },
  { id: "cookies", label: "Cookie の使用" },
  { id: "minors", label: "未成年の利用" },
  { id: "future-sharing", label: "将来のデータ共有" },
  { id: "amendment", label: "ポリシーの改定" },
  { id: "contact", label: "お問い合わせ" },
] as const;

export default function PrivacyPolicyPage() {
  return (
    <div className="container mx-auto max-w-3xl px-4 py-12">
      {/* ページタイトル */}
      <h1 className="mb-2 text-3xl font-bold tracking-tight">
        プライバシーポリシー
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
        {/* 1. はじめに */}
        <section id="introduction">
          <h2 className="text-xl font-semibold">1. はじめに</h2>
          <p>
            InterviewCoach（以下「本サービス」）は、ユーザーの皆さまの個人情報を適切に保護することが重要な責務であると考えています。本プライバシーポリシー（以下「本ポリシー」）は、本サービスにおける個人情報の取り扱いについて定めるものです。
          </p>
          <p>
            本サービスをご利用いただくことにより、本ポリシーに同意いただいたものとみなします。
          </p>
        </section>

        {/* 2. 個人情報の定義 */}
        <section id="definition">
          <h2 className="text-xl font-semibold">2. 個人情報の定義</h2>
          <p>
            本ポリシーにおいて「個人情報」とは、個人情報保護法に定める個人情報を指し、生存する個人に関する情報であって、氏名、メールアドレスその他の記述により特定の個人を識別できるもの、または個人識別符号が含まれるものをいいます。
          </p>
        </section>

        {/* 3. 収集する情報 */}
        <section id="collection">
          <h2 className="text-xl font-semibold">3. 収集する情報</h2>
          <p>本サービスでは、以下の情報を収集します。</p>

          <h3 className="mt-4 text-base font-medium">
            3-1. アカウント情報
          </h3>
          <ul className="list-disc space-y-1 pl-5">
            <li>メールアドレス</li>
            <li>表示名（ニックネーム）</li>
            <li>パスワード（ハッシュ化して保存）</li>
          </ul>

          <h3 className="mt-4 text-base font-medium">
            3-2. プロフィール情報
          </h3>
          <ul className="list-disc space-y-1 pl-5">
            <li>大学名・学部</li>
            <li>志望業界・志望企業</li>
          </ul>

          <h3 className="mt-4 text-base font-medium">3-3. 面接データ</h3>
          <ul className="list-disc space-y-1 pl-5">
            <li>面接練習の音声ファイル（文字起こし処理後に削除されます。詳細は「6. 音声データの取り扱い」をご確認ください）</li>
            <li>面接練習の音声から文字起こしされたスクリプト</li>
            <li>面接カテゴリ（個人面接・集団面接等）</li>
            <li>対象企業名</li>
            <li>AI が生成したフィードバック内容</li>
          </ul>

          <h3 className="mt-4 text-base font-medium">
            3-4. 利用状況データ
          </h3>
          <ul className="list-disc space-y-1 pl-5">
            <li>アクセスログ（IPアドレス、ブラウザ情報、アクセス日時）</li>
            <li>サービス利用回数・利用履歴</li>
          </ul>

          <h3 className="mt-4 text-base font-medium">3-5. 決済情報</h3>
          <p>
            有料プランをご利用の場合、決済処理は Stripe,
            Inc. を通じて行われます。クレジットカード番号等の決済情報は本サービスのサーバーには保存されず、Stripe
            が安全に管理します。本サービスが保持するのは、Stripe
            が発行する顧客ID・サブスクリプションIDおよび決済ステータスのみです。
          </p>
        </section>

        {/* 4. 利用目的 */}
        <section id="purpose">
          <h2 className="text-xl font-semibold">4. 利用目的</h2>
          <p>収集した個人情報は、以下の目的で利用します。</p>
          <ul className="list-disc space-y-1 pl-5">
            <li>
              <span className="font-medium">音声文字起こし:</span>{" "}
              面接音声ファイルを AssemblyAI API に送信し、テキストに変換するため
            </li>
            <li>
              <span className="font-medium">AI フィードバックの生成:</span>{" "}
              面接音声スクリプトを AI（Anthropic Claude API）に送信し、回答内容・話し方に関するフィードバックを生成するため
            </li>
            <li>
              <span className="font-medium">サービスの提供・運営:</span>{" "}
              ユーザー認証、ダッシュボード表示、面接履歴の管理等、本サービスの基本機能を提供するため
            </li>
            <li>
              <span className="font-medium">サービス改善・統計分析:</span>{" "}
              匿名化したデータをもとに、サービスの品質向上や新機能開発のための統計分析を行うため
            </li>
            <li>
              <span className="font-medium">エラー監視:</span>{" "}
              Sentry を用いたエラートラッキングにより、サービスの安定性を維持・改善するため
            </li>
            <li>
              <span className="font-medium">ユーザーサポート:</span>{" "}
              お問い合わせへの対応やサポートの提供のため
            </li>
            <li>
              <span className="font-medium">料金請求:</span>{" "}
              有料プランの料金請求および決済処理のため
            </li>
          </ul>
        </section>

        {/* 5. 第三者提供 */}
        <section id="third-party">
          <h2 className="text-xl font-semibold">5. 第三者提供</h2>
          <p>
            本サービスでは、サービス提供に必要な範囲で、以下の第三者サービスに個人データを送信します。
          </p>

          <h3 className="mt-4 text-base font-medium">
            5-1. AssemblyAI（音声文字起こし）
          </h3>
          <p>
            面接練習の音声ファイルを AssemblyAI, Inc. が提供する API に送信し、テキストへの文字起こし処理を行います。送信されるデータには音声ファイルが含まれます。AssemblyAI は処理完了後にデータを削除します。AssemblyAI のプライバシーポリシーについては{" "}
            <a
              href="https://www.assemblyai.com/privacy-policy"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline underline-offset-4"
            >
              AssemblyAI Privacy Policy
            </a>{" "}
            をご確認ください。
          </p>

          <h3 className="mt-4 text-base font-medium">
            5-2. Anthropic（AI フィードバック生成）
          </h3>
          <p>
            面接練習の音声スクリプトを Anthropic, PBC が提供する Claude
            API に送信し、AI フィードバックを生成します。送信されるデータには面接スクリプトのテキスト、面接カテゴリ、企業名が含まれます。Anthropic の API 利用においては、送信データが AI モデルのトレーニングに使用されることはありません。Anthropic
            のプライバシーポリシーについては{" "}
            <a
              href="https://www.anthropic.com/privacy"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline underline-offset-4"
            >
              Anthropic Privacy Policy
            </a>{" "}
            をご確認ください。
          </p>

          <h3 className="mt-4 text-base font-medium">
            5-3. Stripe（決済処理）
          </h3>
          <p>
            有料プランの決済処理のため、Stripe, Inc.
            に決済に必要な情報を送信します。Stripe のプライバシーポリシーについては{" "}
            <a
              href="https://stripe.com/jp/privacy"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline underline-offset-4"
            >
              Stripe Privacy Policy
            </a>{" "}
            をご確認ください。
          </p>

          <h3 className="mt-4 text-base font-medium">
            5-4. Supabase（データ保存・認証）
          </h3>
          <p>
            ユーザーのアカウント情報、プロフィール情報、面接データは Supabase,
            Inc. が提供するクラウドデータベースに保存されます。また、ユーザー認証処理も Supabase を通じて行われます。Supabase
            のプライバシーポリシーについては{" "}
            <a
              href="https://supabase.com/privacy"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline underline-offset-4"
            >
              Supabase Privacy Policy
            </a>{" "}
            をご確認ください。
          </p>

          <h3 className="mt-4 text-base font-medium">
            5-5. Sentry（エラー監視）
          </h3>
          <p>
            サービスの安定性向上のため、エラー情報を Sentry（Functional Software, Inc.）に送信しています。送信されるデータにはエラーの技術情報、ブラウザ情報、IPアドレスが含まれる場合があります。Sentry のプライバシーポリシーについては{" "}
            <a
              href="https://sentry.io/privacy/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline underline-offset-4"
            >
              Sentry Privacy Policy
            </a>{" "}
            をご確認ください。
          </p>

          <h3 className="mt-4 text-base font-medium">5-6. その他</h3>
          <p>
            上記以外の第三者への個人情報の提供は、法令に基づく場合、人の生命・身体・財産の保護のために必要な場合、またはユーザーご本人の同意がある場合を除き、行いません。
          </p>
        </section>

        {/* 6. 音声データの取り扱い */}
        <section id="audio-data">
          <h2 className="text-xl font-semibold">6. 音声データの取り扱い</h2>
          <p>
            本サービスでは、面接練習の音声データについて以下のとおり取り扱います。
          </p>
          <ul className="list-disc space-y-1 pl-5">
            <li>
              <span className="font-medium">目的:</span>{" "}
              音声データは文字起こし処理のためのみに使用し、それ以外の目的には利用しません
            </li>
            <li>
              <span className="font-medium">処理フロー:</span>{" "}
              アップロードされた音声ファイルは AssemblyAI API に送信され、文字起こし完了後にサーバーから削除されます
            </li>
            <li>
              <span className="font-medium">保存:</span>{" "}
              本サービスのサーバーに音声ファイルの永続的な保存は行いません。文字起こし処理中の一時的な保存のみ行います
            </li>
            <li>
              <span className="font-medium">第三者提供:</span>{" "}
              音声データは文字起こし処理を行う AssemblyAI 以外の第三者には提供しません
            </li>
            <li>
              <span className="font-medium">AI トレーニング:</span>{" "}
              音声データおよび文字起こしデータを AI モデルのトレーニング目的で使用することはありません
            </li>
          </ul>
        </section>

        {/* 7. 個人情報の管理・保護 */}
        <section id="management">
          <h2 className="text-xl font-semibold">7. 個人情報の管理・保護</h2>
          <p>
            本サービスは、個人情報の漏洩、滅失、毀損を防止するため、以下のセキュリティ対策を実施しています。
          </p>
          <ul className="list-disc space-y-1 pl-5">
            <li>通信の暗号化（TLS/SSL）</li>
            <li>データベースアクセスにおける Row Level Security（RLS）の適用</li>
            <li>パスワードのハッシュ化保存</li>
            <li>管理者アクセス権限の厳格な管理</li>
            <li>定期的なセキュリティレビューの実施</li>
          </ul>
        </section>

        {/* 8. 保管期間と削除 */}
        <section id="retention">
          <h2 className="text-xl font-semibold">8. 保管期間と削除</h2>
          <p>各データの保管期間は以下のとおりです。</p>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full border-collapse border text-sm">
              <thead>
                <tr className="bg-muted/40">
                  <th className="border px-4 py-2 text-left font-medium">データ種別</th>
                  <th className="border px-4 py-2 text-left font-medium">保管期間</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border px-4 py-2">アカウント情報</td>
                  <td className="border px-4 py-2">アカウント削除まで</td>
                </tr>
                <tr>
                  <td className="border px-4 py-2">プロフィール情報</td>
                  <td className="border px-4 py-2">アカウント削除まで</td>
                </tr>
                <tr>
                  <td className="border px-4 py-2">面接スクリプト・フィードバック</td>
                  <td className="border px-4 py-2">アカウント削除まで（ユーザーが個別に削除可能）</td>
                </tr>
                <tr>
                  <td className="border px-4 py-2">音声ファイル</td>
                  <td className="border px-4 py-2">文字起こし完了後に即時削除</td>
                </tr>
                <tr>
                  <td className="border px-4 py-2">アクセスログ</td>
                  <td className="border px-4 py-2">最大90日間</td>
                </tr>
                <tr>
                  <td className="border px-4 py-2">決済関連情報</td>
                  <td className="border px-4 py-2">法令で定められた保管期間（最大7年間）</td>
                </tr>
                <tr>
                  <td className="border px-4 py-2">エラーログ（Sentry）</td>
                  <td className="border px-4 py-2">最大90日間</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="mt-4">
            ユーザーがアカウントを削除した場合、上記のアカウント情報・プロフィール情報・面接データは削除リクエストから30日以内に完全に削除します。ただし、法令により保管が義務付けられている情報についてはこの限りではありません。
          </p>
        </section>

        {/* 9. データ削除リクエスト */}
        <section id="deletion-request">
          <h2 className="text-xl font-semibold">9. データ削除リクエスト</h2>
          <p>
            ユーザーは、以下の方法でデータの削除をリクエストできます。
          </p>
          <ul className="list-disc space-y-1 pl-5">
            <li>
              <span className="font-medium">アカウント設定からの削除:</span>{" "}
              個別の面接データは、ダッシュボードから直接削除できます
            </li>
            <li>
              <span className="font-medium">アカウント全体の削除:</span>{" "}
              アカウント設定画面からアカウントの削除が可能です。アカウント削除後、関連する全てのデータが30日以内に完全に削除されます
            </li>
            <li>
              <span className="font-medium">メールでのリクエスト:</span>{" "}
              上記の方法で対応できない場合は、下記お問い合わせ先（support@interviewcoach.jp）まで削除リクエストをお送りください。ご本人確認のうえ、30日以内に対応いたします
            </li>
          </ul>
        </section>

        {/* 10. お客様の権利 */}
        <section id="rights">
          <h2 className="text-xl font-semibold">10. お客様の権利</h2>
          <p>
            ユーザーは、ご自身の個人情報について以下の権利を有しています。
          </p>
          <ul className="list-disc space-y-1 pl-5">
            <li>
              <span className="font-medium">開示請求:</span>{" "}
              本サービスが保有する個人情報の開示を求めることができます
            </li>
            <li>
              <span className="font-medium">訂正請求:</span>{" "}
              個人情報の内容が事実と異なる場合、訂正を求めることができます
            </li>
            <li>
              <span className="font-medium">削除請求:</span>{" "}
              個人情報の削除を求めることができます
            </li>
            <li>
              <span className="font-medium">利用停止請求:</span>{" "}
              個人情報の利用停止を求めることができます
            </li>
            <li>
              <span className="font-medium">データポータビリティ:</span>{" "}
              ご自身のデータをエクスポートする権利を有しています
            </li>
          </ul>
          <p className="mt-3">
            上記の請求を行う場合は、下記のお問い合わせ先までご連絡ください。ご本人確認のうえ、合理的な期間内に対応いたします。
          </p>
        </section>

        {/* 11. Cookie の使用 */}
        <section id="cookies">
          <h2 className="text-xl font-semibold">11. Cookie の使用</h2>
          <p>
            本サービスでは、以下の目的で Cookie およびこれに類する技術を使用しています。
          </p>
          <ul className="list-disc space-y-1 pl-5">
            <li>
              <span className="font-medium">認証・セッション管理:</span>{" "}
              ログイン状態の維持やセキュリティの確保のため
            </li>
            <li>
              <span className="font-medium">オンボーディング:</span>{" "}
              初回利用時のガイダンス表示の制御のため
            </li>
            <li>
              <span className="font-medium">エラー監視:</span>{" "}
              Sentry によるエラートラッキングのため
            </li>
          </ul>
          <p className="mt-3">
            Cookie の詳細については{" "}
            <Link
              href="/legal/cookies"
              className="text-primary underline underline-offset-4"
            >
              Cookie ポリシー
            </Link>{" "}
            をご確認ください。ブラウザの設定により Cookie
            の受け入れを拒否することも可能ですが、その場合、本サービスの一部機能が正常に動作しない可能性があります。
          </p>
        </section>

        {/* 12. 未成年の利用 */}
        <section id="minors">
          <h2 className="text-xl font-semibold">12. 未成年の利用</h2>
          <p>
            本サービスは主に大学生を対象としており、基本的に18歳以上の方のご利用を想定しています。18歳未満の方が本サービスをご利用になる場合は、保護者の同意を得たうえでご利用ください。保護者の方は、お子様の個人情報について開示・訂正・削除を請求する権利を有しています。
          </p>
        </section>

        {/* 13. 将来のデータ共有 */}
        <section id="future-sharing">
          <h2 className="text-xl font-semibold">
            13. 将来のデータ共有について
          </h2>
          <p>
            本サービスでは、将来的に面接データの匿名共有機能の提供を予定しています。この機能は、面接の回答傾向や業界別のフィードバック傾向など、匿名化・統計化されたデータを他のユーザーと共有するものです。
          </p>
          <p>この機能の提供にあたっては、以下を遵守します。</p>
          <ul className="list-disc space-y-1 pl-5">
            <li>共有前にユーザーご本人の明示的な同意を取得します</li>
            <li>
              共有されるデータは、個人を特定できないよう十分な匿名化処理を施します
            </li>
            <li>
              匿名化の対象には、氏名、メールアドレス、大学名、企業名等の個人を識別しうる情報が含まれます
            </li>
            <li>同意はいつでも撤回可能です</li>
          </ul>
        </section>

        {/* 14. ポリシーの改定 */}
        <section id="amendment">
          <h2 className="text-xl font-semibold">14. ポリシーの改定</h2>
          <p>
            本ポリシーは、法令の変更やサービス内容の変更に伴い、改定することがあります。重要な変更がある場合は、本サービス上のバナー通知またはメールにてお知らせします。改定後のポリシーは、本ページに掲載された時点で効力を生じるものとします。
          </p>
        </section>

        {/* 15. お問い合わせ */}
        <section id="contact">
          <h2 className="text-xl font-semibold">15. お問い合わせ</h2>
          <p>
            本ポリシーに関するお問い合わせ、個人情報の開示・訂正・削除・利用停止の請求については、以下の連絡先までお願いいたします。
          </p>
          <div className="mt-4 rounded-lg border bg-muted/40 p-4">
            <p className="font-medium">InterviewCoach 運営事務局</p>
            <p className="mt-1">
              メール:{" "}
              <a
                href="mailto:support@interviewcoach.jp"
                className="text-primary underline underline-offset-4"
              >
                support@interviewcoach.jp
              </a>
            </p>
          </div>
        </section>
      </div>

      {/* フッターリンク */}
      <div className="mt-16 border-t pt-6 text-center text-sm text-muted-foreground">
        <Link href="/" className="text-primary underline-offset-4 hover:underline">
          トップページに戻る
        </Link>
      </div>
    </div>
  );
}
