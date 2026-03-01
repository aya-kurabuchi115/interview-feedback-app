# Spec #172: ログイン済みユーザーのリダイレクト改善（/login, /signup → /dashboard）

| 項目 | 値 |
|------|-----|
| Issue | [#172](https://github.com/aya-kurabuchi115/interview-feedback-app/issues/172) |
| Priority | p1 |
| Status | Draft |
| Created | 2026-03-01 |

## 1. 概要

### 1.1 背景

現在、ログイン済みユーザーが `/login` や `/signup` に直接アクセスすると、ログインフォーム・サインアップフォームがそのまま表示される。`src/middleware.ts` では `/`（トップページ）のみリダイレクト処理が実装済みだが、`/login` と `/signup` には未対応。これによりユーザーが不要な画面を目にする UX 上の問題がある。

### 1.2 ゴール

- ログイン済みユーザーが `/login` または `/signup` にアクセスした際、ミドルウェアレベルで `/dashboard` に 302 リダイレクトする
- リダイレクト時にフラッシュ（一瞬ログイン画面が表示される現象）が発生しない
- エラーパラメータ付きのアクセスやオンボーディング未完了など、例外ケースを適切に処理する

### 1.3 スコープ外

- `/reset-password` のリダイレクト（ログイン済みでもパスワードリセットは必要な場合がある）
- クライアントサイドでのリダイレクト処理（ミドルウェアレベルで完結させる）
- ログイン後のリダイレクト先パラメータ（`?redirect=/interview/new`）の完全実装（将来的な拡張として考慮のみ）

## 2. ユーザーストーリー

As a ログイン済みユーザー, I want `/login` や `/signup` にアクセスしたときに自動で `/dashboard` にリダイレクトされる so that 不要なログイン画面を見ずに、すぐにサービスを使い始められる.

## 3. 機能要件

### 3.1 基本フロー

1. ログイン済みユーザーが `/login` にアクセスする
2. ミドルウェアが `sb-*-auth-token` Cookie の存在を確認する
3. セッションが有効な場合、HTTP 302 で `/dashboard` にリダイレクトする
4. `/signup` へのアクセスも同様に処理する

### 3.2 代替フロー

- **オンボーディング未完了の場合**: `onboarding_completed` Cookie が `"true"` でない場合、`/dashboard` ではなく `/onboarding` にリダイレクトする
- **`?error=xxx` パラメータ付きの場合**: エラーメッセージを表示する必要があるため、リダイレクトせずにそのままログインページを表示する
- **未ログインユーザー**: 通常通り `/login`、`/signup` を表示する

### 3.3 エラーフロー

- **セッション Cookie 存在するが期限切れの場合**: Supabase のセッション更新処理（`updateSession`）がミドルウェア冒頭で実行されるため、期限切れの場合は Cookie がクリアされリダイレクトは発生しない
- **ミドルウェア処理中のエラー**: 既存のフォールバック動作（そのまま next）を維持する

## 4. 受け入れ基準

- [ ] ログイン済みユーザーが `/login` にアクセスすると `/dashboard` にリダイレクトされる
- [ ] ログイン済みユーザーが `/signup` にアクセスすると `/dashboard` にリダイレクトされる
- [ ] 未ログインユーザーは通常通り `/login`, `/signup` にアクセスできる
- [ ] リダイレクト時にフラッシュ（一瞬ログイン画面が見える）が発生しない
- [ ] SSR/ミドルウェアレベルでリダイレクト処理が行われる（クライアントサイドの遅延リダイレクトではない）
- [ ] `/login?error=xxx` のようなエラーパラメータ付きアクセスではリダイレクトせずエラーメッセージを表示する
- [ ] オンボーディング未完了のログイン済みユーザーは `/onboarding` にリダイレクトする
- [ ] リダイレクト時の HTTP ステータスコードが 302（一時的リダイレクト）である
- [ ] リダイレクト処理が 50ms 以内に完了する（体感的に即座）

## 5. 技術設計

### 5.1 変更対象ファイル

| ファイル | 変更内容 |
|----------|----------|
| `src/middleware.ts` | L138-147 の `/` リダイレクトロジックを拡張し、`/login` と `/signup` にも同様のリダイレクト処理を追加 |

### 5.2 データモデル（変更がある場合）

変更なし。

### 5.3 API（変更がある場合）

変更なし。

### 5.4 UI コンポーネント（変更がある場合）

変更なし。ミドルウェアレベルでリダイレクトするため、UI コンポーネントの変更は不要。

### 5.5 実装方針

`src/middleware.ts` の既存リダイレクトロジック（L138-147）を拡張する。`/` の処理と同様に `hasSession` チェックを行い、以下の条件でリダイレクトする。

```typescript
// /login, /signup → /dashboard リダイレクト
const authPaths = ["/login", "/signup"];
if (authPaths.includes(request.nextUrl.pathname)) {
  // エラーパラメータ付きの場合はリダイレクトしない（auth callback からのリダイレクト）
  if (request.nextUrl.searchParams.has("error")) {
    return response;
  }

  const hasSession = request.cookies.getAll().some(
    (cookie) => cookie.name.startsWith("sb-") && cookie.name.endsWith("-auth-token")
  );

  if (hasSession) {
    const url = request.nextUrl.clone();
    // オンボーディング未完了の場合は /onboarding にリダイレクト
    const onboardingCompleted = request.cookies.get("onboarding_completed")?.value;
    url.pathname = onboardingCompleted === "true" ? "/dashboard" : "/onboarding";
    return NextResponse.redirect(url);
  }
}
```

このロジックは既存の `shouldCheckOnboarding` 処理（L149-160）よりも前に配置する。既存の `/` リダイレクト処理（L138-147）の直後が適切。

## 6. 依存関係

- 前提: なし
- 関連: #30 オンボーディング（オンボーディング未完了時のリダイレクト先の整合性）

## 7. テスト計画

| テストケース | 種別 | 期待結果 |
|-------------|------|----------|
| ログイン済み + `/login` アクセス | E2E | `/dashboard` にリダイレクト（302） |
| ログイン済み + `/signup` アクセス | E2E | `/dashboard` にリダイレクト（302） |
| 未ログイン + `/login` アクセス | E2E | ログインページ表示 |
| 未ログイン + `/signup` アクセス | E2E | サインアップページ表示 |
| ログイン済み + `/login?error=auth` | E2E | ログインページ表示（リダイレクトなし） |
| ログイン済み + オンボーディング未完了 + `/login` | E2E | `/onboarding` にリダイレクト |

## 8. リスクと緩和策

| リスク | 影響度 | 緩和策 |
|--------|--------|--------|
| Cookie ベースの判定のため、セッション失効後に Cookie が残る可能性 | 低 | `updateSession` がミドルウェア冒頭で実行されるため、期限切れ Cookie はクリアされる |
| `?error` 以外のクエリパラメータ（将来の `?redirect=`）との整合性 | 低 | 現時点では `?error` のみ例外処理とし、将来の拡張時に再検討 |
