# システムアーキテクチャ

## プロジェクト構造

```
pj-ado-mvp/
├── src/
│   ├── app/                    # App Router ページ
│   │   ├── api/              # API ルート
│   │   │   ├── auth/[...nextauth]/ # NextAuth API ルート
│   │   │   ├── ad-contents/  # 広告コンテンツ API
│   │   │   │   ├── route.ts  # GET, POST (全広告コンテンツ)
│   │   │   │   └── [id]/route.ts # GET, PUT, DELETE (個別)
│   │   │   ├── templates/    # 広告テンプレート API
│   │   │   │   ├── route.ts  # GET, POST (全テンプレート)
│   │   │   │   ├── [id]/route.ts # GET, PUT, DELETE (個別)
│   │   │   │   ├── import/route.ts # POST (CSVインポート)
│   │   │   │   └── export/route.ts # GET (CSVエクスポート)
│   │   │   ├── upload/       # ファイルアップロード API
│   │   │   │   └── route.ts  # POST (画像アップロード)
│   │   │   ├── integrity-check/ # 整合性チェック API
│   │   │   │   └── route.ts  # GET (システム整合性状況取得)
│   │   │   └── url-templates/ # URLテンプレート API
│   │   │       ├── route.ts  # GET, POST (全URLテンプレート)
│   │   │       ├── [id]/route.ts # GET, PUT, DELETE (個別)
│   │   │       ├── import/route.ts # POST (CSVインポート)
│   │   │       └── export/route.ts # GET (CSVエクスポート)
│   │   ├── dashboard/         # ダッシュボード
│   │   ├── ads/              # 広告コンテンツ管理
│   │   ├── ad-templates/     # 広告テンプレート管理
│   │   ├── url-templates/    # URLテンプレート管理
│   │   ├── article-ad-mapping/ # 記事・広告紐付け管理
│   │   ├── accounts/         # アカウント管理
│   │   ├── login/           # ログインページ
│   │   ├── layout.tsx       # ルートレイアウト
│   │   └── page.tsx         # ホームページ
│   ├── components/           # 共通コンポーネント
│   ├── hooks/               # 共通カスタムフック
│   ├── lib/                 # ユーティリティ・設定
│   ├── auth.config.ts       # NextAuth.js設定詳細
│   └── auth.ts              # NextAuth.js設定
├── scripts/               # ユーティリティスクリプト
│   └── seed.js           # データベース初期化
└── middleware.ts         # ルート保護ミドルウェア
```

## 認証・認可システム

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

| 役割               | レベル | 権限                                |
|------------------|-----|-----------------------------------|
| **管理者 (admin)**  | 2   | 全機能アクセス、ユーザー管理、テンプレート管理、広告コンテンツ管理 |
| **編集者 (editor)** | 1   | テンプレート作成・編集、広告コンテンツ管理             |

#### 認可ヘルパー関数

- `hasMinimumRole(user, role)` - 最小権限チェック
- `isAdmin(user)` - 管理者権限チェック
- `canEdit(user)` - 編集権限チェック
- `withAuthorization(handler, requiredRole)` - API認可ラッパー

### アーキテクチャ

- 認証されていないユーザー: ログインフォームのみ表示
- 認証済みユーザー: サイドバー付きメインレイアウト表示
- 役割に応じた機能制限 (アカウント管理は管理者のみ)