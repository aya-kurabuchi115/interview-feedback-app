# 課金・プラン 仕様書
> Status: Approved
> Last Updated: 2026-03-07

## 概要
Stripe を利用したサブスクリプション管理。Free / Pro / Premium の3段階プランで、模擬面接回数・ES添削利用可否・AIモデル品質が段階的に向上する。Webhook によるリアルタイムのプラン反映を実装。

## ユーザーストーリー
- US-SUB-1: ユーザーは料金プラン一覧を閲覧し、プランを比較できる
- US-SUB-2: ユーザーは Stripe Checkout でプランを購入できる
- US-SUB-3: ユーザーは Stripe Customer Portal でプラン変更・解約ができる
- US-SUB-4: 各機能の利用制限がプランに応じて適用される

## 画面構成

| URL | ページ名 | 概要 |
|-----|---------|------|
| `/pricing` | 料金プラン | 3プラン比較表 + CTAボタン |
| `/pricing/success` | 購入完了 | Checkout成功後リダイレクト先 |
| `/pricing/cancel` | 購入キャンセル | Checkoutキャンセル後リダイレクト先 |
| `/settings/billing` | 支払い管理 | 現在のプラン + Portal リンク |

## API エンドポイント

### `POST /api/stripe/checkout`
Stripe Checkout Session を作成する。
- Request: `{ plan?: "pro" | "premium" }` (デフォルト: pro)
- Response: `{ url: string }` (Checkout URL)
- 400: 同等以上のプランに加入済み
- 既存の stripe_customer_id があれば再利用、なければ新規作成

### `POST /api/stripe/portal`
Stripe Customer Portal Session を作成する。
- Response: `{ url: string }` (Portal URL)
- 戻りURL: `/settings/billing`

### `POST /api/stripe/webhook`
Stripe Webhook イベントを処理する（署名検証あり）。

| イベント | 処理内容 |
|---------|---------|
| `checkout.session.completed` | subscriptions に UPSERT |
| `customer.subscription.updated` | プラン・ステータス更新 |
| `customer.subscription.deleted` | plan→free, status→canceled |
| `invoice.paid` | 期間情報の更新 |
| `invoice.payment_failed` | status→past_due |

### `GET /api/subscription`
現在のサブスクリプション情報を返す（フロントエンド用）。

## データモデル

### `subscriptions` テーブル
- `id` UUID PK, `user_id` UUID FK (UNIQUE)
- `stripe_customer_id` TEXT, `stripe_subscription_id` TEXT
- `plan` subscription_plan ENUM (free/pro/premium/enterprise)
- `status` subscription_status ENUM (active/canceled/past_due/unpaid/trialing/incomplete/incomplete_expired/paused)
- `current_period_start` TIMESTAMPTZ, `current_period_end` TIMESTAMPTZ
- `cancel_at` TIMESTAMPTZ, `canceled_at` TIMESTAMPTZ
- `created_at`, `updated_at`

### subscription_plan ENUM
DB定義: `free`, `pro`, `enterprise` (00002)。`premium` はアプリ層で追加運用。

## ビジネスロジック

### プラン設定

| 項目 | Free | Pro (¥980/月) | Premium (¥1,980/月) |
|------|------|---------------|---------------------|
| 模擬面接 | 月1回 | 月30回 | 無制限 |
| ES添削 | 利用不可 | 利用不可 | 月30回 |
| AIモデル | gemini-2.5-flash | gemini-2.5-pro | gemini-2.5-pro |
| AI質問集 | - | - | 利用可 |
| 成長トラッキング | - | 利用可 | 利用可 |

### 利用制限チェック (`src/lib/subscription.ts`)
- `getUserSubscription(userId)`: active/trialing/past_due のサブスクリプションを取得
- `checkMockInterviewLimit(userId)`: 今月の模擬面接回数を `mock_interviews` から COUNT
- `checkEsReviewLimit(userId)`: 今月のES添削回数を `es_reviews` から COUNT
- `getModelForPlan(plan)`: プラン別AIモデル名を返す
- `getRemainingUsageByFeature(userId)`: ダッシュボード用の残り回数を一括取得

### Stripe 連携フロー
1. ユーザーが `/pricing` でプラン選択 → `POST /api/stripe/checkout`
2. Stripe Checkout 画面で決済 → `checkout.session.completed` Webhook
3. Webhook で `subscriptions` テーブルに UPSERT
4. 以降の利用制限チェックで新プランが反映される

### プラン判定ロジック
Webhook 内で Price ID またはメタデータの `plan` フィールドからプランを解決。
キャンセル時は `free` にダウングレード。

### ナッジバナー（ダッシュボード）
- Free プランで残り利用回数が1回以下: 黄色バナー
- Free プランで残り0回: 赤色バナー
- 「今月は表示しない」で月単位の localStorage dismiss

## セキュリティ
- `subscriptions` テーブルの RLS: SELECT のみユーザー許可、INSERT/UPDATE/DELETE は service_role 限定
- Webhook: `stripe-signature` ヘッダーで署名検証
- Checkout Session にはメタデータ (`supabase_user_id`, `plan`) を付与
- Webhook ハンドラは `createAdminClient()` (service_role) を使用

## 非機能要件
- Stripe Client SDK: `loadStripe` による遅延ロード
- Stripe Server SDK: シングルトンパターン
- Webhook の冪等性: `UPSERT` (onConflict: "user_id") で重複処理を防止
