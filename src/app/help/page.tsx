import type { Metadata } from "next";
import Link from "next/link";
import {
  Mic,
  FileText,
  Brain,
  CreditCard,
  Shield,
  HelpCircle,
  ChevronDown,
} from "lucide-react";

export const revalidate = 86400;

export const metadata: Metadata = {
  title: "ヘルプ・FAQ",
  description:
    "InterviewCoach の使い方やよくある質問をまとめたヘルプページです。",
  openGraph: {
    title: "ヘルプ・FAQ | InterviewCoach",
    description:
      "InterviewCoach の使い方やよくある質問をまとめたヘルプページです。",
    url: "https://interviewcoach.jp/help",
  },
};

// ============================================================
// FAQ データ
// ============================================================

interface FaqItem {
  question: string;
  answer: string;
}

interface FaqCategory {
  id: string;
  title: string;
  icon: React.ReactNode;
  items: FaqItem[];
}

const FAQ_CATEGORIES: FaqCategory[] = [
  {
    id: "getting-started",
    title: "はじめに",
    icon: <HelpCircle className="h-5 w-5" />,
    items: [
      {
        question: "InterviewCoach とは何ですか？",
        answer:
          "InterviewCoach は、AI を活用した面接練習・フィードバックサービスです。面接の録音やテキスト入力から、話し方・内容・構成などを AI が分析し、改善点を具体的にフィードバックします。",
      },
      {
        question: "無料で使えますか？",
        answer:
          "はい。Free プランでは月3回まで面接分析をご利用いただけます。より多くの分析が必要な場合は Pro プラン（月額¥980）や Premium プラン（月額¥1,980）をご検討ください。",
      },
      {
        question: "アカウント登録は必要ですか？",
        answer:
          "はい。面接の分析結果を保存・管理するためにアカウント登録が必要です。メールアドレスとパスワードで簡単に登録できます。",
      },
    ],
  },
  {
    id: "recording",
    title: "面接の録音・登録",
    icon: <Mic className="h-5 w-5" />,
    items: [
      {
        question: "面接を録音するにはどうすればいいですか？",
        answer:
          "ダッシュボードの「新しい面接を記録」から、マイクボタンをクリックして録音を開始できます。ブラウザのマイク許可が必要です。録音が完了したら「送信」ボタンで分析を開始します。",
      },
      {
        question: "テキストで面接内容を入力することもできますか？",
        answer:
          "はい。録音の他に、面接の書き起こしテキストを直接入力して分析することもできます。「テキスト入力」タブに切り替えて、面接内容を貼り付けてください。",
      },
      {
        question: "対応している音声フォーマットは何ですか？",
        answer:
          "ブラウザで録音した WebM 形式のほか、MP3、MP4、WAV、OGG に対応しています。ファイルサイズは最大 50MB までです。",
      },
      {
        question: "話者分離（誰が話しているか）は自動で判別されますか？",
        answer:
          "はい。音声から AI が自動的に面接官と受験者の発言を分離します。最初に話し始めた方が面接官として認識されます。",
      },
    ],
  },
  {
    id: "analysis",
    title: "AI 分析・フィードバック",
    icon: <Brain className="h-5 w-5" />,
    items: [
      {
        question: "分析にはどのくらい時間がかかりますか？",
        answer:
          "音声の場合は文字起こしに約1〜3分、AI 分析に約1〜2分かかります。テキスト入力の場合は AI 分析のみのため、約1〜2分で完了します。処理中はページを閉じても問題ありません。",
      },
      {
        question: "どのような項目が分析されますか？",
        answer:
          "回答の論理性・具体性・簡潔さ、STAR法の活用度、フィラー（えーと、あの等）の頻度、話の構成力など多角的に分析します。総合スコアと各項目の改善アドバイスが提供されます。",
      },
      {
        question: "フィラー分析とは何ですか？",
        answer:
          "「えーと」「あの」「まあ」などの言い淀み（フィラー）の出現回数と割合を分析する機能です。面接ではフィラーが多いと自信がなく聞こえることがあるため、改善の参考にしてください。",
      },
      {
        question: "過去の分析結果を比較できますか？",
        answer:
          "はい。ダッシュボードから2つの面接結果を選んで比較できます。スコアの変化や改善ポイントを視覚的に確認できます。",
      },
    ],
  },
  {
    id: "mock-interview",
    title: "AI 模擬面接",
    icon: <FileText className="h-5 w-5" />,
    items: [
      {
        question: "AI 模擬面接とはどんな機能ですか？",
        answer:
          "AI が面接官役となり、リアルタイムで模擬面接を行います。業界・職種に合わせた質問が出題され、回答後に即座にフィードバックが得られます。",
      },
      {
        question: "模擬面接の質問は業界ごとに異なりますか？",
        answer:
          "はい。面接開始前に業界・職種・面接ラウンド・面接官のスタイル（穏やか・厳しい等）を選択でき、それに合わせた質問が生成されます。",
      },
    ],
  },
  {
    id: "billing",
    title: "料金・プラン",
    icon: <CreditCard className="h-5 w-5" />,
    items: [
      {
        question: "プランの違いは何ですか？",
        answer:
          "Free プラン: 月3回の分析（AI Haiku モデル）。Pro プラン（¥980/月）: 月30回の分析（AI Sonnet モデル）。Premium プラン（¥1,980/月）: 無制限の分析（AI Sonnet モデル）。上位プランほど高精度な AI モデルを使用します。",
      },
      {
        question: "プランの変更やキャンセルはできますか？",
        answer:
          "はい。「プラン管理」ページからいつでもプランの変更やキャンセルが可能です。キャンセルしても現在の請求期間中はサービスをご利用いただけます。",
      },
      {
        question: "支払い方法は何ですか？",
        answer:
          "クレジットカード（Visa、Mastercard、American Express、JCB）でお支払いいただけます。決済は Stripe を利用しており、カード情報は当社サーバーには保存されません。",
      },
    ],
  },
  {
    id: "account",
    title: "アカウント・セキュリティ",
    icon: <Shield className="h-5 w-5" />,
    items: [
      {
        question: "パスワードを忘れた場合はどうすればいいですか？",
        answer:
          "ログイン画面の「パスワードをお忘れですか？」リンクからパスワードリセットが可能です。登録メールアドレスにリセット用のリンクが送信されます。",
      },
      {
        question: "アカウントを削除（退会）するにはどうすればいいですか？",
        answer:
          "プロフィールページの最下部にある「アカウント削除」セクションから退会できます。パスワードの確認が必要です。削除すると、すべての面接記録・分析結果・プロフィール情報が完全に削除され、復元できません。",
      },
      {
        question: "データのエクスポートはできますか？",
        answer:
          "はい。ダッシュボードの設定からデータのエクスポートが可能です。面接記録と分析結果を JSON 形式でダウンロードできます。",
      },
      {
        question: "面接データのプライバシーは保護されていますか？",
        answer:
          "はい。すべてのデータは暗号化されて保存され、ご本人のみアクセス可能です（RLS ポリシーによるアクセス制御）。詳しくはプライバシーポリシーをご覧ください。",
      },
    ],
  },
];

// ============================================================
// コンポーネント
// ============================================================

export default function HelpPage() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      {/* ヘッダー */}
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold">ヘルプ・FAQ</h1>
        <p className="mt-2 text-muted-foreground">
          InterviewCoach の使い方やよくある質問をまとめています
        </p>
      </div>

      {/* カテゴリナビゲーション */}
      <nav className="mb-8 flex flex-wrap justify-center gap-2">
        {FAQ_CATEGORIES.map((category) => (
          <a
            key={category.id}
            href={`#${category.id}`}
            className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            {category.icon}
            {category.title}
          </a>
        ))}
      </nav>

      {/* FAQ セクション */}
      <div className="space-y-8">
        {FAQ_CATEGORIES.map((category) => (
          <section key={category.id} id={category.id}>
            <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold">
              {category.icon}
              {category.title}
            </h2>
            <div className="space-y-3">
              {category.items.map((item, index) => (
                <details
                  key={index}
                  className="group rounded-lg border bg-card"
                >
                  <summary className="flex cursor-pointer items-center justify-between gap-2 p-4 text-sm font-medium [&::-webkit-details-marker]:hidden">
                    {item.question}
                    <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180" />
                  </summary>
                  <div className="border-t px-4 py-3 text-sm leading-relaxed text-muted-foreground">
                    {item.answer}
                  </div>
                </details>
              ))}
            </div>
          </section>
        ))}
      </div>

      {/* お問い合わせ */}
      <div className="mt-12 rounded-lg border bg-muted/50 p-6 text-center">
        <h2 className="text-lg font-semibold">解決しない場合</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          上記で解決しない場合は、お気軽にお問い合わせください。
        </p>
        <a
          href="mailto:support@interviewcoach.jp"
          className="mt-3 inline-block text-sm font-medium text-primary underline-offset-4 hover:underline"
        >
          support@interviewcoach.jp
        </a>
      </div>

      {/* フッターリンク */}
      <div className="mt-8 flex flex-wrap justify-center gap-4 text-sm text-muted-foreground">
        <Link
          href="/legal/terms"
          className="underline-offset-4 hover:text-foreground hover:underline"
        >
          利用規約
        </Link>
        <Link
          href="/legal/privacy"
          className="underline-offset-4 hover:text-foreground hover:underline"
        >
          プライバシーポリシー
        </Link>
        <Link
          href="/pricing"
          className="underline-offset-4 hover:text-foreground hover:underline"
        >
          料金プラン
        </Link>
      </div>
    </div>
  );
}
