# セットアップメモ

## support@menpass.jp メール設定（Cloudflare Email Routing・無料）

### 1. Cloudflare にドメイン登録
- Cloudflare にサインアップ → サイト追加 → `menpass.jp` を登録
- お名前.com 管理画面 → DNS設定 → ネームサーバーを Cloudflare のものに変更

### 2. Email Routing 有効化
- Cloudflare ダッシュボード → 左メニュー「Email」→「Email Routing」→ 有効化
- 転送先メールアドレス（Gmail等）を登録 → 認証メールを確認
- ルール作成: `support@menpass.jp` → 自分の Gmail に転送

### 3. Gmail からの送信設定（エイリアス）
- Gmail → 設定 → アカウントとインポート → 「他のメールアドレスを追加」→ `support@menpass.jp` を追加
- これで送受信とも `support@menpass.jp` で利用可能

### 備考
- ドメイン管理: お名前.com
- 費用: 無料（Cloudflare Email Routing）
