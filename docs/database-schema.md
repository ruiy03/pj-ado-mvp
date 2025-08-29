# データベーススキーマ

## users テーブル

| カラム          | 型            | 説明                    | 制約                         |
|--------------|--------------|-----------------------|----------------------------|
| `id`         | SERIAL       | プライマリキー               | PRIMARY KEY                |
| `name`       | VARCHAR(255) | ユーザー名                 | NOT NULL                   |
| `email`      | VARCHAR(255) | メールアドレス               | UNIQUE, NOT NULL           |
| `password`   | VARCHAR(255) | bcryptハッシュ化パスワード      | NOT NULL                   |
| `role`       | VARCHAR(20)  | ユーザー役割 (admin/editor) | NOT NULL, DEFAULT 'editor' |
| `created_at` | TIMESTAMP    | 作成日時                  | DEFAULT NOW()              |
| `updated_at` | TIMESTAMP    | 更新日時                  | DEFAULT NOW()              |

## ad_templates テーブル

| カラム            | 型            | 説明         | 制約            |
|----------------|--------------|------------|---------------|
| `id`           | SERIAL       | プライマリキー    | PRIMARY KEY   |
| `name`         | VARCHAR(255) | テンプレート名    | NOT NULL      |
| `html`         | TEXT         | HTMLテンプレート | NOT NULL      |
| `placeholders` | JSON         | プレースホルダー配列 |               |
| `description`  | TEXT         | テンプレート説明   |               |
| `created_at`   | TIMESTAMP    | 作成日時       | DEFAULT NOW() |
| `updated_at`   | TIMESTAMP    | 更新日時       | DEFAULT NOW() |

## ad_contents テーブル

| カラム                | 型            | 説明              | 制約                           |
|--------------------|--------------|-----------------|------------------------------|
| `id`               | SERIAL       | プライマリキー         | PRIMARY KEY                  |
| `name`             | VARCHAR(255) | 広告コンテンツ名        | NOT NULL                     |
| `template_id`      | INTEGER      | 広告テンプレートID（FK）  | REFERENCES ad_templates(id)  |
| `url_template_id`  | INTEGER      | URLテンプレートID（FK） | REFERENCES url_templates(id) |
| `content_data`     | JSON         | コンテンツデータ        |                              |
| `status`           | VARCHAR(20)  | ステータス           | NOT NULL, DEFAULT 'draft'    |
| `created_by`       | INTEGER      | 作成者ID（FK）       | REFERENCES users(id)         |
| `impressions`      | INTEGER      | インプレッション数       | DEFAULT 0                    |
| `clicks`           | INTEGER      | クリック数           | DEFAULT 0                    |
| `created_at`       | TIMESTAMP    | 作成日時            | DEFAULT NOW()                |
| `updated_at`       | TIMESTAMP    | 更新日時            | DEFAULT NOW()                |

## ad_images テーブル

| カラム                 | 型            | 説明              | 制約                         |
|---------------------|--------------|-----------------|----------------------------|
| `id`                | SERIAL       | プライマリキー         | PRIMARY KEY                |
| `ad_content_id`     | INTEGER      | 広告コンテンツID（FK）   | REFERENCES ad_contents(id) |
| `blob_url`          | TEXT         | Vercel Blob URL | NOT NULL                   |
| `original_filename` | VARCHAR(255) | 元ファイル名          |                            |
| `file_size`         | INTEGER      | ファイルサイズ（バイト）    |                            |
| `mime_type`         | VARCHAR(100) | MIMEタイプ         |                            |
| `alt_text`          | TEXT         | 代替テキスト          |                            |
| `placeholder_name`  | VARCHAR(100) | プレースホルダー名       |                            |
| `created_at`        | TIMESTAMP    | 作成日時            | DEFAULT NOW()              |

## url_templates テーブル

| カラム             | 型            | 説明         | 制約                     |
|-----------------|--------------|------------|------------------------|
| `id`            | SERIAL       | プライマリキー    | PRIMARY KEY            |
| `name`          | VARCHAR(255) | URLテンプレート名 | NOT NULL               |
| `base_url`      | TEXT         | ベースURL     | NOT NULL               |
| `utm_source`    | VARCHAR(255) | UTMソース     |                        |
| `utm_medium`    | VARCHAR(255) | UTMメディア    |                        |
| `utm_campaign`  | VARCHAR(255) | UTMキャンペーン  |                        |
| `utm_term`      | VARCHAR(255) | UTMキーワード   |                        |
| `utm_content`   | VARCHAR(255) | UTMコンテンツ   |                        |
| `custom_params` | JSON         | カスタムパラメータ  |                        |
| `description`   | TEXT         | 説明         |                        |
| `is_active`     | BOOLEAN      | アクティブ状態    | NOT NULL, DEFAULT true |
| `created_at`    | TIMESTAMP    | 作成日時       | DEFAULT NOW()          |
| `updated_at`    | TIMESTAMP    | 更新日時       | DEFAULT NOW()          |

## article_ad_mappings テーブル

| カラム          | 型            | 説明            | 制約                         |
|--------------|--------------|---------------|----------------------------|
| `id`         | SERIAL       | プライマリキー       | PRIMARY KEY                |
| `post_id`    | INTEGER      | WordPress記事ID | NOT NULL                   |
| `post_title` | VARCHAR(500) | 記事タイトル        | NOT NULL                   |
| `post_url`   | TEXT         | 記事URL         | NOT NULL                   |
| `ad_id`      | INTEGER      | 広告ID（FK）      | REFERENCES ad_contents(id) |
| `synced_at`  | TIMESTAMP    | 同期日時          |                            |
| `created_at` | TIMESTAMP    | 作成日時          | DEFAULT NOW()              |
| `updated_at` | TIMESTAMP    | 更新日時          | DEFAULT NOW()              |

## テーブル関係図

```
users
  ├── ad_contents (created_by)

ad_templates
  ├── ad_contents (template_id)

url_templates
  ├── ad_contents (url_template_id)

ad_contents
  ├── ad_images (ad_content_id)
  ├── article_ad_mappings (ad_id)
```