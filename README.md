# 広告管理システム (Ado) MVP

![Next.js](https://img.shields.io/badge/Next.js-15.4.5-black?style=flat-square&logo=next.js)
![React](https://img.shields.io/badge/React-19.1.0-blue?style=flat-square&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?style=flat-square&logo=tailwind-css)
![NextAuth.js](https://img.shields.io/badge/NextAuth.js-5.0.0--beta-purple?style=flat-square)

LMG向けの内部メディア（PORTキャリアなど）の広告管理システムMVPです。

## プロジェクト概要

Next.js、TypeScript、Tailwind CSS、NextAuth.jsを使用して構築された日本語の広告管理システム。認証機能とアカウント管理機能を備えた本格的なWebアプリケーションです。

### 主な機能

- **🔐 認証システム** - NextAuth.js v5 (beta) を使用したセキュアなログイン/ログアウト機能
- **📊 ダッシュボード** - システム概要と活動フィード、リアルタイム整合性監視
- **📄 広告テンプレート管理** - Monaco Editorを使った高機能HTMLエディター付きテンプレート管理
- **🔗 URLテンプレート管理** - トラッキングパラメータ付きURLテンプレート管理
- **📢 広告コンテンツ管理** - 広告の作成・編集・画像アップロード・プレビュー機能
- **🚀 広告配信システム** - WordPress連携用ショートコード生成、外部サイト向け広告配信API
- **🔗 記事広告マッピング管理** - WordPress連携による記事と広告の紐付け管理
- **👥 アカウント管理** - 専用ページによるユーザーアカウント管理システム
- **🔍 テンプレート整合性チェック機能** - テンプレート変更時の影響分析とデータ整合性監視

## 🚀 クイックスタート

### 前提条件

- Node.js 18.17以上
- npm または yarn
- Neon PostgreSQL データベース

### セットアップ手順

1. **リポジトリのForkとクローン**

   GitHubでリポジトリをFork：
    - このリポジトリページにアクセスし、右上の「Fork」ボタンをクリック
    - 自分のGitHubアカウントにリポジトリがコピーされます

   Forkしたリポジトリをローカルにクローン：
   ```bash
   git clone git@github.com:<your-github-username>/pj-ado-mvp.git
   cd pj-ado-mvp
   ```

2. **依存関係のインストール**
   ```bash
   npm install
   ```

3. **環境変数の設定**

   Vercelでプロジェクトを作成し、以下の手順で環境変数を設定：

   **Vercelでのデータベース・ストレージ設定**
    - Vercel Storageから「Neon Database」と「Vercel Blob」を追加
    - Settings → Cron JobsをONにする
    - DATABASE_URLとBLOB_READ_WRITE_TOKENが自動設定されます

   **AUTH_SECRETの生成と設定**
   ```bash
   # ローカルで32文字のシークレットを生成
   openssl rand -base64 32
   ```
    - Vercel Environment VariablesにAUTH_SECRETとして追加

   **ローカル環境への同期**
   ```bash
   vercel env pull
   ```

   **WordPress Localサーバーの起動**
    - GitHub ReleasesからWordPress環境をダウンロード
    - Localアプリにインポート
    - Localアプリを開いて、インポートしたWordPressサイトを起動
    - 「Start site」ボタンをクリック（通常 http://localhost:10005 でアクセス可能）

   **WordPress環境の設定**
    - .env.localファイルに追加（※下記のポート番号10005は、ご自身のLocalアプリで割り当てられたWordPressサイトのポート番号に置き換えてください）：
   ```bash
   # ※ ポート番号10005は例です。Localアプリで実際に割り当てられているポート番号を確認して設定してください。
   echo "WORDPRESS_API_URL=http://localhost:10005" >> .env.local
   ```

4. **データベースの初期化**
   ```bash
   node scripts/seed.js
   ```

   このコマンドにより、usersテーブル、ad_templatesテーブル、url_templatesテーブル、ad_contentsテーブル、ad_imagesテーブル、article_ad_mappingsテーブルが作成され、テストユーザーとサンプルテンプレートがシードされます。

5. **開発サーバーの起動**
   ```bash
   npm run dev
   ```

   ブラウザで [http://localhost:3000](http://localhost:3000) を開いてください。

## 🔐 ログイン情報

開発・テスト用のログイン情報：

| 役割      | メールアドレス              | パスワード         | 権限          |
|---------|----------------------|---------------|-------------|
| **管理者** | `admin@example.com`  | `password123` | 全機能アクセス     |
| **編集者** | `editor@example.com` | `password123` | テンプレート・広告管理 |

## 技術スタック

### フロントエンド

- **Next.js 15.4.5** - React フレームワーク (App Router)
- **React 19** - UI ライブラリ
- **TypeScript** - 型安全性
- **Tailwind CSS v4** - ユーティリティファーストCSS
- **@monaco-editor/react** - HTMLコードエディター (Monaco Editor React integration)
- **Geist フォント** - タイポグラフィ

### バックエンド・認証

- **NextAuth.js 5.0.0-beta.29** - 認証システム (Credentials provider)
- **Neon Database** - PostgreSQL サーバーレスデータベース
- **Vercel Blob** - 画像ファイルストレージサービス
- **bcrypt** - パスワードハッシュ化
- **Zod 4.0.15** - スキーマバリデーション

### 開発・ビルド

- **ESLint** - コード品質管理
- **Turbopack** - 高速ビルドツール

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

## ドキュメント

詳細な技術ドキュメントは [`/docs`](./docs) ディレクトリにあります：

- [**システム設計書**](./docs/architecture.md) - アーキテクチャとプロジェクト構造
- [**API仕様書**](./docs/api-reference.md) - API エンドポイント一覧
- [**データベース設計**](./docs/database-schema.md) - テーブル構造とスキーマ
- [**開発者ガイド**](./docs/development.md) - 環境構築とデプロイ手順
- [**機能詳細**](./docs/features/) - 各機能の技術仕様

📖 [ドキュメント一覧を見る](./docs/README.md)

## デプロイ

Vercelを使用したデプロイが推奨されます：

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme)

詳細な手順は [開発者ガイド](./docs/development.md) を参照してください。
