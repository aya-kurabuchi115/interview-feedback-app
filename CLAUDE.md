# Interview Feedback App

## アーキテクチャ
- Next.js 15 (App Router) + TypeScript + Tailwind CSS
- Supabase (Auth, Database, Storage)
- AssemblyAI (Speech-to-Text + Speaker Diarization)
- Claude API (AI分析・フィードバック生成)
- Deploy: Vercel

## プロジェクト構成
- src/app/ -- ページ・API Routes
- src/components/ -- UIコンポーネント (shadcn/ui)
- src/lib/ -- ユーティリティ、APIクライアント
- src/hooks/ -- カスタム Hooks
- src/types/ -- TypeScript 型定義

## コーディング規約
- TypeScript strict mode
- React Server Components 優先
- Tailwind CSS（インラインスタイル禁止）
- テスト: Vitest + React Testing Library

## コマンド
- dev: npm run dev
- build: npm run build
- test: npm run test

## 重要ルール
- APIキーをコードにハードコードしない（環境変数を使用）
- Supabase RLS を常に有効にする
- コミットメッセージは英語、コメント・ドキュメントは日本語可

## 自律実装ガイド（GitHub Actions 用）
- ブランチ名: `issue-{番号}`（例: `issue-3`）
- コミットメッセージ: `feat: #{番号} - 説明` / `fix: #{番号} - 説明`
- PR 本文に `closes #{番号}` を必ず含める
- 実装後 `npm run build` を実行して成功を確認すること
- `.env` / `package-lock.json` は変更しない
- 新しい npm パッケージが必要な場合は `npm install` で追加してよい
