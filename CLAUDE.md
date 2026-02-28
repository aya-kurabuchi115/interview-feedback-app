# Interview Feedback App

## Architecture
- Next.js 15 (App Router) + TypeScript + Tailwind CSS
- Supabase (Auth, Database, Storage)
- AssemblyAI (Speech-to-Text + Speaker Diarization)
- Claude API (AI分析・フィードバック生成)
- Deploy: Vercel

## Project Structure
- src/app/ -- ページ・API Routes
- src/components/ -- UIコンポーネント (shadcn/ui)
- src/lib/ -- ユーティリティ、APIクライアント
- src/hooks/ -- カスタム Hooks
- src/types/ -- TypeScript 型定義

## Code Standards
- TypeScript strict mode
- React Server Components 優先
- Tailwind CSS（インラインスタイル禁止）
- テスト: Vitest + React Testing Library

## Commands
- dev: npm run dev
- build: npm run build
- test: npm run test

## Important Rules
- APIキーをコードにハードコードしない（環境変数を使用）
- Supabase RLS を常に有効にする
- コミットメッセージは英語、コメント・ドキュメントは日本語可
