import type { Metadata } from "next";
import Link from "next/link";

/** ISR: 24時間ごとに再検証（静的コンテンツ） */
export const revalidate = 86400;

export const metadata: Metadata = {
  title: "特定商取引法に基づく表記",
  description:
    "Menpass の特定商取引法に基づく表記。事業者情報・販売条件等を記載しています。",
  openGraph: {
    title: "特定商取引法に基づく表記 | Menpass",
    description:
      "Menpass の特定商取引法に基づく表記。事業者情報・販売条件等を記載しています。",
    url: "https://menpass.jp/legal/tokushoho",
  },
};

const items = [
  {
    label: "販売業者",
    content: "Menpass（個人運営）",
  },
  {
    label: "運営統括責任者",
    content: "お問い合わせ時に遅滞なく開示いたします",
  },
  {
    label: "所在地",
    content: "お問い合わせ時に遅滞なく開示いたします",
  },
  {
    label: "電話番号",
    content: "お問い合わせ時に遅滞なく開示いたします",
  },
  {
    label: "メールアドレス",
    content: "support@menpass.jp",
    isEmail: true,
  },
  {
    label: "販売価格",
    content: "無料プラン: 0円/月\nPro プラン: 980円/月（税込）",
  },
  {
    label: "支払方法",
    content: "クレジットカード（Stripe 経由）",
  },
  {
    label: "支払時期",
    content:
      "申込時に即時決済。以降、毎月同日に自動更新により決済されます。",
  },
  {
    label: "サービス提供時期",
    content: "申込完了後、すぐにご利用いただけます。",
  },
  {
    label: "返品・キャンセル",
    content:
      "デジタルサービスのため返品はお受けできません。解約はマイページからいつでも可能です。解約後も、現在の課金期間の終了日まで引き続きご利用いただけます。月途中の解約による日割り返金は行っておりません。",
  },
  {
    label: "動作環境",
    content:
      "最新版の Google Chrome、Mozilla Firefox、Safari、Microsoft Edge",
  },
] as const;

export default function TokushohoPage() {
  return (
    <div className="container mx-auto max-w-3xl px-4 py-12">
      {/* ページタイトル */}
      <h1 className="mb-2 text-3xl font-bold tracking-tight">
        特定商取引法に基づく表記
      </h1>
      <p className="mb-8 text-sm text-muted-foreground">
        制定日: 2026年3月1日 / 最終更新日: 2026年3月1日
      </p>

      {/* テーブル */}
      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full text-sm">
          <tbody>
            {items.map((item) => (
              <tr
                key={item.label}
                className="border-b last:border-b-0"
              >
                <th className="whitespace-nowrap bg-muted/40 px-4 py-3 text-left font-medium align-top w-40 md:w-48">
                  {item.label}
                </th>
                <td className="px-4 py-3">
                  {"isEmail" in item && item.isEmail ? (
                    <a
                      href={`mailto:${item.content}`}
                      className="text-primary underline underline-offset-4"
                    >
                      {item.content}
                    </a>
                  ) : (
                    <span className="whitespace-pre-line">
                      {item.content}
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 補足事項 */}
      <div className="mt-10 space-y-6 text-sm leading-relaxed">
        <section>
          <h2 className="mb-2 text-xl font-semibold">お問い合わせ</h2>
          <p>
            事業者情報の開示請求やサービスに関するお問い合わせは、以下の連絡先までお願いいたします。
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

        <section>
          <h2 className="mb-2 text-xl font-semibold">関連ページ</h2>
          <ul className="list-disc space-y-1 pl-5">
            <li>
              <Link
                href="/legal/terms"
                className="text-primary underline-offset-4 hover:underline"
              >
                利用規約
              </Link>
            </li>
            <li>
              <Link
                href="/legal/privacy"
                className="text-primary underline-offset-4 hover:underline"
              >
                プライバシーポリシー
              </Link>
            </li>
          </ul>
        </section>
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
