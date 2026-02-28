# InterviewCoach

面接練習の録音を AI が分析し、回答内容・話し方の両面からフィードバックを自動生成する Web アプリケーション。

## 機能

- メール/パスワードによるユーザー認証（Supabase Auth）
- ブラウザ上での面接録音（MediaRecorder API）
- 音声の文字起こし + 話者分離（AssemblyAI）
- AI による回答分析・フィードバック生成（Claude API）
- 総合スコア・改善提案・フィラーワード検出などの結果表示

## 技術スタック

- **フロントエンド**: Next.js 15 (App Router) + TypeScript + Tailwind CSS + shadcn/ui
- **バックエンド**: Next.js Server Actions + API Routes
- **認証・DB・ストレージ**: Supabase (Auth / PostgreSQL / Storage)
- **文字起こし**: AssemblyAI（話者分離 + 日本語対応）
- **AI 分析**: Claude API (Sonnet)
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
| `ASSEMBLYAI_API_KEY` | AssemblyAI の API キー |
| `ANTHROPIC_API_KEY` | Anthropic (Claude) の API キー |

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
