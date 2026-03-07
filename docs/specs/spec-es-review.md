# ES添削 仕様書
> Status: Approved
> Last Updated: 2026-03-07

## 概要
AIがエントリーシート（ES）の回答を、構成・具体性・説得力・文法の4観点で添削する機能。Premium プラン限定。過去の模擬面接履歴やパーソナリティ診断結果を踏まえたフィードバックも提供する。

## ユーザーストーリー
- US-ES-1: ユーザーはESの設問と回答を入力し、AIに添削を依頼できる
- US-ES-2: ユーザーは4カテゴリの詳細スコア・Before/After改善提案・AI書き直し例を確認できる
- US-ES-3: ユーザーは過去のES添削履歴を一覧表示し、結果を閲覧できる
- US-ES-4: Premium プラン以外のユーザーにはアップグレード誘導が表示される

## 画面構成

| URL | ページ名 | 種別 |
|-----|---------|------|
| `/es-review` | 入力画面 | Client Component |
| `/es-review/[id]` | 結果画面 | Server + Client (dynamic import) |
| `/es-review/history` | 添削履歴 | Server + Client |

## API エンドポイント

### `POST /api/es-review`
ES添削を実行する。
- Request: `{ question: string, answer: string }`
- Response: `{ success, review_id, feedback }`
- 403 (PREMIUM_REQUIRED): Premium/Enterprise 以外
- 403 (USAGE_LIMIT_EXCEEDED): 月間上限到達

### バリデーション
- 設問: 必須、最大500文字
- 回答: 必須、50〜2,000文字
- 推奨文字数: 400文字以内（UI上で警告表示）

## データモデル

### `es_reviews` テーブル
- `id` UUID PK, `user_id` UUID FK
- `question` TEXT NOT NULL, `answer` TEXT NOT NULL
- `char_count` INT, `feedback` JSONB?, `score` INT? (0-100)
- `status` TEXT (pending/analyzing/completed/error)
- `model_version` TEXT?, `created_at`, `updated_at`

### ESFeedback 型 (JSONB)
```typescript
{
  overall_score: number;           // 0-100
  categories: {
    structure:      { score: number; comment: string };  // 構成
    specificity:    { score: number; comment: string };  // 具体性
    persuasiveness: { score: number; comment: string };  // 説得力
    grammar:        { score: number; comment: string };  // 文法
  };
  good_points: string[];
  improvement_points: string[];
  suggestions: { original: string; improved: string; reason: string }[];
  rewritten_answer: string;        // AI書き直し例
  personality_advice?: string;     // パーソナリティ連携時のみ
  interview_based_advice?: string; // 模擬面接履歴がある場合のみ
}
```

## ビジネスロジック

### プラン制限
| プラン | ES添削 |
|--------|--------|
| Free | 利用不可 (0回) |
| Pro | 利用不可 (0回) |
| Premium | 月30回 |

### AI処理フロー
1. 認証 + Premium プラン確認
2. `es_reviews` に status=analyzing で INSERT
3. プロフィールからパーソナリティタイプを取得
4. 過去の模擬面接(completed、直近5件)からQ&Aペアを抽出（最大10ペア）
5. システムプロンプト + ユーザープロンプトを構築
6. Gemini Pro API 呼び出し（JSON形式、最大3回リトライ）
7. フィードバックを `es_reviews` に保存 (status=completed)
8. エラー時は status=error に更新

### プロンプトインジェクション対策
- ユーザー入力を `<user_question>` / `<user_answer>` タグで囲む
- システムプロンプトにタグ内テキストを指示として解釈しないルールを明記

### 下書き保存
- `sessionStorage` にリアルタイム保存（キー: `es-review-draft`）
- 送信成功時に自動クリア

### クロス機能連携
- パーソナリティ診断: タイプ別のES作成アドバイスを追加
- 模擬面接履歴: 面接で話したエピソードをESに活かす提案

## セキュリティ
- 全ページ・APIで認証必須
- RLS: `es_reviews` に SELECT/INSERT/UPDATE/DELETE ポリシー (auth.uid() = user_id)
- Defence-in-Depth: API内で `.eq("user_id", user.id)` フィルタ
- API Route はプラン検証を必ず実行

## 非機能要件
- 結果画面: dynamic import で遅延ロード
- 質問例5種のワンクリック入力
- 文字数カウント + プログレスバー（推奨400文字基準）
- 添削処理: 約30秒（UI上で通知）
- 添削履歴: 最大50件取得（降順）
