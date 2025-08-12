# 広告管理システム (Ado) MVP

LMG向けの内部メディア（PORTキャリアなど）の広告管理システムMVPです。

## プロジェクト概要

このプロジェクトはNext.js、TypeScript、Tailwind
CSS、NextAuth.jsを使用して構築された日本語の広告管理システムです。認証機能とアカウント管理機能を備えた本格的なWebアプリケーションとして開発されています。

### 主な機能

- **🔐 認証システム** - NextAuth.js v5 (beta) を使用したセキュアなログイン/ログアウト機能
- **📊 ダッシュボード** - システム概要と活動フィード
- **📄 広告テンプレート管理** - 広告テンプレートの作成・管理
- **🔗 URLテンプレート管理** - トラッキングパラメータ付きURLテンプレート管理
- **📢 広告管理** - 広告の作成・編集・検索機能
- **🔗 記事と広告の紐付け管理** - コンテンツと広告の関連付け
- **👥 アカウント管理** - ユーザーアカウント管理システム

## セットアップ手順

### 1. 依存関係のインストール

```bash
npm install
```

### 2. 環境変数の設定

`.env.local`ファイルを作成し、以下の環境変数を設定してください：

```env
DATABASE_URL=your_neon_database_url
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3000
```

### 3. データベースの初期化

```bash
node scripts/seed.js
```

このコマンドにより、usersテーブルが作成され、テストユーザーがシードされます。

### 4. 開発サーバーの起動

```bash
npm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開いてください。

## ログイン情報

開発・テスト用のログイン情報：

- **メールアドレス**: `admin@example.com`
- **パスワード**: `password123`

## 技術スタック

### フロントエンド

- **Next.js 15.4.5** - React フレームワーク (App Router)
- **React 19** - UI ライブラリ
- **TypeScript** - 型安全性
- **Tailwind CSS v4** - ユーティリティファーストCSS
- **Geist フォント** - タイポグラフィ

### バックエンド・認証

- **NextAuth.js 5.0.0-beta.29** - 認証システム (Credentials provider)
- **Neon Database** - PostgreSQL サーバーレスデータベース
- **bcrypt** - パスワードハッシュ化
- **Zod** - スキーマバリデーション

### 開発・テスト

- **Jest** - テストフレームワーク
- **React Testing Library** - React コンポーネントテスト
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

# テスト実行
npm test

# データベース初期化
node scripts/seed.js
```

## プロジェクト構造

```
pj-ado-mvp/
├── src/
│   ├── app/                    # App Router ページ
│   │   ├── api/auth/[...nextauth]/ # NextAuth API ルート
│   │   ├── dashboard/         # ダッシュボード
│   │   ├── ads/              # 広告管理
│   │   ├── ad-templates/     # 広告テンプレート
│   │   ├── url-templates/    # URLテンプレート
│   │   ├── article-ad-mapping/ # 記事・広告紐付け
│   │   ├── accounts/         # アカウント管理
│   │   ├── login/           # ログインページ
│   │   ├── layout.tsx       # ルートレイアウト
│   │   └── page.tsx         # ホームページ
│   ├── components/           # 共通コンポーネント
│   │   ├── Layout.tsx       # メインレイアウト
│   │   ├── Sidebar.tsx      # サイドバーナビゲーション
│   │   ├── Button.tsx       # ボタンコンポーネント
│   │   ├── ProtectedPage.tsx # 認証保護ラッパー
│   │   ├── LoginForm.tsx    # ログインフォーム
│   │   └── SessionProvider.tsx # セッションプロバイダー
│   └── lib/                 # ユーティリティ・設定
│       ├── actions.ts       # 認証サーバーアクション
│       ├── user-actions.ts  # ユーザー管理アクション
│       ├── authorization.ts # 認可ロジック
│       └── definitions.ts   # TypeScript型定義
├── __tests__/              # テストファイル
│   ├── components/         # コンポーネントテスト
│   └── lib/               # ライブラリ関数テスト
├── scripts/               # ユーティリティスクリプト
│   └── seed.js           # データベース初期化
├── .claude/              # Claude Code 設定
├── auth.ts               # NextAuth.js設定
├── auth.config.ts        # NextAuth.js設定詳細
├── middleware.ts         # ルート保護ミドルウェア
├── jest.config.js        # Jest設定
└── jest.setup.js         # Jest セットアップ
```

## 認証について

このシステムでは以下の認証機能を実装しています：

- **NextAuth.js v5 (beta)** を使用したクレデンシャル認証
- **ミドルウェア** による全ルート保護 (`/login`以外は認証必須)
- **サーバーサイドセッション管理** でセキュアな状態管理
- **bcrypt** によるパスワードハッシュ化
- **セッションベース** の認証フロー
- **条件付きレイアウト** で認証状態に応じた UI 表示

### アーキテクチャ

- 認証されていないユーザー: ログインフォームのみ表示
- 認証済みユーザー: サイドバー付きメインレイアウト表示

## テスト

プロジェクトにはJestとReact Testing Libraryを使用したテストスイートが含まれています：

```bash
# 全テスト実行
npm test

# 特定のテストファイル実行
npm test Button.test.tsx

# テストカバレッジ表示
npm test -- --coverage
```

### テストファイル

- `__tests__/components/` - React コンポーネントのテスト
- `__tests__/lib/` - ユーティリティ関数のテスト

## 開発者向け情報

### Claude Code との連携

このプロジェクトは Claude Code (claude.ai/code) との連携を前提として設計されています：

- `.claude/` ディレクトリに設定ファイルを配置
- `CLAUDE.md` にプロジェクト固有の指示を記載

### コード品質

- **TypeScript** による型安全性
- **ESLint** によるコード品質チェック
- **Next.js** の厳格な設定
- **React 19** の最新機能を活用

## デプロイ

Vercelを使用したデプロイが推奨されます：

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme)

デプロイ前に以下を確認してください：

- 環境変数の設定
- データベースの初期化
- 本番用認証情報の設定
