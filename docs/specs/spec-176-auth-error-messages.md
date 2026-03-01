# Spec #176: 認証コールバックのエラーメッセージ改善

| 項目 | 値 |
|------|-----|
| Issue | [#176](https://github.com/aya-kurabuchi115/interview-feedback-app/issues/176) |
| Priority | p2 |
| Status | Draft |
| Created | 2026-03-01 |

## 1. 概要

### 1.1 背景

現在、認証コールバック（`/auth/callback` および `/api/auth/callback`）でエラーが発生した場合、ログインページにリダイレクトされるが、エラーメッセージが曖昧または技術的で、ユーザーには何が起きたか分かりにくい。

主な問題:
- `/auth/callback` のエラー時: `/login?error=auth` にリダイレクトし、ログインページでは「auth」とだけ表示される
- `/api/auth/callback` のエラー時: 固定の日本語メッセージを表示するが、エラーの種類に関わらず同一メッセージ
- `error` パラメータの値がそのまま `setError()` で表示されており、XSS 脆弱性のリスクがある

### 1.2 ゴール

- エラーコードベースのマッピングシステムを導入し、ユーザーフレンドリーな日本語メッセージを表示する
- エラーの種類に応じたリカバリーアクション（再サインアップ、パスワードリセット再リクエスト等）を提示する
- XSS 対策として、マッピングテーブルに存在しない `error` パラメータは汎用メッセージに置換する

### 1.3 スコープ外

- ログインフォーム自体のバリデーションエラー（既に実装済み）
- Supabase SDK 側のエラーハンドリングの変更
- セッション切れ時のユーザー通知（#175 で対応）

## 2. ユーザーストーリー

As a ユーザー, I want 認証エラーが発生した場合に具体的で分かりやすいエラーメッセージを受け取りたい so that 何が問題で、どう対処すればよいかが分かる.

## 3. 機能要件

### 3.1 基本フロー

1. 認証コールバックでエラーが発生する
2. エラーの種類に応じたエラーコードをクエリパラメータに付与してログインページにリダイレクトする
3. ログインページでエラーコードをマッピングテーブルから日本語メッセージに変換して表示する
4. メッセージにはリカバリーアクションへのリンクを含める

### 3.2 代替フロー

- マッピングテーブルに存在しないエラーコードの場合: 汎用メッセージ「認証処理中にエラーが発生しました。もう一度お試しください。」を表示する
- 複数のエラーパラメータが付与された場合: 最初のエラーコードのみ処理する

### 3.3 エラーフロー

- メール確認リンクの期限切れ（24時間超過）: `email_expired` コードで「確認リンクの有効期限が切れています。再度サインアップしてください。」を表示
- 既に使用済みの確認コード: `code_used` コードで「このリンクは既に使用済みです。ログインしてください。」を表示
- パスワードリカバリーリンクの期限切れ: `recovery_expired` コードで「パスワードリセットリンクの有効期限が切れています。再度リセットをリクエストしてください。」を表示
- Supabase 環境変数未設定: `config_error` コードで「サーバーの設定に問題があります。管理者にお問い合わせください。」を表示

## 4. 受け入れ基準

- [ ] `/auth/callback` のエラー時リダイレクトで、エラーコード（`auth_error`, `recovery_error`, `config_error`）を使用する
- [ ] `/api/auth/callback` のエラーメッセージをエラーの種類に応じて分岐（`email_expired`, `code_used`, `auth_error` 等）する
- [ ] ログインページで認識されたエラーコードを日本語のユーザーフレンドリーなメッセージに変換して表示する
- [ ] 不明なエラーコードの場合は汎用メッセージを表示する
- [ ] 各エラーメッセージにリカバリーアクション（リンク）を含める
- [ ] エラーメッセージは赤色のバナー（既存の `bg-destructive/10` スタイル）で表示する
- [ ] `error` パラメータに XSS ペイロードが含まれる場合でもサニタイズされる（マッピングテーブルに存在しない値は汎用メッセージに置換）

## 5. 技術設計

### 5.1 変更対象ファイル

| ファイル | 変更内容 |
|----------|----------|
| `src/app/auth/callback/route.ts` | エラー時のリダイレクト URL のクエリパラメータをエラーコードに変更。L66 の `error=auth` をエラー種別に応じた具体的なコードに置換 |
| `src/app/api/auth/callback/route.ts` | エラー時のリダイレクトでエラーコードを使用。L27-29 のハードコード日本語メッセージをエラーコードに置換。Supabase エラー内容に応じた分岐追加 |
| `src/app/login/page.tsx` | エラーコード → 日本語メッセージマッピングの追加。L37-42 のエラーパラメータ処理を改修 |
| `src/lib/auth/error-messages.ts` | **新規作成**: エラーコード → メッセージのマッピング定義。全ファイルで共有 |

### 5.2 データモデル（変更がある場合）

変更なし。

### 5.3 API（変更がある場合）

変更なし。リダイレクト URL のクエリパラメータのみ変更。

### 5.4 UI コンポーネント（変更がある場合）

`src/app/login/page.tsx` のエラー表示部分を改修。エラーメッセージにリカバリーアクション（リンク）を含める構造に変更する。

### 5.5 エラーコードマッピング定義

`src/lib/auth/error-messages.ts` に以下を定義:

```typescript
export interface AuthErrorInfo {
  message: string;
  action?: {
    label: string;
    href: string;
  };
}

export const AUTH_ERROR_MESSAGES: Record<string, AuthErrorInfo> = {
  auth_error: {
    message: "認証処理中にエラーが発生しました。もう一度お試しください。",
  },
  config_error: {
    message: "サーバーの設定に問題があります。管理者にお問い合わせください。",
  },
  email_expired: {
    message: "確認リンクの有効期限が切れています。再度サインアップしてください。",
    action: { label: "サインアップ", href: "/signup" },
  },
  code_used: {
    message: "このリンクは既に使用済みです。ログインしてください。",
  },
  recovery_expired: {
    message: "パスワードリセットリンクの有効期限が切れています。再度リセットをリクエストしてください。",
    action: { label: "パスワードリセット", href: "/reset-password" },
  },
  email_confirm_failed: {
    message: "メール確認に失敗しました。もう一度お試しください。",
    action: { label: "サインアップ", href: "/signup" },
  },
};

export const DEFAULT_ERROR: AuthErrorInfo = {
  message: "認証処理中にエラーが発生しました。もう一度お試しください。",
};

export function getAuthErrorInfo(code: string | null): AuthErrorInfo | null {
  if (!code) return null;
  return AUTH_ERROR_MESSAGES[code] ?? DEFAULT_ERROR;
}
```

### 5.6 コールバックルートのエラーコード分岐

`src/app/auth/callback/route.ts`:

```typescript
// L32-33: config エラー
return NextResponse.redirect(`${origin}/login?error=config_error`);

// L66: 認証エラー（コード交換失敗）
return NextResponse.redirect(`${origin}/login?error=auth_error`);
```

`src/app/api/auth/callback/route.ts`:

```typescript
if (code) {
  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (!error) {
    return NextResponse.redirect(`${redirectBase}${next}`);
  }

  // Supabase エラーメッセージに基づく分岐
  const errorCode = error.message.includes("expired")
    ? "email_expired"
    : error.message.includes("already used") || error.message.includes("already confirmed")
    ? "code_used"
    : "email_confirm_failed";

  return NextResponse.redirect(`${redirectBase}/login?error=${errorCode}`);
}

// code パラメータが無い場合
return NextResponse.redirect(`${redirectBase}/login?error=auth_error`);
```

## 6. 依存関係

- 前提: なし
- 関連: #175（セッション切れ時のユーザー通知改善）
- 関連: #172（ログイン済みユーザーのリダイレクト改善 — `?error` パラメータの例外処理に影響）

## 7. テスト計画

| テストケース | 種別 | 期待結果 |
|-------------|------|----------|
| `/login?error=auth_error` | Unit | 「認証処理中にエラーが発生しました。」メッセージ表示 |
| `/login?error=email_expired` | Unit | 期限切れメッセージ + 「サインアップ」リンク表示 |
| `/login?error=recovery_expired` | Unit | リセット期限切れメッセージ + 「パスワードリセット」リンク表示 |
| `/login?error=config_error` | Unit | サーバー設定エラーメッセージ表示 |
| `/login?error=unknown_code` | Unit | 汎用エラーメッセージ表示 |
| `/login?error=<script>alert(1)</script>` | Unit | XSS が実行されず汎用メッセージ表示 |
| `/auth/callback` でコード交換失敗 | E2E | `/login?error=auth_error` にリダイレクト |
| `/api/auth/callback` で期限切れコード | E2E | `/login?error=email_expired` にリダイレクト |

## 8. リスクと緩和策

| リスク | 影響度 | 緩和策 |
|--------|--------|--------|
| Supabase のエラーメッセージ形式が変更される可能性 | 中 | エラーメッセージの `includes` チェックに加え、デフォルトのフォールバックを必ず用意する |
| XSS 攻撃の `error` パラメータ | 高 | マッピングテーブルに存在しない値は一律汎用メッセージに置換。ユーザー入力を直接 DOM に反映しない |
| エラーコードの追加漏れ | 低 | デフォルトメッセージ（`DEFAULT_ERROR`）を必ず返す設計にする |
