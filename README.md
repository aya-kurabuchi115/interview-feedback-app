# InterviewCoach

AI を活用した面接対策 Web アプリケーション。AI 模擬面接・ES 添削・16 パーソナリティ診断・面接質問集など、面接準備に必要な機能をワンストップで提供します。

## 主要機能

- **AI 模擬面接** — AI 面接官とリアルタイムで面接練習
- **ES 添削** — エントリーシートを AI が添削・改善提案
- **16 パーソナリティ診断** — 16 タイプ診断テスト + AI による面接アドバイス
- **面接質問集** — 頻出質問 90 問（8 カテゴリ）+ フィルタ検索
- **課金プラン** — Stripe 連携（Free / Pro / Premium）
- **ユーザー認証** — メール/パスワード認証（Supabase Auth）
- **その他** — お問い合わせ、ヘルプ、法的ページ（利用規約・プライバシーポリシー）

## 技術スタック

- **フロントエンド**: Next.js 16 (App Router) + TypeScript + Tailwind CSS + shadcn/ui
- **バックエンド**: Next.js Server Actions + API Routes
- **認証・DB・ストレージ**: Supabase (Auth / PostgreSQL / Storage)
- **AI**: Gemini API（模擬面接・ES 添削・診断フィードバック）
- **決済**: Stripe（サブスクリプション管理）
- **監視**: Sentry（エラートラッキング）
- **デプロイ**: Vercel

## セットアップ

```bash
git clone https://github.com/<your-username>/interview-feedback-app.git
cd interview-feedback-app
npm install
cp .env.example .env.local
# .env.local に各サービスの API キーを設定
npm run dev
```

開発サーバーが http://localhost:3000 で起動します。

## 環境変数

`.env.example` を `.env.local` にコピーし、以下の値を設定してください。

| 変数名 | 説明 |
|--------|------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase プロジェクトの URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase の匿名キー |
| `GEMINI_API_KEY` | Google Gemini の API キー |
| `STRIPE_SECRET_KEY` | Stripe のシークレットキー |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe の公開キー |
| `SENTRY_DSN` | Sentry の DSN |

## ディレクトリ構成

```
src/
├── app/        # ページ・API Routes (App Router)
├── components/ # UI コンポーネント (shadcn/ui)
├── hooks/      # カスタム Hooks
├── lib/        # ユーティリティ、API クライアント
└── types/      # TypeScript 型定義
```

## 開発ルール

- ブランチ戦略: `main` ← `feature/*`, `fix/*`
- PR はテンプレートに沿って作成し、レビュー後にマージ
- コミットメッセージは英語、コメント・ドキュメントは日本語
- 詳細は [docs/PRD.md](docs/PRD.md) を参照
