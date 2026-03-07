# AI模擬面接 仕様書
> Status: Approved
> Last Updated: 2026-03-07

## 概要
AIが面接官役となり、テキストチャット形式でリアルな模擬面接を体験できる機能。面接完了後にはAIが回答を分析し、質問ごとの評価・総合スコア・フィラー分析・模範回答を含む詳細なフィードバックを生成する。

## ユーザーストーリー
- US-MOCK-1: ユーザーは企業名・業界・面接タイプ・ラウンド・質問数・難易度を選んで模擬面接を開始できる
- US-MOCK-2: ユーザーはテキストまたは音声入力で面接官の質問に回答できる
- US-MOCK-3: 面接完了後、質問ごとの評価・模範回答・フィラー分析を含むフィードバックを受け取れる
- US-MOCK-4: ユーザーは過去の模擬面接履歴を一覧表示し、結果を閲覧できる

## 画面構成

| URL | ページ名 | 種別 |
|-----|---------|------|
| `/mock-interview` | セットアップ画面 | Server + Client |
| `/mock-interview/[id]/chat` | チャット画面 | Server + Client (dynamic import) |
| `/mock-interview/[id]/result` | 結果画面 | Server + Client (dynamic import) |
| `/mock-interview/history` | 履歴一覧 | Server |

## API エンドポイント

### `POST /api/mock-interview`
面接セッションを作成し最初の質問を生成する。
- Request: `{ company_name?, industry?, category, round, max_questions, difficulty }`
- Response: `{ id, firstQuestion }`
- プラン制限チェック (`checkMockInterviewLimit`) を実施

### `POST /api/mock-interview/[id]/respond`
ユーザーの回答を送信し、次の質問を取得する。
- Request: `{ answer, forceEnd? }`
- Response: `{ question, isComplete, questionNumber, totalQuestions }`
- `[INTERVIEW_COMPLETE]` タグまたは `forceEnd` フラグで面接終了を判定

### `POST /api/mock-interview/[id]/feedback`
面接完了後にフィードバックを生成する。
- Response: `{ success, feedback_id, interview_id }`
- 409: 既にフィードバック生成済み
- `interviews` + `feedbacks` テーブルにレコードを作成

## データモデル

### `mock_interviews` テーブル
- `id` UUID PK, `user_id` UUID FK, `company_name` TEXT?, `industry` TEXT?
- `category` TEXT (general/behavioral/technical/case)
- `round` TEXT (first/second/third/final)
- `duration_minutes` INT (実質は max_questions として使用: 3/5/8/12)
- `difficulty` TEXT (easy/normal/hard)
- `messages` JSONB (MockInterviewMessage[]), `status` TEXT (in_progress/completed)
- `total_questions` INT, `feedback_id` UUID? FK(feedbacks), `started_at`, `completed_at`

### MockInterviewMessage 型
```typescript
{ role: "interviewer" | "user"; content: string; timestamp: string }
```

## ビジネスロジック

### プラン別利用制限
| プラン | 月間上限 | AIモデル |
|--------|---------|----------|
| Free | 1回 | gemini-2.5-flash |
| Pro | 30回 | gemini-2.5-pro |
| Premium | 無制限 | gemini-2.5-pro |

### AI処理フロー
1. セットアップ: Gemini API でシステムプロンプト生成 → 最初の質問を生成
2. 応答: 会話履歴を Gemini Chat 形式に変換 → 次の質問を生成
3. 終了判定: `questionCount >= maxQuestions` or `[INTERVIEW_COMPLETE]` タグ or `forceEnd`
4. フィードバック: 会話全体をプロンプトに入れて JSON 形式で評価を生成（最大3回リトライ）

### フィードバック評価項目
- 総合スコア (0-100), カテゴリスコア (logic/specificity/expression/impression)
- 質問ごとの評価 (good_points, improvement_points, model_answer, score)
- フィラー分析 (total_count, filler_rate, details, assessment)
- パーソナリティタイプ連携（診断済みの場合、タイプ別アドバイスを追加）

### 企業名サジェスト
- `companies` テーブルから `ilike` 検索（最大5件）
- 完全一致時に業界を自動セット（300msデバウンス）

### 音声入力
- `useAudioRecorder` Hook + `/api/stt` で文字起こし → テキストに追加

## セキュリティ
- 全ページ・APIで認証必須 (`supabase.auth.getUser`)
- RLS: `mock_interviews` に `FOR ALL` ポリシー (auth.uid() = user_id)
- Defence-in-Depth: アプリ層でも `.eq("user_id", user.id)` フィルタ
- プロンプトインジェクション対策: ユーザー入力を `<candidate_answer>` タグで囲む
- 回答文字数制限: 5,000文字

## 非機能要件
- チャットUI: dynamic import で遅延ロード
- 自動スクロール・タイピングインジケーター
- フィードバック生成: Gemini Pro モデル固定（リトライ: exponential backoff, 最大3回）
- Esc キーでダイアログ閉じる対応
