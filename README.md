# 広告管理システム (Ado)

LMG向けの内部メディアの広告管理システムMVPです。

## プロジェクト概要

このプロジェクトはNext.js、TypeScript、Tailwind CSS、NextAuth.jsを使用して構築された日本語の広告管理システムです。

### 主な機能

- **認証システム** - NextAuth.jsを使用したログイン/ログアウト機能
- **ダッシュボード** - システム概要と活動フィード
- **広告テンプレート管理** - 広告テンプレートの作成・管理
- **URLテンプレート管理** - トラッキングパラメータ付きURLテンプレート管理
- **広告管理** - 広告の作成・編集・検索機能
- **記事と広告の紐付け管理** - コンテンツと広告の関連付け
- **アカウント管理** - ユーザーアカウント管理

## セットアップ手順

### 1. 依存関係のインストール

```bash
npm install
```

### 2. 環境変数の設定

`.env`ファイルを作成し、以下の環境変数を設定してください：

```env
DATABASE_URL=your_neon_database_url
NEXTAUTH_SECRET=your_nextauth_secret
```

### 3. データベースの初期化

```bash
node scripts/seed.js
```

### 4. 開発サーバーの起動

```bash
npm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開いてください。

## ログイン情報

開発・テスト用のログイン情報：

- **メールアドレス**: `test@example.com`
- **パスワード**: `password123`

> **注意**: これはテスト用アカウントです。

## 技術スタック

- **Next.js 15.4.5** - React フレームワーク (App Router)
- **React 19** - UI ライブラリ
- **NextAuth.js 5.0.0-beta.29** - 認証システム
- **TypeScript** - 型安全性
- **Tailwind CSS v4** - スタイリング
- **Neon Database** - PostgreSQL サーバーレスデータベース
- **bcrypt** - パスワードハッシュ化
- **Zod** - スキーマバリデーション

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

# データベース初期化
node scripts/seed.js
```

## プロジェクト構造

```
src/
├── app/                    # App Router ページ
│   ├── dashboard/         # ダッシュボード
│   ├── ads/              # 広告管理
│   ├── ad-templates/     # 広告テンプレート
│   ├── url-templates/    # URLテンプレート
│   ├── article-ad-mapping/ # 記事・広告紐付け
│   ├── accounts/         # アカウント管理
│   └── login/           # ログインページ
├── components/           # 共通コンポーネント
│   ├── Sidebar.tsx      # サイドバーナビゲーション
│   ├── Button.tsx       # ボタンコンポーネント
│   ├── ProtectedPage.tsx # 認証保護ラッパー
│   └── LoginForm.tsx    # ログインフォーム
├── lib/                 # ユーティリティ・設定
│   ├── actions.ts       # サーバーアクション
│   └── definitions.ts   # TypeScript型定義
├── auth.ts             # NextAuth.js設定
├── auth.config.ts      # NextAuth.js設定詳細
└── middleware.ts       # ルート保護ミドルウェア
```

## 認証について

- NextAuth.js v5 (beta) を使用したクレデンシャル認証
- ミドルウェアによるルート保護 (`/login`以外は認証必須)
- サーバーサイドセッション管理
- bcryptによるパスワードハッシュ化

## デプロイ

Vercelを使用したデプロイが推奨されます：

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme)

デプロイ前に以下を確認してください：

- 環境変数の設定
- データベースの初期化
- 本番用認証情報の設定
