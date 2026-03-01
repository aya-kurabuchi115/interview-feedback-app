# メールテンプレート

InterviewCoach の認証メールテンプレートを管理するディレクトリです。

## テンプレート一覧

| ファイル | 用途 | 件名 |
|----------|------|------|
| `confirm-signup.html` | サインアップ確認メール | InterviewCoach - メールアドレスの確認 |
| `reset-password.html` | パスワードリセットメール | InterviewCoach - パスワードのリセット |
| `magic-link.html` | マジックリンクメール | InterviewCoach - ログインリンク |
| `change-email.html` | メールアドレス変更確認メール | InterviewCoach - メールアドレスの変更確認 |

## デザイン仕様

- ヘッダー: 背景色 `#1e3a5f`（ダークブルー）、テキスト白
- 本文: 背景色 `#ffffff`、テキスト `#333333`
- CTA ボタン: 背景色 `#1e3a5f`、テキスト白、角丸 6px
- フッター: 背景色 `#f5f5f5`、テキスト `#888888`、フォントサイズ 12px
- 最大幅: 600px（モバイルレスポンシブ対応）
- レイアウト: テーブルベース（Outlook 互換）
- スタイル: インライン（メールクライアント互換）

## テンプレート変数（Supabase）

| 変数 | 説明 |
|------|------|
| `{{ .ConfirmationURL }}` | 確認・リセット等のアクション URL |
| `{{ .Token }}` | 認証トークン |
| `{{ .SiteURL }}` | サイトの URL |

## Supabase Dashboard への適用手順

Supabase Dashboard →「Authentication」→「Email Templates」

### 1. Confirm signup（サインアップ確認）

1. 「Confirm signup」タブを選択
2. Subject に `InterviewCoach - メールアドレスの確認` を入力
3. Body（HTML）に `confirm-signup.html` の内容を貼り付け
4. 「Save」をクリック

### 2. Reset password（パスワードリセット）

1. 「Reset password」タブを選択
2. Subject に `InterviewCoach - パスワードのリセット` を入力
3. Body（HTML）に `reset-password.html` の内容を貼り付け
4. 「Save」をクリック

### 3. Magic link（マジックリンク）

1. 「Magic link」タブを選択
2. Subject に `InterviewCoach - ログインリンク` を入力
3. Body（HTML）に `magic-link.html` の内容を貼り付け
4. 「Save」をクリック

### 4. Change email address（メールアドレス変更）

1. 「Change email address」タブを選択
2. Subject に `InterviewCoach - メールアドレスの変更確認` を入力
3. Body（HTML）に `change-email.html` の内容を貼り付け
4. 「Save」をクリック

## 動作確認方法

1. テスト用アカウントでサインアップし、確認メールが届くか確認
2. パスワードリセットをリクエストし、リセットメールが届くか確認
3. 各メールのCTAボタンが正しく動作するか確認
4. モバイルデバイスでメール表示が崩れないか確認
5. Gmail / Outlook / Apple Mail など主要クライアントでの表示を確認

## 注意事項

- テンプレートを変更した場合は、このリポジトリのファイルも更新してください
- Supabase Dashboard での直接編集とリポジトリの内容が乖離しないよう注意してください
- テンプレート変数（`{{ .ConfirmationURL }}` 等）を誤って削除しないでください
