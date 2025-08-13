# 広告管理システム (Ado) MVP

LMG向けの内部メディア（PORTキャリアなど）の広告管理システムMVPです。

## プロジェクト概要

このプロジェクトはNext.js、TypeScript、Tailwind CSS、NextAuth.jsを使用して構築された日本語の広告管理システムです。認証機能とアカウント管理機能を備えた本格的なWebアプリケーションとして開発されています。
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

- **管理者アカウント**: `admin@example.com` / `password123`
- **編集者アカウント**: `editor@example.com` / `password123`

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

# テストウォッチモード
npm run test:watch

# データベース初期化
node scripts/seed.js
```

## プロジェクト構造

```
pj-ado-mvp/
├── src/
│   ├── app/                    # App Router ページ
│   │   ├── api/              # API ルート
│   │   │   ├── auth/[...nextauth]/ # NextAuth API ルート
│   │   │   └── templates/    # 広告テンプレート API
│   │   │       ├── route.ts  # GET, POST (全テンプレート)
│   │   │       ├── [id]/route.ts # GET, PUT, DELETE (個別)
│   │   │       ├── import/route.ts # POST (インポート)
│   │   │       └── export/route.ts # GET (エクスポート)
│   │   ├── dashboard/         # ダッシュボード
│   │   ├── ads/              # 広告管理
│   │   ├── ad-templates/     # 広告テンプレート管理
│   │   ├── url-templates/    # URLテンプレート管理
│   │   ├── article-ad-mapping/ # 記事・広告紐付け管理
│   │   ├── accounts/         # アカウント管理
│   │   ├── login/           # ログインページ
│   │   ├── layout.tsx       # ルートレイアウト
│   │   └── page.tsx         # ホームページ
│   ├── components/           # 共通コンポーネント
│   │   ├── Button.tsx       # ボタンコンポーネント
│   │   ├── ClientLayout.tsx # クライアントレイアウト
│   │   ├── LoginForm.tsx    # ログインフォーム
│   │   ├── ProtectedPage.tsx # 認証保護ラッパー
│   │   ├── SessionProvider.tsx # セッションプロバイダー
│   │   └── Sidebar.tsx      # サイドバーナビゲーション
│   ├── lib/                 # ユーティリティ・設定
│   │   ├── actions.ts       # 認証サーバーアクション
│   │   ├── authorization.ts # 認可ロジック
│   │   ├── definitions.ts   # TypeScript型定義
│   │   ├── template-actions.ts # テンプレート管理アクション
│   │   ├── template-utils.ts   # テンプレートユーティリティ
│   │   └── user-actions.ts  # ユーザー管理アクション
│   ├── auth.config.ts       # NextAuth.js設定詳細
│   └── auth.ts              # NextAuth.js設定
├── __tests__/              # テストファイル
│   ├── components/         # コンポーネントテスト
│   └── lib/               # ライブラリ関数テスト
├── scripts/               # ユーティリティスクリプト
│   └── seed.js           # データベース初期化
├── middleware.ts         # ルート保護ミドルウェア
├── jest.config.js        # Jest設定
└── jest.setup.js         # Jest セットアップ
```

## API ルート

### 広告テンプレート API

| エンドポイント | メソッド | 説明 | 認証 |
|-------------|--------|------|------|
| `/api/templates` | GET | 全テンプレート取得 | 必須 |
| `/api/templates` | POST | 新規テンプレート作成 | 必須 |
| `/api/templates/[id]` | GET | 個別テンプレート取得 | 必須 |
| `/api/templates/[id]` | PUT | テンプレート更新 | 必須 |
| `/api/templates/[id]` | DELETE | テンプレート削除 | 必須 |
| `/api/templates/import` | POST | テンプレートインポート | 必須 |
| `/api/templates/export` | GET | テンプレートエクスポート | 必須 |

### 認証 API

| エンドポイント | メソッド | 説明 |
|-------------|--------|------|
| `/api/auth/[...nextauth]` | GET/POST | NextAuth.js 認証ハンドラー |

## 認証・認可について

### 認証システム

このシステムでは以下の認証機能を実装しています：

- **NextAuth.js v5 (beta)** を使用したクレデンシャル認証
- **ミドルウェア** による全ルート保護 (`/login`以外は認証必須)
- **サーバーサイドセッション管理** でセキュアな状態管理
- **bcrypt** によるパスワードハッシュ化
- **セッションベース** の認証フロー
- **条件付きレイアウト** で認証状態に応じた UI 表示

### 役割ベース認可 (RBAC)

システムでは2段階の役割システムを実装：

| 役割 | レベル | 権限 |
|------|--------|------|
| **管理者 (admin)** | 2 | 全機能アクセス、ユーザー管理、テンプレート管理 |
| **編集者 (editor)** | 1 | テンプレート作成・編集、広告管理 |

#### 認可ヘルパー関数

- `hasMinimumRole(user, role)` - 最小権限チェック
- `isAdmin(user)` - 管理者権限チェック  
- `canEdit(user)` - 編集権限チェック
- `withAuthorization(handler, requiredRole)` - API認可ラッパー

### アーキテクチャ

- 認証されていないユーザー: ログインフォームのみ表示
- 認証済みユーザー: サイドバー付きメインレイアウト表示
- 役割に応じた機能制限 (アカウント管理は管理者のみ)

## データベーススキーマ

### users テーブル

| カラム | 型 | 説明 | 制約 |
|--------|-----|------|------|
| `id` | SERIAL | プライマリキー | PRIMARY KEY |
| `name` | VARCHAR(255) | ユーザー名 | NOT NULL |
| `email` | VARCHAR(255) | メールアドレス | UNIQUE, NOT NULL |
| `password` | VARCHAR(255) | bcryptハッシュ化パスワード | NOT NULL |
| `role` | VARCHAR(20) | ユーザー役割 (admin/editor) | NOT NULL, DEFAULT 'editor' |
| `created_at` | TIMESTAMP | 作成日時 | DEFAULT NOW() |
| `updated_at` | TIMESTAMP | 更新日時 | DEFAULT NOW() |

### ad_templates テーブル

| カラム | 型 | 説明 | 制約 |
|--------|-----|------|------|
| `id` | SERIAL | プライマリキー | PRIMARY KEY |
| `name` | VARCHAR(255) | テンプレート名 | NOT NULL |
| `html` | TEXT | HTMLテンプレート | NOT NULL |
| `placeholders` | JSON | プレースホルダー配列 | |
| `description` | TEXT | テンプレート説明 | |
| `created_at` | TIMESTAMP | 作成日時 | DEFAULT NOW() |
| `updated_at` | TIMESTAMP | 更新日時 | DEFAULT NOW() |

#### サンプルデータ

シードスクリプトでは以下のテンプレートが作成されます：

- **バナー基本** - グラデーション背景のバナータイプ
- **テキスト広告** - シンプルなテキストのみの広告
- **カード型広告** - 画像付きカード形式の広告

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
