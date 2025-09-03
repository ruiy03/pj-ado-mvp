# Next.js × WordPress統合広告システム開発記

～Claude Codeで効率化した現代的な広告配信プラットフォームの構築～

## はじめに：散らばった広告管理を統合したい

現在、各メディアサイトではWordPressプラグインを使って記事に広告を埋め込んでいますが、以下の課題がありました：

- 広告コンテンツの管理が各サイトに分散
- 統一的な広告効果測定ができない
- 新しい広告の作成・配布が非効率
- デザインテンプレートの共有が困難

「これを統一的に管理できるシステムがあれば...」そんな思いから、新卒としてほぼ開発素人の状態から、Claude
Codeを活用してMVPを開発することになりました。今回は特に、Next.jsで構築した管理システムとWordPress側との連携部分に焦点を当てて紹介します。

## システム設計：まずは全体像を整理

### アーキテクチャの基本方針

最初に決めたのは、以下の3つの原則でした：

1. **テンプレート駆動**: 一つのテンプレートから複数の広告を生成
2. **API統合**: WordPressとNext.jsをAPIで疎結合に連携
3. **リアルタイム分析**: 配信と同時にパフォーマンスデータを収集

### 技術スタック選定

**フロントエンド：Next.js 15 + React 19**

- App Routerによる直感的なルーティング
- Server Actionsで簡潔なサーバー処理
- TypeScript 5で型安全性を確保

**データベース：Neon PostgreSQL**

- サーバーレス環境での高速接続
- 自動スケーリングでトラフィック変動に対応

**ファイルストレージ：Vercel Blob**

- グローバルCDNで高速画像配信
- Next.jsエコシステムとの親和性

**WordPress統合：専用プラグイン**

- 簡単なショートコード `[lmg_ad id="123"]` で広告表示
- REST API経由でNext.jsシステムと連携

## Claude Code活用：開発効率を劇的に向上

### `/add-dir` による並行開発

従来、Next.jsプロジェクトとWordPressプラグインの開発は別々のターミナルで行う必要がありました。しかし、Claude Codeの
`/add-dir` でWordPressプラグイン用ディレクトリを追加することで、以下が可能になりました：

```bash
# WordPressプラグインディレクトリを追加
/add-dir ./wordpress-plugin/custom-ad-manager
```

これにより：

- **API設計の統一**: Next.js側のAPIエンドポイントとWordPress側のクライアント実装を同時修正
- **データ形式の一致**: 両システム間のJSONデータ構造を一貫して管理
- **デバッグの効率化**: 連携エラーを両方のコードを見ながら解決

### 具体的な開発フロー

1. **テーブル設計**: PostgreSQLスキーマをClaude Codeで設計・検証
2. **API実装**: Next.js APIルートとWordPress REST APIを並行開発
3. **プラグイン作成**: WordPressプラグインのクラス設計とショートコード実装
4. **統合テスト**: 両システムが正しく連携するかを確認

例えば、広告配信APIの実装では、Next.js側のエンドポイント（`/api/delivery/[id]`
）とWordPress側のAPI呼び出し処理を同時に書けたため、仕様の不整合が発生しませんでした。

## 実装のポイント：WordPress連携の詳細

### WordPressプラグイン開発

WordPressとNext.jsシステムを繋ぐために、専用プラグインを開発しました。WordPressプラグインは、PHPで記述されたWordPress機能拡張モジュールで、以下の構成で実装：

```
custom-ad-manager/
├── custom-ad-manager.php          # メインプラグインファイル
├── includes/
│   ├── class-ad-shortcode.php     # ショートコード処理
│   ├── class-ad-api-client.php    # Next.js API通信
│   └── class-ad-cache.php         # キャッシュ管理
```

### プレースホルダー機能

このシステムの核となるのが、プレースホルダーを使ったテンプレート機能です：

```html
<!-- 広告テンプレート例 -->
<div class="career-banner">
  <h2>{{title}}</h2>
  <img src="{{image}}" alt="{{title}}"/>
  <a href="{{link}}" class="cta-button">{{button_text}}</a>
</div>
```

これに対して、個別の広告コンテンツでは以下のデータを設定：

```json
{
  "title": "転職成功率96%！業界最高峰のサポート",
  "image": "https://blob.vercel-storage.com/career-banner.jpg",
  "link": "https://example.com/career?utm_source=port_career",
  "button_text": "無料相談はこちら"
}
```

### WordPress側の実装

記事作成者は、以下のように簡単に広告を埋め込めます：

```php
// WordPressの記事内
[lmg_ad id="123" class="sidebar-ad" cache="3600"]
```

プラグイン側では、このショートコードを以下のように処理：

```php
public function render_ad($atts) {
    $ad_id = sanitize_text_field($atts['id']);
    
    // キャッシュから取得を試行
    $cached = LMG_Ad_Cache::get($ad_id);
    if ($cached !== false) {
        return $this->wrap_html($cached, $atts);
    }
    
    // Next.js APIから広告データを取得
    $api_client = new LMG_Ad_API_Client();
    $ad_data = $api_client->get_ad_data($ad_id);
    
    // HTMLをサニタイズして表示
    $html = wp_kses($ad_data['html'], $this->allowed_tags());
    LMG_Ad_Cache::set($ad_id, $html, 3600);
    
    return $this->wrap_html($html, $atts);
}
```

## API設計：システム間の橋渡し

### Next.js側の公開APIエンドポイント

**1. 広告配信API (`/api/delivery/[id]`)**

```json
// GET /api/delivery/123
// レスポンス例
{
  "html": "<div class=\"career-banner\">...[プレースホルダー置換済みHTML]...</div>",
  "id": 123,
  "name": "春の転職キャンペーン",
  "status": "active",
  "template": {
    "id": 1,
    "name": "転職バナーテンプレート"
  },
  "url_template": {
    "id": 2,
    "name": "キャンペーンURL"
  }
}
```

このAPIが広告配信の中核で、WordPress側から呼び出されます。プレースホルダーの置換と**外部リンクの自動追跡URL化**
を実行します。キャッシュは HTTPヘッダー（`Cache-Control: public, max-age=300`）で5分間設定。

### クリック追跡の自動化システム

システムは外部リンクを自動的に追跡URLに変換します：

```html
<!-- 元のテンプレート -->
<a href="{{link}}" class="cta-button">{{button_text}}</a>

<!-- プレースホルダー置換後 -->
<a href="https://example.com/career?utm_source=port_career" class="cta-button">無料相談はこちら</a>

<!-- 自動追跡URL変換後（最終出力） -->
<a href="http://localhost:3000/api/delivery/123/click?url=https%3A%2F%2Fexample.com%2Fcareer%3Futm_source%3Dport_career"
   class="cta-button">無料相談はこちら</a>
```

クリック時は `/api/delivery/[id]/click` エンドポイントが：

1. クリック数をデータベースに記録
2. 元のURLにリダイレクト
3. 透明性を保ちながら分析データを収集

**2. WordPress同期API (`/api/wordpress/sync`)**

```json
// POST /api/wordpress/sync
// リクエスト例（WordPressから送信）
{
  "shortcodes": [
    {
      "ad_id": "123",
      "posts": [
        {
          "id": 456,
          "title": "転職成功の秘訣",
          "url": "https://example.com/success-tips"
        }
      ]
    }
  ]
}
```

WordPress側の広告使用状況をNext.js側に同期し、どの記事でどの広告が使用されているかを把握。

### WordPress側のAPIエンドポイント

**ショートコード使用状況API (`/wp-json/lmg-ad-manager/v1/shortcode-usage`)**

```php
// レスポンス例
{
  "shortcodes": [
    {
      "ad_id": "123",
      "count": 5,
      "posts": [
        {
          "id": 456,
          "title": "転職成功の秘訣",
          "url": "https://portcareer.jp/success-tips"
        }
      ]
    }
  ]
}
```

### API連携フロー

**広告表示の流れ:**

```
1. サイト訪問者が記事ページアクセス
   ↓
2. WordPress: [lmg_ad id="123"] ショートコード処理
   ↓
3. WordPress → Next.js: GET /api/delivery/123
   ↓
4. Next.js → PostgreSQL: 広告データ取得 + インプレッション記録
   ↓
5. Next.js: プレースホルダー置換 + リンクの追跡URL変換
   ↓
6. Next.js → WordPress: 完成HTML + メタデータ返却（5分キャッシュ設定）
   ↓
7. WordPress → ユーザー: 最終的な広告を表示
```

**データ同期の流れ:**

```
1. 管理画面で「同期」ボタンクリック
   ↓
2. Next.js → WordPress: GET /wp-json/lmg-ad-manager/v1/shortcode-usage
   ↓
3. WordPress: 全記事のショートコード解析
   ↓
4. WordPress → Next.js: 使用状況データ送信
   ↓
5. Next.js → PostgreSQL: mappingsテーブル更新
   ↓
6. 管理画面: 同期完了通知表示
```

## 管理画面の設計

### 広告コンテンツ作成画面

```
┌─────────────────────────────────────────┐
│ 広告名: [春の転職キャンペーン]            │
│ テンプレート: [転職バナーテンプレート ▼] │
├─────────────────────────────────────────┤
│ プレースホルダー設定：                   │
│ title: [転職成功率96%！業界最高峰のサポート]│
│ image: [📁 ファイルアップロード]          │
│ button_text: [無料相談はこちら]          │
│ link: [https://example.com/career]      │
├─────────────────────────────────────────┤
│ プレビュー：                             │
│ ┌─────────────────────────────────────┐ │
│ │ [実際の広告プレビュー]                │ │
│ └─────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

### システム全体図

```
                ┌─────────────────────┐
                │   管理者・編集者     │
                └──────────┬──────────┘
                          │
                ┌─────────────────────┐
                │  Next.js 管理画面    │
                │  ・テンプレート管理    │
                │  ・広告コンテンツ作成  │
                │  ・パフォーマンス分析  │
                └──────────┬──────────┘
                          │
            ┌─────────────────────────────┐
            │        PostgreSQL           │
            │   ・ad_templates            │
            │   ・ad_contents             │
            │   ・article_ad_mappings     │
            └─────────────┬───────────────┘
                          │
                ┌─────────────────────┐
                │   WordPress サイト   │
                │                     │
    ┌───────────┼─────────────────────┼───────────┐
    │           │                     │           │
┌───▼───┐  ┌───▼───┐           ┌─────▼─────┐ ┌───▼───┐
│記事A   │  │記事B   │    ...    │   記事N   │ │管理画面│
│[lmg_ad│  │[lmg_ad│           │  [lmg_ad  │ │同期   │
│id="1"]│  │id="2"]│           │  id="3"]  │ │機能   │
└───────┘  └───────┘           └───────────┘ └───────┘
```

## まとめ：Claude Codeが変えた開発体験

この開発を通じて、Claude Codeの `/add-dir` 機能がいかに強力かを実感しました。特にNext.jsとWordPressという異なる技術スタックを統合する際、単一のコンテキストで両方を扱えることで：

- **設計の一貫性**が保たれる
- **API仕様の齟齬**がなくなる
- **デバッグ時間**が大幅に短縮される

```
従来の開発フロー:
Next.js開発 → WordPress開発 → 統合テスト → バグ修正の繰り返し

Claude Code活用後:
両方同時開発（Claude Code） → 一発で統合完了
```

現代のWebシステム開発では、異なる技術スタック間の連携が複雑になりがちです。しかし、Claude
Codeと適切なアーキテクチャ設計により、効率的で保守性の高いシステムを短期間で構築できました。
