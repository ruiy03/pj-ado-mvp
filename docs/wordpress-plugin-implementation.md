# WordPress プラグイン実装ガイド

## プラグイン概要

**LMG Ad Manager**は、LMG広告管理システムとWordPressサイトを連携するための公式プラグインです。このプラグインにより、記事内で
`[lmg_ad id="123"]`というシンプルなショートコードを使用するだけで、高度な広告配信とトラッキングが利用できます。

## インストール・セットアップ

### 1. プラグインファイルの配置

WordPressの`wp-content/plugins/`ディレクトリに以下のファイル構造で配置：

```
wp-content/plugins/lmg-ad-manager/
├── lmg-ad-manager.php          # メインプラグインファイル
├── readme.txt                  # WordPress.orgスタンダード
├── USAGE.md                    # 使用方法ガイド
├── admin/
│   └── class-lmg-ad-admin.php # 管理画面UI
├── assets/
│   ├── css/
│   │   ├── lmg-ad-styles.css  # フロントエンド用CSS
│   │   └── admin-styles.css   # 管理画面用CSS
│   └── js/
│       └── lmg-ad-tracker.js  # クリック追跡JavaScript
└── includes/
    ├── class-lmg-ad-shortcode.php    # ショートコード処理
    ├── class-lmg-ad-api-client.php   # API通信
    ├── class-lmg-ad-cache.php        # キャッシュ管理
    └── class-lmg-ad-rest-api.php     # REST APIエンドポイント
```

### 2. プラグイン有効化

1. WordPress管理画面の**プラグイン** > **インストール済みプラグイン**へ移動
2. **LMG Ad Manager**プラグインを**有効化**
3. 有効化後、自動的にデフォルト設定が作成されます

### 3. 初期設定

#### API設定

1. **設定** > **LMG Ad Manager**に移動
2. **APIエンドポイント**に広告管理システムのURLを入力：
   ```
   https://your-ad-system.vercel.app/api/delivery
   ```
3. **APIタイムアウト**を設定（推奨：5秒）
4. **デフォルトキャッシュ時間**を設定（推奨：3600秒）

#### 接続テスト

1. **接続テスト**タブをクリック
2. **接続をテスト**ボタンを押してAPI接続を確認
3. 成功した場合、レスポンス時間と状態が表示されます

## プラグイン アーキテクチャ詳解

### メインクラス (`LMG_Ad_Manager`)

**責務**: プラグイン全体のライフサイクル管理

```php
class LMG_Ad_Manager {
    private static $instance = null;
    
    public static function get_instance() {
        if (null === self::$instance) {
            self::$instance = new self();
        }
        return self::$instance;
    }
    
    private function __construct() {
        $this->init();
    }
}
```

**主要機能**:

- **シングルトンパターン**: プラグイン全体で単一のインスタンス管理
- **自動ロード**: 必要なクラスファイルの動的読み込み
- **フック登録**: WordPressのアクション・フィルターを一元管理
- **アセット管理**: CSS/JavaScriptの条件付き読み込み

### ショートコード処理 (`LMG_Ad_Shortcode`)

**責務**: `[lmg_ad]` ショートコードの解析と処理

#### 処理フロー

```php
public function render_ad($atts) {
    // 1. 属性をサニタイズ
    $atts = shortcode_atts([
        'id' => '',
        'cache' => '',
        'class' => 'lmg-ad-container',
        'width' => '',
        'height' => '',
        'debug' => ''
    ], $atts, 'lmg_ad');
    
    // 2. キャッシュをチェック
    $cached_html = LMG_Ad_Cache::get($ad_id);
    if ($cached_html !== false && !$debug_mode) {
        return $this->wrap_ad_html($cached_html, $atts, true);
    }
    
    // 3. APIから広告データを取得
    $api_client = new LMG_Ad_API_Client();
    $ad_data = $api_client->get_ad_data($ad_id);
    
    // 4. HTMLをサニタイズ
    $ad_html = wp_kses($ad_data['html'], $this->get_allowed_html_tags());
    
    // 5. キャッシュに保存
    LMG_Ad_Cache::set($ad_id, $ad_html, $cache_time);
    
    return $this->wrap_ad_html($ad_html, $atts, false);
}
```

#### セキュリティ実装

```php
private function get_allowed_html_tags() {
    return [
        'div' => [
            'class' => [], 'id' => [], 'style' => [], 'data-*' => []
        ],
        'img' => [
            'src' => [], 'alt' => [], 'class' => [], 
            'width' => [], 'height' => [], 'style' => []
        ],
        'a' => [
            'href' => [], 'target' => [], 'class' => [], 
            'rel' => [], 'data-*' => []
        ],
        'script' => [
            'type' => [], 'src' => [], 'async' => [], 'defer' => []
        ]
    ];
}
```

### API通信クライアント (`LMG_Ad_API_Client`)

**責務**: Next.js広告管理システムとの通信処理

#### 主要メソッド

**広告データ取得**:

```php
public function get_ad_data($ad_code) {
    $url = $this->build_api_url($ad_code);
    $response = $this->make_request($url);
    return $this->parse_response($response);
}
```

**インプレッション追跡**:

```php
public function send_impression($ad_code, $data = []) {
    $url = $this->build_api_url($ad_code, 'impression');
    $post_data = array_merge([
        'timestamp' => time(),
        'user_agent' => $_SERVER['HTTP_USER_AGENT'] ?? '',
        'ip_address' => $this->get_client_ip()
    ], $data);
    
    return $this->make_request($url, 'POST', $post_data, false);
}
```

#### エラーハンドリング

```php
private function parse_response($response) {
    $response_code = wp_remote_retrieve_response_code($response);
    
    if ($response_code === 404) {
        throw new Exception('指定された広告コードが見つかりません。');
    } elseif ($response_code >= 500) {
        throw new Exception('広告サーバーで内部エラーが発生しました。');
    }
    
    $data = json_decode(wp_remote_retrieve_body($response), true);
    if (json_last_error() !== JSON_ERROR_NONE) {
        throw new Exception('APIレスポンスのJSONが無効です。');
    }
    
    return $data;
}
```

### キャッシュシステム (`LMG_Ad_Cache`)

**責務**: 広告データの高性能キャッシュ管理

#### 基本操作

```php
// キャッシュ保存
public static function set($ad_code, $data, $expiration = 3600) {
    $cache_key = self::get_cache_key($ad_code);
    return set_transient($cache_key, $data, $expiration);
}

// キャッシュ取得
public static function get($ad_code) {
    $cache_key = self::get_cache_key($ad_code);
    return get_transient($cache_key);
}

// キャッシュ削除
public static function delete($ad_code) {
    $cache_key = self::get_cache_key($ad_code);
    return delete_transient($cache_key);
}
```

#### 統計情報取得

```php
public static function get_cache_stats() {
    global $wpdb;
    
    $prefix = $wpdb->prefix . 'transient_' . self::CACHE_PREFIX;
    
    // 総キャッシュ数
    $total_cache = $wpdb->get_var(
        "SELECT COUNT(*) FROM {$wpdb->options} 
         WHERE option_name LIKE '{$prefix}%'"
    );
    
    // キャッシュサイズ
    $cache_size = $wpdb->get_var(
        "SELECT SUM(LENGTH(option_value)) FROM {$wpdb->options} 
         WHERE option_name LIKE '{$prefix}%'"
    );
    
    return [
        'total_count' => (int) $total_cache,
        'total_size_bytes' => (int) $cache_size,
        'total_size_mb' => round($cache_size / 1024 / 1024, 2)
    ];
}
```

#### 自動クリーンアップ

```php
// cron での定期実行
if (!wp_next_scheduled('lmg_ad_cache_cleanup')) {
    wp_schedule_event(time(), 'daily', 'lmg_ad_cache_cleanup');
}

add_action('lmg_ad_cache_cleanup', [LMG_Ad_Cache::class, 'auto_cleanup']);
```

### REST API (`LMG_Ad_REST_API`)

**責務**: WordPress ⇔ Next.js間のデータ連携API

#### エンドポイント登録

```php
public function register_routes() {
    register_rest_route('lmg-ad-manager/v1', '/shortcode-usage', [
        'methods' => 'GET',
        'callback' => [$this, 'get_shortcode_usage'],
    ]);
    
    register_rest_route('lmg-ad-manager/v1', '/all-articles', [
        'methods' => 'GET',
        'callback' => [$this, 'get_all_articles'],
        'args' => [
            'page' => ['default' => 1, 'sanitize_callback' => 'absint'],
            'per_page' => ['default' => 100, 'sanitize_callback' => 'absint']
        ],
    ]);
}
```

#### ショートコード解析処理

```php
public function get_shortcode_usage($request) {
    global $wpdb;
    
    // ショートコードを含む投稿を取得
    $posts = $wpdb->get_results("
        SELECT ID, post_title, post_content 
        FROM {$wpdb->posts} 
        WHERE post_status = 'publish' 
        AND post_content LIKE '%[lmg_ad%'
    ");
    
    $shortcode_data = [];
    
    foreach ($posts as $post) {
        // 正規表現でショートコードを抽出
        preg_match_all('/\[lmg_ad[^\]]*\]/', $post->post_content, $matches);
        
        foreach ($matches[0] as $shortcode) {
            // ID属性を抽出
            preg_match('/id="([^"]+)"/', $shortcode, $id_match);
            $ad_id = $id_match[1] ?? 'unknown';
            
            // データ構造を構築
            if (!isset($shortcode_data[$ad_id])) {
                $shortcode_data[$ad_id] = [
                    'ad_id' => $ad_id,
                    'count' => 0,
                    'posts' => []
                ];
            }
            
            $shortcode_data[$ad_id]['count']++;
            $shortcode_data[$ad_id]['posts'][] = [
                'id' => $post->ID,
                'title' => $post->post_title,
                'url' => get_permalink($post->ID)
            ];
        }
    }
    
    return ['shortcodes' => array_values($shortcode_data)];
}
```

## セキュリティ実装

### 1. 入力値サニタイゼーション

```php
// ショートコード属性のサニタイズ
$ad_id = sanitize_text_field($atts['id']);
$cache_time = (int) $atts['cache'];
$css_class = sanitize_html_class($atts['class']);
$width = sanitize_text_field($atts['width']);
$height = sanitize_text_field($atts['height']);
```

### 2. 出力エスケープ

```php
// HTML属性のエスケープ
$output = '<div class="' . esc_attr($css_class) . '"';
$output .= ' style="width: ' . esc_attr($width) . ';"';
$output .= ' data-ad-id="' . esc_attr($ad_id) . '">';
```

### 3. CSRF対策

```php
// Ajax通信でのNonce検証
public function handle_ad_click() {
    if (!wp_verify_nonce($_POST['nonce'], 'lmg_ad_click_nonce')) {
        wp_die('セキュリティチェックに失敗しました。');
    }
    // 処理続行
}

// JavaScript側でNonceを設定
wp_localize_script('lmg-ad-tracker', 'lmgAdManager', [
    'ajaxUrl' => admin_url('admin-ajax.php'),
    'nonce' => wp_create_nonce('lmg_ad_click_nonce')
]);
```

### 4. 権限チェック

```php
// 管理者権限の確認
private function render_error_message($message) {
    if (current_user_can('manage_options')) {
        return '<!-- LMG Ad Error: ' . esc_html($message) . ' -->';
    }
    return ''; // 一般ユーザーには非表示
}
```

## パフォーマンス最適化

### 1. アセット最適化

```php
public function enqueue_scripts() {
    // 条件付き読み込み
    if ($this->should_load_assets()) {
        wp_enqueue_style(
            'lmg-ad-manager-styles',
            LMG_AD_MANAGER_PLUGIN_URL . 'assets/css/lmg-ad-styles.css',
            [],
            LMG_AD_MANAGER_VERSION
        );
    }
}

private function should_load_assets() {
    // 投稿・固定ページでのみ読み込み
    return is_single() || is_page() || is_home();
}
```

### 2. データベースクエリ最適化

```php
// バッチ処理でメモリ効率化
public function get_all_articles($request) {
    $per_page = min($request->get_param('per_page'), 100); // 最大制限
    
    $posts = $wpdb->get_results($wpdb->prepare("
        SELECT p.ID, p.post_title, p.post_content, 
               t.name as category_name
        FROM {$wpdb->posts} p
        LEFT JOIN {$wpdb->term_relationships} tr ON p.ID = tr.object_id
        LEFT JOIN {$wpdb->term_taxonomy} tt ON tr.term_taxonomy_id = tt.term_taxonomy_id 
        LEFT JOIN {$wpdb->terms} t ON tt.term_id = t.term_id
        WHERE p.post_status = 'publish' 
        AND p.post_type = 'post'
        GROUP BY p.ID
        LIMIT %d OFFSET %d
    ", $per_page, $offset));
}
```

### 3. 非同期処理

```php
// インプレッション追跡を非同期で実行
wp_remote_post($api_endpoint, [
    'timeout' => 1,
    'blocking' => false, // 非同期実行
    'body' => json_encode($tracking_data)
]);
```

## トラブルシューティング

### 1. 一般的な問題と解決方法

#### 広告が表示されない

**原因**: API接続エラー、無効な広告ID、キャッシュ問題

**解決手順**:

1. デバッグモードを有効にする：
   ```php
   [lmg_ad id="123" debug="true"]
   ```
2. 接続テストを実行（管理画面）
3. キャッシュをクリア
4. エラーログを確認

#### パフォーマンス低下

**原因**: キャッシュ設定、API応答時間

**解決手順**:

1. キャッシュ時間を延長：
   ```php
   [lmg_ad id="123" cache="7200"]
   ```
2. APIタイムアウト時間を調整
3. キャッシュ統計を確認

#### セキュリティ警告

**原因**: HTMLサニタイゼーション、権限不足

**解決手順**:

1. 許可HTMLタグを確認
2. ユーザー権限を確認
3. WordPress セキュリティプラグインの設定を確認

### 2. ログ分析

```php
// デバッグログの確認場所
tail -f /path/to/wordpress/wp-content/debug.log | grep "LMG Ad Manager"

// よくあるログメッセージ
// "LMG Ad Manager: API接続エラー"
// "LMG Ad Manager: キャッシュヒット"
// "LMG Ad Manager: Slow query detected"
```

### 3. 設定リセット

```php
// 設定を初期化する場合
delete_option('lmg_ad_manager_options');
LMG_Ad_Cache::clear_all_cache();

// プラグイン再有効化
deactivate_plugins('lmg-ad-manager/lmg-ad-manager.php');
activate_plugins('lmg-ad-manager/lmg-ad-manager.php');
```

## 実用的な使用例

### 1. 基本的な広告表示

```php
// シンプルな広告表示
[lmg_ad id="123"]

// カスタムスタイル付き
[lmg_ad id="123" class="my-custom-ad" width="300px" height="250px"]
```

### 2. 条件分岐での表示

```php
<?php if (is_single()): ?>
    [lmg_ad id="1001" class="single-post-ad"]
<?php elseif (is_home()): ?>
    [lmg_ad id="1002" class="home-page-ad"]
<?php endif; ?>
```

### 3. ウィジェットでの使用

WordPressの**外観** > **ウィジェット**で**テキスト**ウィジェットにショートコードを挿入。

### 4. 記事内複数広告

```html
<!-- 記事上部 -->
[lmg_ad id="1001" class="ad-top"]

<p>記事コンテンツ...</p>

<!-- 記事中央 -->
[lmg_ad id="1002" class="ad-middle"]

<p>記事コンテンツ続き...</p>

<!-- 記事下部 -->
[lmg_ad id="1003" class="ad-bottom"]
```

## 拡張とカスタマイズ

### 1. カスタムフィルターフック

```php
// 広告HTML表示前にカスタム処理
add_filter('lmg_ad_before_render', function($html, $ad_id, $atts) {
    // カスタム処理を追加
    return $html;
}, 10, 3);

// キャッシュ時間をカスタマイズ
add_filter('lmg_ad_cache_time', function($cache_time, $ad_id) {
    if ($ad_id === 'special_ad') {
        return 7200; // 2時間キャッシュ
    }
    return $cache_time;
}, 10, 2);
```

### 2. カスタムアクションフック

```php
// 広告表示後にカスタム処理
add_action('lmg_ad_after_render', function($ad_id, $atts) {
    // 独自の統計処理など
}, 10, 2);

// キャッシュクリア時の処理
add_action('lmg_ad_cache_cleared', function($ad_id) {
    // クリア時の追加処理
});
```

### 3. 管理画面のカスタマイズ

```php
// 管理画面にカスタム設定を追加
add_action('admin_init', function() {
    add_settings_field(
        'custom_setting',
        'カスタム設定',
        'custom_setting_callback',
        'lmg-ad-manager',
        'lmg_ad_settings_section'
    );
});
```

このガイドにより、LMG Ad Managerプラグインの実装、設定、カスタマイズ、トラブルシューティングが包括的に理解できます。
