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
DATABASE_URL=

# 認証
NEXTAUTH_SECRET=
NEXTAUTH_URL=

# WordPress連携
WORDPRESS_API_URL=

# ファイルストレージ
BLOB_READ_WRITE_TOKEN=

# Cron認証
CRON_SECRET=
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
