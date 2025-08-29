# 開発者ガイド

## 開発コマンド

```bash
# 開発サーバー起動 (Turbopack使用)
npm run dev

# プロダクションビルド
npm run build

# プロダクションサーバー起動
npm start

# ESLintチェック
npm run lint

# TypeScript型チェック
npx tsc

# データベース初期化
node scripts/seed.js
```

## Claude Code との連携

このプロジェクトは Claude Code (claude.ai/code) との連携を前提として設計されています：

- `.claude/` ディレクトリに設定ファイルを配置
- `CLAUDE.md` にプロジェクト固有の指示を記載

## コード品質

- **TypeScript** による型安全性
- **ESLint** によるコード品質チェック
- **Next.js** の厳格な設定
- **React 19** の最新機能を活用

## パフォーマンス

- **Turbopack** による高速ビルド
- **Server Components** によるサーバーサイドレンダリング
- **Monaco Editor** による軽量なコードエディター体験

## 環境変数

開発・本番環境で必要な環境変数：

```bash
# データベース
DATABASE_URL=postgresql://username:password@localhost:5432/lmg_ad_db

# 認証
NEXTAUTH_SECRET=your-32-character-secret-key
NEXTAUTH_URL=http://localhost:3000

# WordPress連携
WORDPRESS_API_URL=https://your-wordpress-site.com

# ファイルストレージ
BLOB_READ_WRITE_TOKEN=vercel_blob_token

# Cron認証
CRON_SECRET=your-cron-secret
```

## デプロイ

Vercelを使用したデプロイが推奨されます：

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme)

デプロイ前に以下を確認してください：

- 環境変数の設定
- データベースの初期化
- 本番用認証情報の設定

### Vercelでのセットアップ

1. **データベース・ストレージ設定**
    - Vercel Storageから「Neon Database」と「Vercel Blob」を追加
    - Settings → Cron JobsをONにする
    - DATABASE_URLとBLOB_READ_WRITE_TOKENが自動設定されます

2. **AUTH_SECRETの生成と設定**
   ```bash
   # ローカルで32文字のシークレットを生成
   openssl rand -base64 32
   ```
    - Vercel Environment VariablesにAUTH_SECRETとして追加

3. **ローカル環境への同期**
   ```bash
   vercel env pull
   ```

## 自動クリーンアップ設定

`vercel.json`でCronJobsを設定：

```json
{
  "crons": [
    {
      "path": "/api/admin/cleanup-images",
      "schedule": "0 2 * * 0"
    }
  ]
}
```

環境変数`CRON_SECRET`でCron認証を設定。

## WordPress統合テスト

WordPress連携機能をテストするための基本手順：

### 1. WordPress環境の準備

```bash
# Docker環境（推奨）
docker-compose up -d
# WordPress: http://localhost:8080
# 環境変数: WORDPRESS_API_URL=http://localhost:8080
```

### 2. プラグイン設定

1. LMG Ad Managerプラグインを有効化
2. 設定でAPIエンドポイントを設定: `http://localhost:3000/api/delivery`
3. 記事に `[lmg_ad id="123"]` を追加してテスト

## よくある問題と解決策

### データベース接続エラー

**症状**: `DATABASE_URL` 関連のエラー

**解決方法**:

- `DATABASE_URL`環境変数を確認
- `vercel env pull` でローカル環境変数を同期

### NextAuth.js エラー

**症状**: 認証エラー・セッションエラー

**解決方法**:

- `NEXTAUTH_SECRET` が32文字以上であることを確認
- `NEXTAUTH_URL` の設定確認（本番: 正しいドメイン、ローカル: `http://localhost:3000`）

### Vercel Blob アップロードエラー

**症状**: 画像アップロード失敗

**解決方法**:

- `BLOB_READ_WRITE_TOKEN` の設定確認
- ファイルサイズ制限（10MB）以内であることを確認

### WordPress連携エラー

**症状**: ショートコードが表示されない

**解決方法**:

- プラグインが有効化されているか確認
- APIエンドポイントの疎通確認: `curl -X GET "https://your-app.vercel.app/api/delivery/123"`

### CORS エラー

**症状**: WordPressサイトから広告が読み込めない

**解決方法**:

- `/api/delivery/[id]/route.ts` でCORSヘッダー設定を確認
- WordPressドメインが許可されているか確認

### パフォーマンス問題

**症状**: 管理画面が3秒以上かかる

**診断手順**:

- Network タブでAPIレスポンス時間を確認
- データベースクエリの実行時間をチェック
- 画像ファイルのサイズと数を確認
