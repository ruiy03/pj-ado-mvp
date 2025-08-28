# API リファレンス

## 広告テンプレート API

| エンドポイント                 | メソッド   | 説明               | 認証 |
|-------------------------|--------|------------------|----|
| `/api/templates`        | GET    | 全テンプレート取得        | 必須 |
| `/api/templates`        | POST   | 新規テンプレート作成       | 必須 |
| `/api/templates/[id]`   | GET    | 個別テンプレート取得       | 必須 |
| `/api/templates/[id]`   | PUT    | テンプレート更新         | 必須 |
| `/api/templates/[id]`   | DELETE | テンプレート削除         | 必須 |
| `/api/templates/import` | POST   | CSVからテンプレートインポート | 必須 |
| `/api/templates/export` | GET    | テンプレートをCSVエクスポート | 必須 |

## URLテンプレート API

| エンドポイント                     | メソッド   | 説明                  | 認証 |
|-----------------------------|--------|---------------------|----|
| `/api/url-templates`        | GET    | 全URLテンプレート取得        | 必須 |
| `/api/url-templates`        | POST   | 新規URLテンプレート作成       | 必須 |
| `/api/url-templates/[id]`   | GET    | 個別URLテンプレート取得       | 必須 |
| `/api/url-templates/[id]`   | PUT    | URLテンプレート更新         | 必須 |
| `/api/url-templates/[id]`   | DELETE | URLテンプレート削除         | 必須 |
| `/api/url-templates/import` | POST   | CSVからURLテンプレートインポート | 必須 |
| `/api/url-templates/export` | GET    | URLテンプレートをCSVエクスポート | 必須 |

## 広告コンテンツ API

| エンドポイント                 | メソッド   | 説明           | 認証 |
|-------------------------|--------|--------------|----|
| `/api/ad-contents`      | GET    | 全広告コンテンツ取得   | 必須 |
| `/api/ad-contents`      | POST   | 新規広告コンテンツ作成  | 必須 |
| `/api/ad-contents/[id]` | GET    | 個別広告コンテンツ取得  | 必須 |
| `/api/ad-contents/[id]` | PUT    | 広告コンテンツ更新    | 必須 |
| `/api/ad-contents/[id]` | DELETE | 広告コンテンツ削除    | 必須 |
| `/api/upload`           | POST   | 画像ファイルアップロード | 必須 |

## 広告配信 API

| エンドポイント                    | メソッド | 説明                 | 認証 |
|----------------------------|------|--------------------|----|
| `/api/delivery/[id]`       | GET  | 広告配信（インプレッション追跡付き） | 不要 |
| `/api/delivery/[id]/click` | GET  | クリック追跡・リダイレクト      | 不要 |

## テンプレート整合性チェック API

| エンドポイント                                   | メソッド | 説明              | 認証 |
|-------------------------------------------|------|-----------------|----|
| `/api/integrity-check`                    | GET  | システム整合性状況取得     | 必須 |
| `/api/templates/[id]/analyze-changes`     | POST | テンプレート変更影響分析    | 必須 |
| `/api/templates/[id]/sync-content`        | POST | テンプレート変更同期      | 必須 |
| `/api/url-templates/[id]/analyze-changes` | POST | URLテンプレート変更影響分析 | 必須 |
| `/api/url-templates/[id]/sync-content`    | POST | URLテンプレート変更同期   | 必須 |

## 画像クリーンアップ API

| エンドポイント                     | メソッド | 説明                 | 認証     |
|-----------------------------|------|--------------------|--------|
| `/api/admin/cleanup-images` | GET  | 自動画像クリーンアップ（Cron用） | Cron認証 |

## WordPress統合 API

### Next.js 側エンドポイント（WordPress からのアクセス用）

| エンドポイント                        | メソッド | 説明                    | 認証 |
|--------------------------------|------|-----------------------|----|
| `/api/article-mappings/export` | GET  | 記事広告マッピングデータCSVエクスポート | 必須 |
| `/api/articles/without-ads`    | GET  | 広告なし記事データ取得           | 必須 |
| `/api/wordpress/sync`          | POST | WordPress データ同期       | 必須 |

### WordPress 側エンドポイント（Next.js からのアクセス用）

#### 1. ショートコード使用状況API

**エンドポイント**: `GET /wp-json/lmg-ad-manager/v1/shortcode-usage`

**機能**: WordPress投稿内の `[lmg_ad]` ショートコード使用状況を解析して返す

**レスポンス例**:

```json
{
  "shortcodes": [
    {
      "ad_id": "123",
      "count": 8,
      "posts": [
        {
          "id": 456,
          "title": "記事タイトル",
          "url": "https://example.com/post/456"
        }
      ]
    }
  ]
}
```

**実装詳細**:

- 全公開投稿をスキャン
- 正規表現でショートコードを抽出
- `id` と `code` 属性の両方に対応（互換性維持）
- 投稿の重複を防ぐロジック実装

#### 2. 全記事取得API

**エンドポイント**: `GET /wp-json/lmg-ad-manager/v1/all-articles`

**パラメータ**:
| パラメータ | 型 | デフォルト | 制限 | 説明 |
|------------|-----|-----------|------|------|
| `page` | integer | 1 | - | ページ番号 |
| `per_page` | integer | 100 | 最大100 | 1ページあたりの記事数 |

**レスポンス例**:

```json
{
  "articles": [
    {
      "id": "789",
      "title": "記事タイトル",
      "url": "https://example.com/article",
      "published_at": "2025-08-25",
      "category": "ニュース",
      "has_ad": true,
      "ad_ids": [
        "123",
        "456"
      ]
    }
  ],
  "total": 500,
  "page": 1,
  "per_page": 100
}
```

**機能**:

- ページネーション対応の効率的な記事取得
- カテゴリ情報も含む包括的なデータ
- 各記事の広告使用状況を自動解析
- 記事毎の広告ID一覧を提供

## 認証 API

| エンドポイント                   | メソッド     | 説明                  |
|---------------------------|----------|---------------------|
| `/api/auth/[...nextauth]` | GET/POST | NextAuth.js 認証ハンドラー |
