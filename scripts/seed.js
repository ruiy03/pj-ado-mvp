const {neon} = require('@neondatabase/serverless');
const bcrypt = require('bcrypt');
const path = require('path');

// Load environment variables
require('dotenv').config({path: path.resolve(process.cwd(), '.env.local')});

const sql = neon(process.env.DATABASE_URL);

async function seed() {
  try {
    console.log('Creating users table...');

    // Create users table with role column
    await sql`
        CREATE TABLE IF NOT EXISTS users
        (
            id
            SERIAL
            PRIMARY
            KEY,
            name
            VARCHAR
        (
            255
        ) NOT NULL,
            email VARCHAR
        (
            255
        ) UNIQUE NOT NULL,
            password VARCHAR
        (
            255
        ) NOT NULL,
            role VARCHAR
        (
            20
        ) DEFAULT 'editor' NOT NULL,
            created_at TIMESTAMP DEFAULT NOW
        (
        ),
            updated_at TIMESTAMP DEFAULT NOW
        (
        )
            );
    `;

    // Create index on role column
    await sql`
        CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
    `;

    console.log('Creating ad_templates table...');

    // Create ad_templates table
    await sql`
        CREATE TABLE IF NOT EXISTS ad_templates
        (
            id
            SERIAL
            PRIMARY
            KEY,
            name
            VARCHAR
        (
            255
        ) NOT NULL,
            html TEXT NOT NULL,
            description TEXT,
            created_at TIMESTAMP DEFAULT NOW
        (
        ),
            updated_at TIMESTAMP DEFAULT NOW
        (
        )
            );
    `;

    console.log('Creating url_templates table...');

    // Drop existing url_templates table to ensure schema matches
    await sql`DROP TABLE IF EXISTS url_templates CASCADE`;

    // Create url_templates table
    await sql`
        CREATE TABLE url_templates
        (
            id
                         SERIAL
                PRIMARY
                    KEY,
            name
                         VARCHAR(255) NOT NULL,
            url_template TEXT         NOT NULL,
            description  TEXT,
            created_at   TIMESTAMP DEFAULT NOW
                                           (
                                           ),
            updated_at   TIMESTAMP DEFAULT NOW
                                           (
                                           )
        );
    `;

    console.log('Creating ad_contents table...');

    // Drop existing ad_contents table to ensure schema matches
    await sql`DROP TABLE IF EXISTS ad_contents CASCADE`;

    // Create ad_contents table
    await sql`
        CREATE TABLE ad_contents
        (
            id
            SERIAL
            PRIMARY
            KEY,
            name
            VARCHAR
        (
            255
        ) NOT NULL,
            template_id INTEGER REFERENCES ad_templates
        (
            id
        ) ON DELETE CASCADE,
            url_template_id INTEGER REFERENCES url_templates
        (
            id
        )
          ON DELETE CASCADE,
            content_data JSON DEFAULT '{}',
            status VARCHAR
        (
            20
        ) DEFAULT 'draft',
            created_by INTEGER REFERENCES users
        (
            id
        )
          ON DELETE SET NULL,
            created_at TIMESTAMP DEFAULT NOW
        (
        ),
            updated_at TIMESTAMP DEFAULT NOW
        (
        )
            );
    `;

    console.log('Creating ad_images table...');

    // Drop existing ad_images table to ensure schema matches
    await sql`DROP TABLE IF EXISTS ad_images CASCADE`;

    // Create ad_images table
    await sql`
        CREATE TABLE ad_images
        (
            id
            SERIAL
            PRIMARY
            KEY,
            ad_content_id
            INTEGER
            REFERENCES
            ad_contents
        (
            id
        ) ON DELETE CASCADE,
            blob_url VARCHAR
        (
            500
        ) NOT NULL,
            original_filename VARCHAR
        (
            255
        ),
            file_size INTEGER,
            mime_type VARCHAR
        (
            100
        ),
            alt_text VARCHAR
        (
            255
        ),
            placeholder_name VARCHAR
        (
            100
        ), -- テンプレートのプレースホルダー名
            created_at TIMESTAMP DEFAULT NOW
        (
        )
            );
    `;

    console.log('Adding delivery tracking columns to ad_contents...');

    // Add delivery tracking columns to ad_contents table
    await sql`
        ALTER TABLE ad_contents 
        ADD COLUMN IF NOT EXISTS impressions INTEGER DEFAULT 0,
        ADD COLUMN IF NOT EXISTS clicks INTEGER DEFAULT 0,
        ADD COLUMN IF NOT EXISTS last_accessed_at TIMESTAMP
    `;

    // Create indexes for performance
    await sql`
        CREATE INDEX IF NOT EXISTS idx_ad_contents_template_id ON ad_contents(template_id);
    `;
    await sql`
        CREATE INDEX IF NOT EXISTS idx_ad_contents_url_template_id ON ad_contents(url_template_id);
    `;
    await sql`
        CREATE INDEX IF NOT EXISTS idx_ad_contents_created_by ON ad_contents(created_by);
    `;
    await sql`
        CREATE INDEX IF NOT EXISTS idx_ad_contents_status ON ad_contents(status);
    `;
    await sql`
        CREATE INDEX IF NOT EXISTS idx_ad_images_ad_content_id ON ad_images(ad_content_id);
    `;

    console.log('Creating article_ad_mappings table...');

    // Create article_ad_mappings table
    await sql`
        CREATE TABLE IF NOT EXISTS article_ad_mappings (
            id SERIAL PRIMARY KEY,
            post_id INTEGER NOT NULL,
            post_title VARCHAR(255),
            post_url TEXT,
            ad_id VARCHAR(50) NOT NULL,
            synced_at TIMESTAMP DEFAULT NOW(),
            created_at TIMESTAMP DEFAULT NOW(),
            updated_at TIMESTAMP DEFAULT NOW(),
            UNIQUE(post_id, ad_id)
        )
    `;

    // Create indexes for article_ad_mappings
    await sql`
        CREATE INDEX IF NOT EXISTS idx_article_ad_mappings_post_id ON article_ad_mappings(post_id);
    `;
    await sql`
        CREATE INDEX IF NOT EXISTS idx_article_ad_mappings_ad_id ON article_ad_mappings(ad_id);
    `;

    console.log('Seeding users...');

    // Hash passwords
    const adminPassword = await bcrypt.hash('password123', 10);
    const editorPassword = await bcrypt.hash('password123', 10);

    // Insert test users
    await sql`
        INSERT INTO users (name, email, password, role)
        VALUES ('管理者', 'admin@example.com', ${adminPassword}, 'admin'),
               ('編集者', 'editor@example.com', ${editorPassword}, 'editor') ON CONFLICT (email) DO
        UPDATE SET
            role = EXCLUDED.role,
            password = EXCLUDED.password;
    `;

    console.log('Seeding ad_templates...');

    // Clear existing templates and insert new ones
    await sql`DELETE
              FROM ad_templates`;

    // Insert sample ad templates for job-hunting services
    await sql`
        INSERT INTO ad_templates (name, html, description)
        VALUES
            -- バナー系テンプレート
            ('就活支援バナー',
             '<a href="{{link}}" rel="nofollow" style="text-decoration: none; display: block;">
  <div class="ad-banner" style="background: linear-gradient(90deg, #3B82F6, #8B5CF6); color: white; padding: 20px; border-radius: 8px; text-align: center; cursor: pointer; transition: transform 0.2s;">
    <h2 style="font-size: 24px; margin-bottom: 16px;">{{title}}</h2>
    <img src="{{image}}" style="width: 100%; height: 200px; object-fit: cover; border-radius: 4px; margin-bottom: 16px;" alt="{{title}}" />
    <p style="font-size: 14px; opacity: 0.9;">{{button}}</p>
  </div>
</a>',
             '就活支援サービス向けの基本的なバナーテンプレート'),

            ('大型就活バナー',
             '<a href="{{link}}" rel="nofollow" style="text-decoration: none; display: block;">
  <div style="position: relative; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px; border-radius: 16px; overflow: hidden; cursor: pointer;">
    <div style="position: relative; z-index: 2;">
      <h1 style="font-size: 32px; font-weight: bold; margin-bottom: 12px;">{{title}}</h1>
      <p style="font-size: 18px; margin-bottom: 20px; opacity: 0.9;">{{text}}</p>
      <div style="margin-bottom: 16px;">
        <span style="background: rgba(255,255,255,0.2); padding: 8px 16px; border-radius: 20px; font-size: 14px; margin-right: 12px;">{{benefit}}</span>
        <span style="background: rgba(255,255,255,0.2); padding: 8px 16px; border-radius: 20px; font-size: 14px;">{{rating}}</span>
      </div>
      <span style="display: inline-block; background: rgba(255,255,255,0.2); padding: 12px 24px; border-radius: 8px; font-weight: bold;">{{button}}</span>
    </div>
    <img src="{{image}}" style="position: absolute; top: 0; right: 0; width: 300px; height: 100%; object-fit: cover; opacity: 0.3;" alt="{{title}}" />
  </div>
</a>',
             '就活サービス向けの大型インパクトバナー'),

            -- テキスト系テンプレート
            ('就活テキスト広告',
             '<a href="{{link}}" rel="nofollow" style="text-decoration: none; display: block;">
  <div class="ad-text" style="border: 2px solid #E5E7EB; padding: 16px; border-radius: 8px; background: #F9FAFB; cursor: pointer; transition: background-color 0.2s;">
    <h3 style="color: #1F2937; font-size: 18px; margin-bottom: 8px;">{{title}}</h3>
    <p style="color: #6B7280; font-size: 14px; line-height: 1.5; margin-bottom: 12px;">{{text}}</p>
    <div style="display: flex; justify-content: space-between; align-items: center;">
      <span style="color: #10B981; font-weight: bold;">{{benefit}}</span>
      <span style="color: #3B82F6; font-size: 12px;">{{service}}</span>
    </div>
  </div>
</a>',
             '就活向けテキストのみの広告'),

            -- カード系テンプレート
            ('就活サービスカード',
             '<a href="{{link}}" rel="nofollow" style="text-decoration: none; display: block;">
  <div class="ad-card" style="border: 1px solid #D1D5DB; border-radius: 12px; overflow: hidden; background: white; box-shadow: 0 4px 6px rgba(0,0,0,0.1); cursor: pointer; transition: transform 0.2s;">
    <img src="{{image}}" style="width: 100%; height: 160px; object-fit: cover;" alt="{{title}}" />
    <div style="padding: 16px;">
      <div style="display: flex; align-items: center; margin-bottom: 8px;">
        <img src="{{image}}" style="width: 24px; height: 24px; margin-right: 8px; border-radius: 4px;" alt="{{service}}" />
        <span style="color: #6B7280; font-size: 12px;">{{service}}</span>
      </div>
      <h3 style="color: #1F2937; font-size: 18px; margin-bottom: 8px;">{{title}}</h3>
      <p style="color: #6B7280; font-size: 14px; line-height: 1.5; margin-bottom: 12px;">{{text}}</p>
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <span style="color: #10B981; font-weight: bold;">{{benefit}}</span>
        <span style="background: #3B82F6; color: white; padding: 4px 12px; border-radius: 12px; font-size: 12px;">{{service}}</span>
      </div>
    </div>
  </div>
</a>',
             '就活サービス向けのカード型広告'),

            -- 記事内テンプレート
            ('記事内就活インライン',
             '<div style="background: #f8f9fa; border-left: 4px solid #007bff; padding: 16px; margin: 20px 0; border-radius: 4px;">
  <p style="color: #6c757d; font-size: 12px; margin-bottom: 8px; text-transform: uppercase;">就活支援</p>
  <a href="{{link}}" rel="nofollow" style="text-decoration: none; color: inherit;">
    <h4 style="color: #212529; font-size: 16px; margin-bottom: 8px;">{{title}}</h4>
    <p style="color: #6c757d; font-size: 14px; line-height: 1.5; margin-bottom: 8px;">{{text}}</p>
    <div style="display: flex; align-items: center; gap: 12px;">
      <span style="color: #28a745; font-weight: bold; font-size: 14px;">{{benefit}}</span>
      <span style="color: #17a2b8; font-size: 12px;">{{service}}</span>
    </div>
  </a>
</div>',
             '記事内に自然に溶け込む就活インライン広告'),

            ('記事内就活カード',
             '<div style="margin: 24px 0; padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 12px; color: white;">
  <p style="font-size: 11px; opacity: 0.8; margin-bottom: 12px; text-transform: uppercase; letter-spacing: 1px;">就活おすすめ</p>
  <a href="{{link}}" rel="nofollow" style="text-decoration: none; color: white;">
    <div style="display: flex; align-items: center; gap: 16px;">
      <img src="{{image}}" style="width: 80px; height: 80px; border-radius: 8px; object-fit: cover;" alt="{{title}}" />
      <div style="flex: 1;">
        <h3 style="font-size: 18px; margin-bottom: 8px;">{{title}}</h3>
        <p style="font-size: 14px; opacity: 0.9; margin-bottom: 8px;">{{text}}</p>
        <div style="display: flex; gap: 8px; margin-bottom: 8px;">
          <span style="font-size: 12px; background: rgba(255,255,255,0.2); padding: 4px 8px; border-radius: 12px;">{{benefit}}</span>
          <span style="font-size: 12px; background: rgba(255,255,255,0.2); padding: 4px 8px; border-radius: 12px;">{{rating}}</span>
        </div>
        <span style="font-size: 12px; background: rgba(255,255,255,0.2); padding: 4px 12px; border-radius: 12px;">{{button}}</span>
      </div>
    </div>
  </a>
</div>',
             '記事内に挿入する就活カード型広告'),

            -- 特殊形状テンプレート
            ('就活リボン型',
             '<div style="position: relative; margin: 20px 0;">
  <a href="{{link}}" rel="nofollow" style="text-decoration: none;">
    <div style="background: #ff6b6b; color: white; padding: 12px 20px; border-radius: 0 8px 8px 0; display: inline-block; cursor: pointer; box-shadow: 0 2px 8px rgba(255,107,107,0.3);">
      <h4 style="font-size: 16px; margin-bottom: 4px;">{{title}}</h4>
      <p style="font-size: 12px; opacity: 0.9; margin-bottom: 4px;">{{text}}</p>
      <span style="font-size: 11px; opacity: 0.8;">{{service}}</span>
    </div>
  </a>
  <div style="position: absolute; left: 0; top: 0; width: 0; height: 0; border-style: solid; border-width: 0 0 20px 20px; border-color: transparent transparent #c92a2a transparent;"></div>
</div>',
             '就活向けリボン型の特殊形状広告'),

            ('就活アイコン広告',
             '<a href="{{link}}" rel="nofollow" style="text-decoration: none; display: block;">
  <div style="display: flex; align-items: center; gap: 16px; padding: 16px; background: white; border: 2px solid #e9ecef; border-radius: 50px; cursor: pointer; transition: all 0.2s;">
    <div style="width: 60px; height: 60px; background: linear-gradient(45deg, #ff9a9e, #fecfef); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 24px;">🚀</div>
    <div style="flex: 1;">
      <h4 style="color: #212529; font-size: 16px; margin-bottom: 4px;">{{title}}</h4>
      <p style="color: #6c757d; font-size: 12px; margin-bottom: 4px;">{{text}}</p>
      <span style="color: #28a745; font-size: 11px; font-weight: bold;">{{benefit}}</span>
    </div>
    <div style="background: #007bff; color: white; padding: 8px 16px; border-radius: 20px; font-size: 12px;">{{button}}</div>
  </div>
</a>',
             '就活向け円形アイコンを使った横長広告');
    `;

    console.log('Seeding url_templates...');

    // Clear existing URL templates and insert new ones
    await sql`DELETE
              FROM url_templates`;

    /* Insert sample URL templates with tracking parameters */
    await sql`
        INSERT INTO url_templates (name, url_template, description)
        VALUES
            -- 記事系広告
            ('記事内広告 (kijinaka)',
             '{{baseUrl}}?utm_source=kijinaka&utm_medium=port-career&utm_content={{utm_content}}',
             '記事内に配置する広告のトラッキングURL'),

            ('記事下広告 (kijisita)',
             '{{baseUrl}}?utm_source=kijisita&utm_medium=port-career&utm_content={{utm_content}}',
             '記事下に配置する広告のトラッキングURL'),

            ('例文内広告 (reibunnaka)',
             '{{baseUrl}}?utm_source=reibunnaka&utm_medium=port-career&utm_content={{utm_content}}',
             '例文内に配置する広告のトラッキングURL'),

            ('記事バナー広告 (kijibanner)',
             '{{baseUrl}}?utm_source=kijibanner&utm_medium=port-career&utm_content={{utm_content}}',
             '記事バナー形式の広告のトラッキングURL'),

            -- Webプッシュ系広告
            ('Webプッシュ スマホ (webpush_sp)',
             '{{baseUrl}}?utm_source=webpush_sp&utm_medium=push&utm_content={{utm_content}}',
             'スマートフォン向けWebプッシュ広告のトラッキングURL'),

            ('Webプッシュ PC位置1 (webpush_pc1)',
             '{{baseUrl}}?utm_source=webpush_pc1&utm_medium=push&utm_content={{utm_content}}',
             'PC向けWebプッシュ広告（位置1）のトラッキングURL'),

            ('Webプッシュ PC位置2 (webpush_pc2)',
             '{{baseUrl}}?utm_source=webpush_pc2&utm_medium=push&utm_content={{utm_content}}',
             'PC向けWebプッシュ広告（位置2）のトラッキングURL'),

            ('Webプッシュ PC位置3 (webpush_pc3)',
             '{{baseUrl}}?utm_source=webpush_pc3&utm_medium=push&utm_content={{utm_content}}',
             'PC向けWebプッシュ広告（位置3）のトラッキングURL'),

            ('Webプッシュ 画像 (webpush_image)',
             '{{baseUrl}}?utm_source=webpush_image&utm_medium=push&utm_content={{utm_content}}',
             '画像付きWebプッシュ広告のトラッキングURL'),

            -- Chameleon系広告
            ('Chameleon広告 (chameleon)',
             '{{baseUrl}}?utm_source=chameleon&utm_medium=port-career&utm_content={{utm_content}}',
             'Chameleon広告のトラッキングURL'),

            ('Chameleon広告2 (chameleon2)',
             '{{baseUrl}}?utm_source=chameleon2&utm_medium=port-career&utm_content={{utm_content}}',
             'Chameleon広告2のトラッキングURL'),

            ('Chameleon下部広告 (chameleonsita)',
             '{{baseUrl}}?utm_source=chameleonsita&utm_medium=port-career&utm_content={{utm_content}}',
             'Chameleon下部広告のトラッキングURL'),

            -- ランキング系広告（特別対応）
            ('ランキング広告 (ranking)',
             '{{baseUrl}}?utm_source=ranking&utm_medium=port-career&utm_campaign={{utm_campaign}}&utm_content={{utm_content}}',
             'ランキング広告のトラッキングURL（キャンペーン付き）');
    `;

    console.log('Seeding ad_contents...');

    // Clear existing ad contents and insert new ones
    await sql`DELETE
              FROM ad_contents`;

    // Get template and URL template IDs
    const adTemplates = await sql`SELECT id, name
                                  FROM ad_templates
                                  ORDER BY id`;
    const urlTemplates = await sql`SELECT id, name
                                   FROM url_templates
                                   ORDER BY id`;
    const users = await sql`SELECT id
                            FROM users
                            ORDER BY id`;

    console.log(`Found ${adTemplates.length} ad templates, ${urlTemplates.length} URL templates, ${users.length} users`);

    // 基本的な広告コンテンツを作成
    if (adTemplates.length >= 3 && urlTemplates.length >= 13 && users.length >= 1) {
      const template1 = adTemplates[0].id; // 就活支援バナー
      const template2 = adTemplates[1].id; // 大型就活バナー  
      const template3 = adTemplates[2].id; // 就活テキスト広告

      // URLテンプレートのID（13種類）
      const url1 = urlTemplates[0].id;   // kijinaka
      const url2 = urlTemplates[1].id;   // kijisita
      const url3 = urlTemplates[2].id;   // reibunnaka
      const url4 = urlTemplates[3].id;   // kijibanner
      const url5 = urlTemplates[4].id;   // webpush_sp
      const url6 = urlTemplates[5].id;   // webpush_pc1
      const url7 = urlTemplates[6].id;   // webpush_pc2
      const url8 = urlTemplates[7].id;   // webpush_pc3
      const url9 = urlTemplates[8].id;   // webpush_image
      const url10 = urlTemplates[9].id;  // chameleon
      const url11 = urlTemplates[10].id; // chameleon2
      const url12 = urlTemplates[11].id; // chameleonsita
      const url13 = urlTemplates[12].id; // ranking

      const user1 = users[0].id;
      const user2 = users.length > 1 ? users[1].id : users[0].id;

      await sql`
          INSERT INTO ad_contents (name, template_id, url_template_id, content_data, status, created_by)
          VALUES ('記事内広告 - 春の就活支援',
                  ${template1},
                  ${url1},
                  '{"title": "2024年春の就活支援キャンペーン開始！", "image": "/images/sample-ad.svg", "link": "https://port-career.jp/career-support/", "button": "今すぐ登録して特典をゲット", "utm_content": "1"}',
                  'active',
                  ${user1}),

                 ('記事下広告 - 転職支援サービス',
                  ${template1},
                  ${url2},
                  '{"title": "経験者向け転職支援サービス", "image": "/images/sample-ad.svg", "link": "https://port-career.jp/job-change/", "button": "無料相談を申し込む", "utm_content": "2"}',
                  'active',
                  ${user1}),

                 ('Webプッシュ - 新卒向け就職支援',
                  ${template2},
                  ${url5},
                  '{"title": "新卒向け就職支援プログラム", "text": "内定率95%の実績を持つ就職支援サービス", "benefit": "完全無料", "rating": "満足度98%", "button": "無料登録はこちら", "image": "/images/sample-ad.svg", "link": "https://port-career.jp/fresh-graduate/", "utm_content": "3"}',
                  'active',
                  ${user1}),

                 ('Chameleon広告 - 転職エージェント',
                  ${template3},
                  ${url10},
                  '{"title": "転職エージェントで理想の職場を見つけよう", "text": "業界最大級の求人数を誇る転職エージェント。あなたにぴったりの企業がきっと見つかります。", "benefit": "登録無料・非公開求人多数", "service": "転職支援", "link": "https://recruit-agent-a.com/register/", "utm_content": "4"}',
                  'active',
                  ${user2}),

                 ('ランキング広告 - スキルアップサービス',
                  ${template3},
                  ${url13},
                  '{"title": "プログラミングスキルを身につけて転職成功", "text": "未経験からエンジニアを目指すあなたを全力サポート。実践的なカリキュラムで確実にスキルアップ。", "benefit": "就職成功率94%", "service": "スキルアップ", "link": "https://skill-up-c.com/courses/", "utm_content": "5", "utm_campaign": "01"}',
                  'active',
                  ${user1}),

                 ('記事内広告 - テスト（下書き）',
                  ${template1},
                  ${url1},
                  '{"title": "テスト広告", "image": "/images/sample-ad.svg", "link": "https://example.com/", "button": "テスト用ボタン", "utm_content": "6"}',
                  'draft',
                  ${user2}),

                 ('Webプッシュ - 一時停止中',
                  ${template2},
                  ${url6},
                  '{"title": "一時停止中の広告", "text": "この広告は現在停止中です", "benefit": "停止中", "rating": "テスト用", "button": "停止中", "image": "/images/sample-ad.svg", "link": "https://example.com/paused/", "utm_content": "7"}',
                  'paused',
                  ${user1}),

                 ('例文内広告 - アーカイブ済み',
                  ${template3},
                  ${url3},
                  '{"title": "過去のキャンペーン", "text": "終了した過去のキャンペーン広告です", "benefit": "終了済み", "service": "アーカイブ", "link": "https://example.com/archived/", "utm_content": "8"}',
                  'archived',
                  ${user2})
      `;

      console.log('Sample ad contents created successfully.');
    } else {
      console.log('Insufficient templates or users to create ad contents.');
    }

    console.log('Database seeded successfully!');
    console.log('Test credentials:');
    console.log('Admin: admin@example.com / password123');
    console.log('Editor: editor@example.com / password123');
    console.log('Sample job-hunting ad templates created.');
    console.log('Sample URL templates with tracking parameters created.');
    console.log('Sample ad contents created with various statuses.');

  } catch (error) {
    console.error('Error seeding database:', error);
  }
}

seed();
