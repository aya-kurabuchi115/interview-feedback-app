# Spec #160: ボタン操作後のフィードバックUI改善（ローディング状態・待機UX）

| 項目 | 値 |
|------|-----|
| Issue | [#160](https://github.com/aya-kurabuchi115/interview-feedback-app/issues/160) |
| Priority | p1 |
| Status | Draft |
| Created | 2026-03-01 |

## 1. 概要

### 1.1 背景

ボタン押下後のレスポンスが遅く感じられる問題がある。コードベース調査の結果、ログイン・サインアップ・プロフィール保存・面接登録・模擬面接開始のフォームには既にローディング状態（`Loader2` + `disabled`）が実装済みだが、以下の箇所でローディング状態が不足している:

- **パスワード更新ページ** (`src/app/update-password/page.tsx`): `loading` 中のボタンテキスト変更のみ（スピナーなし）
- **パスワードリセットページ** (`src/app/reset-password/page.tsx`): `loading` 中のボタンテキスト変更のみ（スピナーなし）
- **共有ボタン** (`src/components/share-button.tsx`): カスタム SVG スピナー使用（`Loader2` に統一されていない）
- **画面遷移全般**: 遷移インジケーターが未実装

### 1.2 ゴール

- 全フォーム送信ボタンのローディング状態を `Loader2` スピナー + `disabled` + テキスト変更のパターンに統一する
- Button コンポーネントに `loading` prop を追加し、プロジェクト全体でローディング UI を統一する
- 画面遷移時のローディングインジケーター（プログレスバー）を実装する

### 1.3 スコープ外

- ページ読み込み時のスケルトンスクリーン（#174 で対応）
- AI 分析処理のプログレス表示（`/interview/[id]/processing` で実装済み）
- API レスポンス速度の改善（バックエンド側の最適化）

## 2. ユーザーストーリー

As a ログイン済みユーザー, I want ボタンを押した後に視覚的なフィードバック（ローディング状態・処理完了の確認）を即座に受け取りたい so that 操作が受け付けられたことが分かり、不安なくサービスを利用できる.

## 3. 機能要件

### 3.1 基本フロー

#### 3.1.1 フォーム送信ボタン
1. ユーザーがフォーム送信ボタンをクリックする
2. ボタンが即座に `disabled` 状態になる
3. `Loader2` スピナーが表示され、ボタンテキストが進行形に変わる（例: 「保存」→「保存中...」）
4. 処理完了後、ボタンが通常状態に戻る

#### 3.1.2 画面遷移インジケーター
1. ユーザーがリンクまたはナビゲーションボタンをクリックする
2. 画面上部に薄いプログレスバーが表示される
3. ページ遷移完了後、プログレスバーが消える

### 3.2 代替フロー

- 処理が 30 秒以内に完了しない場合: タイムアウトとしてローディング状態を解除し、エラーメッセージを表示する
- ユーザーがローディング中にページを離脱: 副作用のクリーンアップを実行する

### 3.3 エラーフロー

- ネットワークエラー発生時: ローディング状態を解除し、エラーメッセージを表示する
- 連続クリック（ダブルクリック）: `disabled` 状態により二重送信を防止する

## 4. 受け入れ基準

- [ ] Button コンポーネント（`src/components/ui/button.tsx`）に `loading` prop が追加されている
- [ ] `loading=true` 時に `Loader2` スピナー表示 + `disabled` 状態 + `aria-busy="true"` が設定される
- [ ] パスワード更新ページ（`src/app/update-password/page.tsx`）に `Loader2` スピナーが追加されている
- [ ] パスワードリセットページ（`src/app/reset-password/page.tsx`）に `Loader2` スピナーが追加されている
- [ ] 共有ボタン（`src/components/share-button.tsx`）のカスタム SVG スピナーが `Loader2` に統一されている
- [ ] 画面遷移時のローディングインジケーター（プログレスバー）が実装されている
- [ ] ローディング中のボタンテキストは動詞の進行形（「保存中...」「送信中...」等）
- [ ] ネットワークエラー発生時にローディング状態が無限に続かない（タイムアウト 30 秒）
- [ ] 連続クリックによる二重送信が防止されている

## 5. 技術設計

### 5.1 変更対象ファイル

| ファイル | 変更内容 |
|----------|----------|
| `src/components/ui/button.tsx` | `loading` prop を追加。`loading=true` 時に `Loader2` スピナー表示 + `disabled` + `aria-busy` 設定 |
| `src/app/update-password/page.tsx` | L151-152 のボタンに `Loader2` スピナーを追加。Button の `loading` prop を使用 |
| `src/app/reset-password/page.tsx` | L180-185 のボタンに `Loader2` スピナーを追加。Button の `loading` prop を使用 |
| `src/components/share-button.tsx` | カスタム SVG スピナー（L193-209, L355-375 等）を `Loader2` コンポーネントに置換 |
| `src/components/navigation-progress.tsx` | **新規作成**: 画面遷移時のプログレスバーコンポーネント |
| `src/app/layout.tsx` | `NavigationProgress` コンポーネントの追加 |

### 5.2 データモデル（変更がある場合）

変更なし。

### 5.3 API（変更がある場合）

変更なし。

### 5.4 UI コンポーネント（変更がある場合）

#### 5.4.1 Button コンポーネントの拡張

```typescript
// src/components/ui/button.tsx に追加する props
interface ButtonProps extends React.ComponentProps<"button"> {
  loading?: boolean;
  loadingText?: string;
}

// loading=true 時の動作:
// - Loader2 スピナーを children の先頭に表示
// - disabled=true を自動適用
// - aria-busy="true" を設定
// - loadingText が指定されている場合はテキストを置換
```

#### 5.4.2 NavigationProgress コンポーネント

```typescript
// src/components/navigation-progress.tsx
// Next.js App Router の usePathname() を監視し、パス変更時にプログレスバーを表示
// - 画面上部に固定配置（position: fixed, top: 0, z-index: 50）
// - 高さ 2px、ブランドカラー
// - CSS アニメーションで 0% → 80% まで段階的に進行
// - 遷移完了時に 100% まで進行後フェードアウト
```

### 5.5 実装方針

1. **Button コンポーネント拡張**: 既存の `button.tsx` に `loading` prop を追加し、`loading=true` 時に自動的に `Loader2` と `disabled` を適用する。これにより、各フォームで個別にローディング処理を書く必要がなくなる。

2. **既存フォームの改修**: パスワード更新・リセットページの送信ボタンで、拡張した Button の `loading` prop を使用する。

3. **共有ボタンの統一**: `share-button.tsx` のカスタム SVG スピナーをすべて `Loader2` コンポーネントに置換する。

4. **NavigationProgress**: `usePathname()` の変更を `useEffect` で監視し、パス変更時にアニメーション付きプログレスバーを表示する。外部パッケージ（`nprogress`）は使用せず、軽量なカスタム実装とする。

## 6. 依存関係

- 前提: なし
- 関連: #174（スケルトンスクリーン — ページ読み込み UI の統一）

## 7. テスト計画

| テストケース | 種別 | 期待結果 |
|-------------|------|----------|
| Button `loading=true` 時のスピナー表示 | Unit | `Loader2` アイコンが表示される |
| Button `loading=true` 時の `disabled` 状態 | Unit | ボタンがクリック不可になる |
| Button `loading=true` 時の `aria-busy` 属性 | Unit | `aria-busy="true"` が設定される |
| パスワード更新フォーム送信時のスピナー | E2E | `Loader2` スピナーが表示される |
| パスワードリセットフォーム送信時のスピナー | E2E | `Loader2` スピナーが表示される |
| 画面遷移時のプログレスバー表示 | E2E | 画面上部にプログレスバーが表示される |
| 遷移完了後のプログレスバー消滅 | E2E | プログレスバーがフェードアウトする |
| ダブルクリック防止 | E2E | 2回目のクリックが無視される |
| タイムアウト（30秒後） | Unit | ローディング状態が解除される |

## 8. リスクと緩和策

| リスク | 影響度 | 緩和策 |
|--------|--------|--------|
| Button の `loading` prop 追加による既存コンポーネントへの影響 | 低 | `loading` はオプショナル prop であり、既存のボタンに影響しない |
| NavigationProgress の `usePathname` 監視がパフォーマンスに影響 | 低 | 軽量な実装にし、不要な再レンダリングを避ける |
| 共有ボタンのスピナー置換による表示差異 | 低 | 既存の `Loader2` を使用する他のフォームと同じデザインに統一される |
