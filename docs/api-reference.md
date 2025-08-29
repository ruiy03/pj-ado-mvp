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

| エンドポイント                                      | 説明                  |
|----------------------------------------------|---------------------|
| `/wp-json/lmg-ad-manager/v1/shortcode-usage` | ショートコード使用状況を取得      |
| `/wp-json/lmg-ad-manager/v1/all-articles`    | 記事一覧を取得（ページネーション対応） |

## エラーレスポンス

全APIで共通のエラーフォーマット：

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "エラーメッセージ"
  }
}
```

#### 主要エラーコード

| エラーコード                | HTTPステータス | 説明              |
|-----------------------|-----------|-----------------|
| `UNAUTHORIZED`        | 401       | 認証が必要です         |
| `FORBIDDEN`           | 403       | 権限が不足しています      |
| `NOT_FOUND`           | 404       | リソースが見つかりません    |
| `VALIDATION_ERROR`    | 422       | 入力値が無効です        |
| `TEMPLATE_NOT_FOUND`  | 404       | テンプレートが存在しません   |
| `CONTENT_NOT_FOUND`   | 404       | 広告コンテンツが存在しません  |
| `IMAGE_UPLOAD_FAILED` | 500       | 画像アップロードに失敗しました |

## 認証 API

| エンドポイント                   | メソッド     | 説明                  |
|---------------------------|----------|---------------------|
| `/api/auth/[...nextauth]` | GET/POST | NextAuth.js 認証ハンドラー |

### 認証フロー

1. **ログイン**: `POST /api/auth/callback/credentials`
2. **セッション確認**: `GET /api/auth/session`
3. **ログアウト**: `POST /api/auth/signout`
