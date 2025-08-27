# 記事広告マッピングシステム

## 主要機能

- **WordPress API連携**: カスタムエンドポイント経由でのショートコード使用状況取得と全記事データ取得
- **マッピングデータ同期**: WordPress投稿と広告IDの関連付けデータの自動同期
- **広告なし記事検出**: WordPress全記事から広告が設定されていない記事を自動検出・表示
- **タブ型UI**: マッピング済み記事と広告なし記事の切り替え表示によるユーザビリティ向上
- **使用統計分析**: 広告別・記事別の使用状況とパフォーマンス分析、広告名付き統計表示
- **データエクスポート**: CSV形式での詳細データエクスポート機能（マッピングデータ・使用統計）
- **フィルタリング機能**: カテゴリ別・検索による記事の絞り込み表示
- **リアルタイム同期**: 手動・自動での同期機能によるデータ整合性維持

## WordPress統合要件

WordPress側に以下のカスタムAPIエンドポイントが必要：

```php
// WordPress プラグインまたは functions.php
add_action('rest_api_init', function () {
  register_rest_route('lmg-ad-manager/v1', '/shortcode-usage', [
    'methods' => 'GET',
    'callback' => 'get_shortcode_usage_data',
  ]);
});
```

## データ構造

```json
{
  "shortcodes": [
    {
      "ad_id": "123",
      "count": 5,
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

## システム構成

記事と広告の自動紐付け管理のためのWordPress統合システム：

- **WordPress同期**: `src/lib/wordpress-sync-actions.ts` - カスタムAPIエンドポイント経由でのWordPressサイトからのマッピングデータ取得用サーバーアクション
- **マッピング管理**: `ArticleAdMappingClient.tsx` - リアルタイムデータ同期と使用統計を備えたメインインターフェース
- **データ可視化**: `MappingsTable.tsx` - 投稿-広告関係の表示、`UsageStatsCard.tsx` - 使用アナリティクスの表示
- **同期機能**: `SyncButton.tsx` - 進捗フィードバック付きの手動WordPress データ同期のトリガー
- **データエクスポート**: `ExportButtons.tsx` - 分析用のマッピングデータのCSVエクスポート機能
- **広告なし記事追跡**: `ArticlesWithoutAdsTable.tsx` - フィルタリングとソート機能付きの関連広告を持たないWordPress記事の表示
- **強化された使用統計**: より良いデータ可視化のための広告名と強化されたUIを含む使用統計
- **WordPress API統合**: ショートコード使用データ取得用のカスタムエンドポイント
  `/wp-json/lmg-ad-manager/v1/shortcode-usage`、包括的記事取得用の `/wp-json/wp/v2/posts`
- **データベーススキーマ**: `article_ad_mappings` テーブル - WordPress投稿関係と広告ID、同期タイムスタンプを保存
- **認証**: 管理者と編集者の役割により同期操作とマッピングデータ表示が可能

## 技術的特徴

- **AbortSignal対応**: 30秒タイムアウト設定によるAPIリクエスト制御
- **エラーハンドリング**: 包括的なエラー処理とログ出力
- **権限管理**: 管理者・編集者権限でのデータ同期・閲覧制御
- **データベース統合**: `article_ad_mappings`テーブルでの永続化
