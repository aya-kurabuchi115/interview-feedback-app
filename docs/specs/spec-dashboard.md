# ダッシュボード 仕様書
> Status: Approved
> Last Updated: 2026-03-07

## 概要
ログイン後のホーム画面。模擬面接・ES添削・パーソナリティ診断への導線、利用状況の可視化、面接練習履歴、成長記録（スコア推移・カテゴリ分析・フィラー率推移）を提供する。

## ユーザーストーリー
- US-DASH-1: ユーザーはダッシュボードから模擬面接・ES添削・パーソナリティ診断にアクセスできる
- US-DASH-2: ユーザーは今月の模擬面接回数・ES添削回数の利用状況を確認できる
- US-DASH-3: ユーザーは直近の面接練習履歴を確認し、結果画面に遷移できる
- US-DASH-4: ユーザーは成長記録ページでスコア推移・カテゴリ別分析・フィラー率推移を確認できる

## 画面構成

| URL | ページ名 | 種別 |
|-----|---------|------|
| `/dashboard` | メインダッシュボード | Server (force-dynamic) |
| `/dashboard/growth` | 成長記録 | Server + Suspense |

## コンポーネント構成

### ダッシュボード (`/dashboard`)
1. **UsageNudgeBanner**: Free プラン残り利用回数が少ない場合のアップグレード誘導
2. **メインCTA**: 「AI模擬面接を始める」ボタン（グラデーション背景）
3. **クイックアクション**: AI質問集 / ES添削 / パーソナリティ診断（3列グリッド）
   - AI質問集・ES添削は Premium 限定バッジ表示（Premium/Enterprise以外）
4. **利用状況カード**: 模擬面接・ES添削の今月の使用回数/上限を表示（2列グリッド）
5. **MockInterviewHistory**: 直近10件の面接練習履歴（Suspense でストリーミング）

### 成長記録 (`/dashboard/growth`)
`GrowthContent` (async Server Component) が Suspense 境界内で以下を描画:
1. **統計サマリ**: 総面接数 / 平均スコア(前月比) / 最高スコア / 今月の面接数
2. **スコア推移**: 直近10件の CSS バーチャート
3. **カテゴリ別平均スコア**: テーブル + バー表示
4. **企業別平均スコア**: テーブル + バー表示
5. **フィラー率推移**: 直近10件のバーチャート（色分け: 緑<=2%, 黄<=5%, 赤>5%）
6. **面接カテゴリ別件数**: グリッドカード

## データ取得

### ダッシュボード
- `getRemainingUsageByFeature(userId)` → 利用状況(プラン・模擬面接・ES添削の使用数/上限)
- `mock_interviews` → 直近10件 (user_id フィルタ、created_at DESC)

### 成長記録
- `interviews` → completed のみ、user_id フィルタ、created_at ASC
- `feedbacks` → interview_ids IN + user_id フィルタ
- 統計計算はサーバーサイドで実施（クライアントにデータ送信不要）

## ビジネスロジック

### MockInterviewHistory コンポーネント
- ステータス表示: `in_progress` → 「面接中」(chat画面リンク) / `completed + feedback_id` → 「分析済み」(result画面リンク) / `completed + !feedback_id` → 「分析中」
- 表示ラベル: カテゴリ(総合/技術/行動/ケース)、ラウンド(一次/二次/最終)

### UsageNudgeBanner
- 表示条件: Free プラン AND (模擬面接残り<=1 OR ES添削残り<=1)
- 色分け: 残り0回 → 赤 / 残り1回 → 黄
- dismiss: `localStorage` に月単位で保存（月替わりでリセット）

### 成長記録の統計
- 平均スコア: 全フィードバックの overall_score の平均
- 前月比: 今月平均 vs 先月平均 の変化率(%)
- カテゴリ別: category_scores JSONB から各カテゴリの合計/件数を集計
- フィラー率: filler_words JSONB の `filler_rate` フィールドを抽出
  - 旧形式(配列)の場合は `filler_rate` が null → count のみ取得

## セキュリティ
- 全ページで認証必須 (`redirectToLogin`)
- RLS + アプリ層で `user_id` フィルタ (Defence-in-Depth)
- `force-dynamic` でキャッシュ無効化（常に最新データ取得）

## 非機能要件
- `MockInterviewHistory`: Suspense + fallback スケルトン
- `GrowthContent`: Suspense + `GrowthStatsSkeleton` でストリーミング
- 空状態: `EmptyState` コンポーネントで CTA を提供
- バーチャート: CSS ベース（外部チャートライブラリ不使用）
- スコア色分け: 緑>=80 / 黄>=60 / 赤<60
