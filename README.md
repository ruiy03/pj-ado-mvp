# 広告管理システム (Ado) MVP

![Next.js](https://img.shields.io/badge/Next.js-15.4.5-black?style=flat-square&logo=next.js)
![React](https://img.shields.io/badge/React-19.1.0-blue?style=flat-square&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?style=flat-square&logo=tailwind-css)
![NextAuth.js](https://img.shields.io/badge/NextAuth.js-5.0.0--beta-purple?style=flat-square)
![Jest](https://img.shields.io/badge/Jest-29.7.0-C21325?style=flat-square&logo=jest)

LMG向けの内部メディア（PORTキャリアなど）の広告管理システムMVPです。

## プロジェクト概要

このプロジェクトはNext.js、TypeScript、Tailwind
CSS、NextAuth.jsを使用して構築された日本語の広告管理システムです。認証機能とアカウント管理機能を備えた本格的なWebアプリケーションとして開発されています。

### 主な機能

- **🔐 認証システム** - NextAuth.js v5 (beta) を使用したセキュアなログイン/ログアウト機能
- **📊 ダッシュボード** - システム概要と活動フィード
- **📄 広告テンプレート管理** - Monaco Editorを使った高機能HTMLエディター付きテンプレート管理、CSV インポート/エクスポート機能、作成・更新タイムスタンプ表示
- **🔗 URLテンプレート管理** - トラッキングパラメータ付きURLテンプレート管理、CSV インポート/エクスポート機能
- **📢 広告管理** - 広告の作成・編集・検索機能
- **🔗 記事と広告の紐付け管理** - コンテンツと広告の関連付け
- **👥 アカウント管理** - ユーザーアカウント管理システム

## 🚀 クイックスタート

### 前提条件

- Node.js 18.17以上
- npm または yarn
- Neon PostgreSQL データベース

### セットアップ手順

1. **リポジトリのクローン**
   ```bash
   git clone <repository-url>
   cd pj-ado-mvp
   ```

2. **依存関係のインストール**
   ```bash
   npm install
   ```

3. **環境変数の設定**

   `.env.local`ファイルを作成し、以下の環境変数を設定：
   ```env
   DATABASE_URL=your_neon_database_url
   NEXTAUTH_SECRET=your_nextauth_secret_key_32_characters_long
   NEXTAUTH_URL=http://localhost:3000
   ```

4. **データベースの初期化**
   ```bash
   node scripts/seed.js
   ```
   > このコマンドにより、usersテーブル、ad_templatesテーブル、url_templatesテーブルが作成され、テストユーザーとサンプルテンプレートがシードされます。

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
- **Monaco Editor** - HTMLコードエディター (VS Code エディター技術)
- **Geist フォント** - タイポグラフィ

### バックエンド・認証

- **NextAuth.js 5.0.0-beta.29** - 認証システム (Credentials provider)
- **Neon Database** - PostgreSQL サーバーレスデータベース
- **bcrypt** - パスワードハッシュ化
- **Zod 4.0.15** - スキーマバリデーション

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
│   │   │   ├── templates/    # 広告テンプレート API
│   │   │   │   ├── route.ts  # GET, POST (全テンプレート)
│   │   │   │   ├── [id]/route.ts # GET, PUT, DELETE (個別)
│   │   │   │   ├── import/route.ts # POST (CSVインポート)
│   │   │   │   └── export/route.ts # GET (CSVエクスポート)
│   │   │   └── url-templates/ # URLテンプレート API
│   │   │       ├── route.ts  # GET, POST (全URLテンプレート)
│   │   │       ├── [id]/route.ts # GET, PUT, DELETE (個別)
│   │   │       ├── import/route.ts # POST (CSVインポート)
│   │   │       └── export/route.ts # GET (CSVエクスポート)
│   │   ├── dashboard/         # ダッシュボード
│   │   ├── ads/              # 広告管理
│   │   ├── ad-templates/     # 広告テンプレート管理
│   │   │   ├── components/   # テンプレート管理専用コンポーネント
│   │   │   │   ├── TemplateForm.tsx # テンプレート作成・編集フォーム
│   │   │   │   ├── TemplateList.tsx # テンプレート一覧表示（タイムスタンプ付き）
│   │   │   │   ├── TemplatePreview.tsx # テンプレートプレビュー
│   │   │   │   ├── ImportExportButtons.tsx # CSV機能UI
│   │   │   │   └── ValidationGuide.tsx # バリデーションガイド
│   │   │   └── hooks/        # テンプレート管理hooks
│   │   ├── url-templates/    # URLテンプレート管理
│   │   │   ├── components/   # URLテンプレート管理専用コンポーネント
│   │   │   │   ├── UrlTemplateCard.tsx # URLテンプレートカード表示
│   │   │   │   ├── UrlTemplateForm.tsx # URLテンプレート作成・編集フォーム
│   │   │   │   ├── UrlTemplateClient.tsx # URLテンプレート管理UI
│   │   │   │   └── ImportExportButtons.tsx # CSV機能UI
│   │   │   └── hooks/        # URLテンプレート管理hooks
│   │   │       └── useUrlTemplates.tsx # URLテンプレート状態管理
│   │   ├── article-ad-mapping/ # 記事・広告紐付け管理
│   │   ├── accounts/         # アカウント管理
│   │   ├── login/           # ログインページ
│   │   ├── layout.tsx       # ルートレイアウト
│   │   └── page.tsx         # ホームページ
│   ├── components/           # 共通コンポーネント
│   │   ├── Button.tsx       # ボタンコンポーネント
│   │   ├── ClientLayout.tsx # クライアントレイアウト
│   │   ├── ClientProtectedPage.tsx # クライアントサイド認証保護ラッパー
│   │   ├── HTMLCodeEditor.tsx # Monaco Editor HTMLエディター
│   │   ├── LoginForm.tsx    # ログインフォーム
│   │   ├── ProtectedPage.tsx # サーバーサイド認証保護ラッパー
│   │   ├── SessionProvider.tsx # セッションプロバイダー
│   │   └── Sidebar.tsx      # サイドバーナビゲーション
│   ├── lib/                 # ユーティリティ・設定
│   │   ├── actions.ts       # 認証サーバーアクション
│   │   ├── authorization.ts # 認可ロジック
│   │   ├── definitions.ts   # TypeScript型定義
│   │   ├── template-actions.ts # テンプレート管理アクション
│   │   ├── template-utils.ts   # テンプレートユーティリティ
│   │   ├── url-template-actions.ts # URLテンプレート管理アクション
│   │   ├── template-utils/  # テンプレート処理専用モジュール
│   │   │   ├── validation.ts # HTMLとプレースホルダーのバリデーション
│   │   │   ├── placeholder-extraction.ts # プレースホルダー抽出
│   │   │   ├── link-processing.ts # SEO用nofollow処理
│   │   │   └── constants.ts # バリデーション規則定義
│   │   └── user-actions.ts  # ユーザー管理アクション
│   ├── auth.config.ts       # NextAuth.js設定詳細
│   └── auth.ts              # NextAuth.js設定
├── __tests__/              # テストファイル
│   ├── api/                # API エンドポイントテスト
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

| エンドポイント                 | メソッド   | 説明               | 認証 |
|-------------------------|--------|------------------|----|
| `/api/templates`        | GET    | 全テンプレート取得        | 必須 |
| `/api/templates`        | POST   | 新規テンプレート作成       | 必須 |
| `/api/templates/[id]`   | GET    | 個別テンプレート取得       | 必須 |
| `/api/templates/[id]`   | PUT    | テンプレート更新         | 必須 |
| `/api/templates/[id]`   | DELETE | テンプレート削除         | 必須 |
| `/api/templates/import` | POST   | CSVからテンプレートインポート | 必須 |
| `/api/templates/export` | GET    | テンプレートをCSVエクスポート | 必須 |

### URLテンプレート API

| エンドポイント                     | メソッド   | 説明                | 認証 |
|------------------------------|--------|-------------------|----|
| `/api/url-templates`         | GET    | 全URLテンプレート取得      | 必須 |
| `/api/url-templates`         | POST   | 新規URLテンプレート作成     | 必須 |
| `/api/url-templates/[id]`    | GET    | 個別URLテンプレート取得     | 必須 |
| `/api/url-templates/[id]`    | PUT    | URLテンプレート更新       | 必須 |
| `/api/url-templates/[id]`    | DELETE | URLテンプレート削除       | 必須 |
| `/api/url-templates/import`  | POST   | CSVからURLテンプレートインポート | 必須 |
| `/api/url-templates/export`  | GET    | URLテンプレートをCSVエクスポート | 必須 |

### 認証 API

| エンドポイント                   | メソッド     | 説明                  |
|---------------------------|----------|---------------------|
| `/api/auth/[...nextauth]` | GET/POST | NextAuth.js 認証ハンドラー |

## 認証・認可について

### 認証システム

このシステムでは以下の認証機能を実装しています：

- **NextAuth.js v5 (beta)** を使用したクレデンシャル認証
- **ミドルウェア** による全ルート保護 (`/login`以外は認証必須)
- **クライアントサイドセッション管理** でリアルタイムな状態管理
- **bcrypt** によるパスワードハッシュ化
- **セッションベース** の認証フロー
- **条件付きレイアウト** で認証状態に応じた UI 表示

### 役割ベース認可 (RBAC)

システムでは2段階の役割システムを実装：

| 役割               | レベル | 権限                      |
|------------------|-----|-------------------------|
| **管理者 (admin)**  | 2   | 全機能アクセス、ユーザー管理、テンプレート管理 |
| **編集者 (editor)** | 1   | テンプレート作成・編集、広告管理        |

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

| カラム          | 型            | 説明                    | 制約                         |
|--------------|--------------|-----------------------|----------------------------|
| `id`         | SERIAL       | プライマリキー               | PRIMARY KEY                |
| `name`       | VARCHAR(255) | ユーザー名                 | NOT NULL                   |
| `email`      | VARCHAR(255) | メールアドレス               | UNIQUE, NOT NULL           |
| `password`   | VARCHAR(255) | bcryptハッシュ化パスワード      | NOT NULL                   |
| `role`       | VARCHAR(20)  | ユーザー役割 (admin/editor) | NOT NULL, DEFAULT 'editor' |
| `created_at` | TIMESTAMP    | 作成日時                  | DEFAULT NOW()              |
| `updated_at` | TIMESTAMP    | 更新日時                  | DEFAULT NOW()              |

### ad_templates テーブル

| カラム            | 型            | 説明         | 制約            |
|----------------|--------------|------------|---------------|
| `id`           | SERIAL       | プライマリキー    | PRIMARY KEY   |
| `name`         | VARCHAR(255) | テンプレート名    | NOT NULL      |
| `html`         | TEXT         | HTMLテンプレート | NOT NULL      |
| `placeholders` | JSON         | プレースホルダー配列 |               |
| `description`  | TEXT         | テンプレート説明   |               |
| `created_at`   | TIMESTAMP    | 作成日時       | DEFAULT NOW() |
| `updated_at`   | TIMESTAMP    | 更新日時       | DEFAULT NOW() |

### url_templates テーブル

| カラム            | 型            | 説明              | 制約                          |
|----------------|--------------|-----------------|-----------------------------|
| `id`           | SERIAL       | プライマリキー         | PRIMARY KEY                 |
| `name`         | VARCHAR(255) | URLテンプレート名      | NOT NULL                    |
| `base_url`     | TEXT         | ベースURL          | NOT NULL                    |
| `utm_source`   | VARCHAR(255) | UTMソース          |                             |
| `utm_medium`   | VARCHAR(255) | UTMメディア         |                             |
| `utm_campaign` | VARCHAR(255) | UTMキャンペーン       |                             |
| `utm_term`     | VARCHAR(255) | UTMキーワード        |                             |
| `utm_content`  | VARCHAR(255) | UTMコンテンツ        |                             |
| `custom_params`| JSON         | カスタムパラメータ       |                             |
| `description`  | TEXT         | 説明              |                             |
| `is_active`    | BOOLEAN      | アクティブ状態        | NOT NULL, DEFAULT true     |
| `created_at`   | TIMESTAMP    | 作成日時            | DEFAULT NOW()               |
| `updated_at`   | TIMESTAMP    | 更新日時            | DEFAULT NOW()               |

## テンプレートシステム

### 主要機能

- **HTMLエディター**: Monaco Editor による高機能コードエディター
- **プレースホルダーシステム**: `{{variableName}}` 形式の動的コンテンツ対応
- **バリデーション**: HTMLとプレースホルダーの整合性チェック
- **SEO対応**: 自動 `rel="nofollow"` 属性追加・削除機能
- **CSV インポート/エクスポート**: テンプレートの一括管理機能
- **タイムスタンプ表示**: テンプレート作成・更新日時のリアルタイム表示

### HTMLコードエディター機能

- **シンタックスハイライト**: HTML専用カラーテーマ
- **オートコンプリート**: タグとプロパティの自動補完
- **コードフォーマット**: ワンクリックでの整形機能
- **バリデーション**: リアルタイムエラーチェック
- **プレースホルダー表示**: 未入力時のガイド表示

### プレースホルダーバリデーション

- **命名規則チェック**: 推奨キーワードベースの命名規則
- **整合性確認**: HTMLとプレースホルダーリストの一致確認
- **自動修正機能**: 不整合の自動検出と修正提案

### サンプルテンプレート

シードスクリプトでは以下の就活向けテンプレートが作成されます：

- **就活支援バナー** - 基本的なグラデーション背景バナー
- **大型就活バナー** - インパクトのある大型バナー
- **就活テキスト広告** - シンプルなテキストのみの広告
- **就活サービスカード** - 画像とロゴ付きカード形式
- **記事内就活インライン** - 記事に自然に溶け込むインライン広告
- **記事内就活カード** - 記事内挿入用カード型広告
- **就活リボン型** - 特殊形状のリボンデザイン
- **就活アイコン広告** - 円形アイコンを使った横長デザイン

## URLテンプレートシステム

### 主要機能

- **UTMパラメータ管理**: 標準的なUTMトラッキングパラメータ（source、medium、campaign、term、content）の完全サポート
- **カスタムパラメータ**: JSON形式でのカスタムトラッキングパラメータ対応
- **テンプレート有効化**: ブール値フラグによるURLテンプレートの有効・無効制御
- **URL生成**: ベースURLとパラメータの組み合わせによる完全なトラッキングURL生成
- **バリデーション**: URL形式とパラメータ整合性の検証機能
- **CSV インポート/エクスポート**: URLテンプレートの一括管理機能

### URLテンプレート管理機能

- **CRUD操作**: URLテンプレートの作成・読み取り・更新・削除
- **UTMパラメータ設定**: キャンペーン別のトラッキングパラメータ管理
- **プレビュー機能**: 生成されるトラッキングURLのリアルタイムプレビュー
- **テンプレート一覧**: カード形式での直感的なテンプレート管理
- **フィルタリング**: アクティブ・非アクティブテンプレートの切り替え表示

### サンプルURLテンプレート

シードスクリプトでは以下のURLテンプレートが作成されます：

- **就活サイト基本URL** - PORTキャリア向け基本トラッキング
- **キャンペーン専用URL** - 特定キャンペーン用UTMパラメータ付き
- **SNS投稿用URL** - ソーシャルメディア投稿用カスタムパラメータ付き
- **メール配信用URL** - メールマーケティング用トラッキング
- **広告配信用URL** - 広告プラットフォーム別トラッキング

## テスト

プロジェクトにはJestとReact Testing Libraryを使用した包括的なテストスイート（25スイート、285テスト）が含まれています：

```bash
# 全テスト実行
npm test

# 特定のテストファイル実行
npm test Button.test.tsx

# テストカバレッジ表示
npm test -- --coverage
```

### テストファイル

- `__tests__/components/` - React コンポーネントのテスト（Button、LoginForm、Sidebar、AdTemplates、Dashboard等）
- `__tests__/lib/` - ユーティリティ関数のテスト（authorization、template-utils、url-template-actions等）
- `__tests__/api/` - API エンドポイントのテスト（テンプレート、URLテンプレート API等）
- `__tests__/hooks/` - React Hooksのテスト（useTemplates、useUrlTemplates等）

### テスト環境

- **jsdom環境**: DOM操作のテスト対応
- **Web API モック**: Request/Response、FormData、Headers、fetch等の完全モック
- **NextAuth.js モック**: 認証システムのテスト対応
- **Monaco Editor モック**: エディターコンポーネントのテスト対応
- **アクセシビリティテスト**: 適切なlabel属性とtest-id設定
- **インテグレーションテスト**: API呼び出しとコンポーネント連携のテスト

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

### パフォーマンス

- **Turbopack** による高速ビルド
- **Server Components** によるサーバーサイドレンダリング
- **Monaco Editor** による軽量なコードエディター体験

## デプロイ

Vercelを使用したデプロイが推奨されます：

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme)

デプロイ前に以下を確認してください：

- 環境変数の設定
- データベースの初期化
- 本番用認証情報の設定
