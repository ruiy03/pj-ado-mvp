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

### WordPress連携環境変数の詳細

#### WORDPRESS_API_URL

- **用途**: WordPress側のREST APIベースURL
- **例**: `https://portcareer.jp`（プロトコルを含む完全なURL）
- **必要な権限**: WordPressのREST API読み取り権限
- **使用箇所**:
    - `src/lib/wordpress-sync-actions.ts`でのAPI呼び出し
    - 記事広告マッピングの同期処理

#### 設定例

```bash
# 本番環境
WORDPRESS_API_URL=https://portcareer.jp

# ステージング環境  
WORDPRESS_API_URL=https://staging.portcareer.jp

# ローカル開発環境
WORDPRESS_API_URL=http://localhost:8080
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

## WordPress統合開発環境セットアップ

### 1. WordPress開発環境の構築

#### Docker を使用する場合（推奨）

```bash
# WordPress + MySQL環境を起動
docker-compose up -d

# コンテナ構成例
# - wordpress:8080 (WordPress)
# - mysql:3306 (データベース)
```

#### `docker-compose.yml` の例：

```yaml
version: '3.8'
services:
  wordpress:
    image: wordpress:latest
    ports:
      - "8080:80"
    environment:
      WORDPRESS_DB_HOST: db:3306
      WORDPRESS_DB_USER: wordpress
      WORDPRESS_DB_PASSWORD: password
      WORDPRESS_DB_NAME: wordpress
    volumes:
      - ./wordpress:/var/www/html
    depends_on:
      - db

  db:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: rootpassword
      MYSQL_DATABASE: wordpress
      MYSQL_USER: wordpress
      MYSQL_PASSWORD: password
    volumes:
      - db_data:/var/lib/mysql

volumes:
  db_data:
```

### 2. LMG Ad Manager プラグインの設定

#### プラグインファイルの配置

```bash
# WordPressボリュームディレクトリに移動
cd ./wordpress/wp-content/plugins/

# プラグインディレクトリを作成
mkdir lmg-ad-manager

# プラグインファイルを配置（実際のコードはWordPress環境から取得）
```

#### WordPress側の初期設定

1. **WordPress管理画面にアクセス**: http://localhost:8080/wp-admin
2. **プラグインを有効化**: プラグイン > LMG Ad Manager > 有効化
3. **API設定**: 設定 > LMG Ad Manager
   ```
   APIエンドポイント: http://localhost:3000/api/delivery
   APIタイムアウト: 5秒
   デフォルトキャッシュ時間: 3600秒
   ```

### 3. 環境変数の設定

#### Next.js側 (`.env.local`)

```bash
# WordPress統合
WORDPRESS_API_URL=http://localhost:8080

# その他の環境変数...
DATABASE_URL=postgresql://...
NEXTAUTH_SECRET=...
```

#### WordPress側のREST API確認

```bash
# ショートコード使用状況API
curl http://localhost:8080/wp-json/lmg-ad-manager/v1/shortcode-usage

# 全記事取得API
curl http://localhost:8080/wp-json/lmg-ad-manager/v1/all-articles?per_page=10
```

### 4. 連携テストの手順

#### Step 1: 基本的な広告表示テスト

1. Next.js で広告コンテンツを作成（ID: 123）
2. WordPress記事で `[lmg_ad id="123"]` を使用
3. フロントエンドで広告が表示されることを確認

#### Step 2: API統合テスト

```bash
# Next.js側から WordPress API を呼び出し
curl http://localhost:3000/api/wordpress/sync

# レスポンス例
{
  "success": true,
  "inserted": 5,
  "updated": 3,
  "deleted": 0,
  "errors": []
}
```

#### Step 3: 統計データ同期テスト

1. WordPress で複数の記事に広告ショートコードを配置
2. Next.js管理画面で「記事広告マッピング」を確認
3. 「WordPress同期」ボタンで手動同期を実行
4. マッピング結果が正しく表示されることを確認

### 5. トラブルシューティング

#### CORS エラーが発生する場合

WordPress側で CORS ヘッダーを追加：

```php
// functions.php または プラグインに追加
add_action('rest_api_init', function () {
    remove_filter('rest_pre_serve_request', 'rest_send_cors_headers');
    add_filter('rest_pre_serve_request', function ($value) {
        header('Access-Control-Allow-Origin: http://localhost:3000');
        header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
        header('Access-Control-Allow-Headers: Content-Type, Authorization');
        return $value;
    });
});
```

#### API接続エラーが発生する場合

1. **ネットワーク接続を確認**:
   ```bash
   # WordPress APIが応答するか確認
   curl -I http://localhost:8080/wp-json/
   ```

2. **WordPress REST API が有効か確認**:
    - プラグインで REST API が無効化されていないか
    - .htaccess で API アクセスがブロックされていないか

3. **環境変数を再確認**:
   ```bash
   echo $WORDPRESS_API_URL
   ```

#### デバッグ情報の確認

Next.js側でのデバッグ:

```bash
# WordPress API呼び出しログを確認
tail -f .next/trace

# コンソールでネットワークタブを確認
# API リクエスト・レスポンスの詳細を検査
```

WordPress側でのデバッグ:

```php
// wp-config.php でデバッグを有効化
define('WP_DEBUG', true);
define('WP_DEBUG_LOG', true);

// デバッグログを確認
tail -f wp-content/debug.log
```

### 6. 本番環境への移行

#### 本番用設定の調整

1. **セキュリティ設定**:
    - WordPress管理者アカウントの強化
    - API アクセス制限の設定
    - HTTPS の強制

2. **パフォーマンス最適化**:
    - WordPressキャッシュプラグインの設定
    - CDN の設定
    - データベースのインデックス最適化

3. **監視設定**:
    - API応答時間の監視
    - エラーログの監視設定
    - アップタイム監視

この開発環境設定により、WordPress統合機能の完全な開発・テストが可能になります。
