const {neon} = require('@neondatabase/serverless');
const bcrypt = require('bcrypt');
require('dotenv').config();

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
            placeholders JSON,
            description TEXT,
            created_at TIMESTAMP DEFAULT NOW
        (
        ),
            updated_at TIMESTAMP DEFAULT NOW
        (
        )
            );
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

    // Insert sample ad templates with nofollow and more variety
    await sql`
        INSERT INTO ad_templates (name, html, placeholders, description)
        VALUES
            -- バナー系テンプレート
            ('バナー基本',
             '<a href="{{linkUrl}}" rel="nofollow" style="text-decoration: none; display: block;"><div class="ad-banner" style="background: linear-gradient(90deg, #3B82F6, #8B5CF6); color: white; padding: 20px; border-radius: 8px; text-align: center; cursor: pointer; transition: transform 0.2s;"><h2 style="font-size: 24px; margin-bottom: 16px;">{{title}}</h2><img src="{{imageUrl}}" style="width: 100%; height: 200px; object-fit: cover; border-radius: 4px; margin-bottom: 16px;" alt="{{title}}" /><p style="font-size: 14px; opacity: 0.9;">クリックして詳細を見る</p></div></a>',
             '["title", "imageUrl", "linkUrl"]', '基本的なバナーテンプレート'),

            ('大型バナー',
             '<a href="{{linkUrl}}" rel="nofollow" style="text-decoration: none; display: block;"><div style="position: relative; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px; border-radius: 16px; overflow: hidden; cursor: pointer;"><div style="position: relative; z-index: 2;"><h1 style="font-size: 32px; font-weight: bold; margin-bottom: 12px;">{{title}}</h1><p style="font-size: 18px; margin-bottom: 20px; opacity: 0.9;">{{description}}</p><span style="display: inline-block; background: rgba(255,255,255,0.2); padding: 12px 24px; border-radius: 8px; font-weight: bold;">{{buttonText}}</span></div><img src="{{imageUrl}}" style="position: absolute; top: 0; right: 0; width: 300px; height: 100%; object-fit: cover; opacity: 0.3;" alt="{{title}}" /></div></a>',
             '["title", "description", "buttonText", "imageUrl", "linkUrl"]', '大型のインパクトのあるバナー'),

            ('コンパクトバナー',
             '<a href="{{linkUrl}}" rel="nofollow" style="text-decoration: none; display: block;"><div style="display: flex; align-items: center; background: #f8f9fa; border: 1px solid #e9ecef; border-radius: 8px; padding: 12px; cursor: pointer; transition: all 0.2s;"><img src="{{imageUrl}}" style="width: 60px; height: 60px; border-radius: 8px; object-fit: cover; margin-right: 12px;" alt="{{title}}" /><div style="flex: 1;"><h4 style="color: #212529; font-size: 16px; margin-bottom: 4px;">{{title}}</h4><p style="color: #6c757d; font-size: 12px; margin: 0;">{{description}}</p></div></div></a>',
             '["title", "description", "imageUrl", "linkUrl"]', '小さなスペースに適したコンパクトバナー'),

            -- テキスト系テンプレート
            ('テキスト広告',
             '<a href="{{linkUrl}}" rel="nofollow" style="text-decoration: none; display: block;"><div class="ad-text" style="border: 2px solid #E5E7EB; padding: 16px; border-radius: 8px; background: #F9FAFB; cursor: pointer; transition: background-color 0.2s;"><h3 style="color: #1F2937; font-size: 18px; margin-bottom: 8px;">{{title}}</h3><p style="color: #6B7280; font-size: 14px; line-height: 1.5;">{{description}}</p></div></a>',
             '["title", "description", "linkUrl"]', 'テキストのみの広告'),

            ('プレミアムテキスト広告',
             '<a href="{{linkUrl}}" rel="nofollow" style="text-decoration: none; display: block;"><div style="background: linear-gradient(45deg, #ff6b6b, #ee5a24); color: white; padding: 20px; border-radius: 12px; cursor: pointer; box-shadow: 0 8px 16px rgba(255,107,107,0.3);"><div style="display: flex; justify-content: space-between; align-items: center;"><div><h3 style="font-size: 20px; font-weight: bold; margin-bottom: 8px;">{{title}}</h3><p style="font-size: 14px; opacity: 0.9; margin-bottom: 12px;">{{description}}</p><span style="background: rgba(255,255,255,0.2); padding: 8px 16px; border-radius: 20px; font-size: 12px; font-weight: bold;">{{buttonText}}</span></div><div style="font-size: 24px;">{{icon}}</div></div></div></a>',
             '["title", "description", "buttonText", "icon", "linkUrl"]', '目立つプレミアムテキスト広告'),

            -- カード系テンプレート
            ('カード型広告',
             '<a href="{{linkUrl}}" rel="nofollow" style="text-decoration: none; display: block;"><div class="ad-card" style="border: 1px solid #D1D5DB; border-radius: 12px; overflow: hidden; background: white; box-shadow: 0 4px 6px rgba(0,0,0,0.1); cursor: pointer; transition: transform 0.2s;"><img src="{{imageUrl}}" style="width: 100%; height: 160px; object-fit: cover;" alt="{{title}}" /><div style="padding: 16px;"><h3 style="color: #1F2937; font-size: 18px; margin-bottom: 8px;">{{title}}</h3><p style="color: #6B7280; font-size: 14px; line-height: 1.5;">{{description}}</p></div></div></a>',
             '["title", "description", "imageUrl", "linkUrl"]', 'カード形式の広告'),

            ('商品カード',
             '<a href="{{linkUrl}}" rel="nofollow" style="text-decoration: none; display: block;"><div style="border: 1px solid #e9ecef; border-radius: 12px; overflow: hidden; background: white; box-shadow: 0 2px 8px rgba(0,0,0,0.1); cursor: pointer; transition: all 0.2s;"><img src="{{imageUrl}}" style="width: 100%; height: 200px; object-fit: cover;" alt="{{title}}" /><div style="padding: 16px;"><h3 style="color: #212529; font-size: 18px; margin-bottom: 8px;">{{title}}</h3><p style="color: #6c757d; font-size: 14px; margin-bottom: 12px;">{{description}}</p><div style="display: flex; justify-content: space-between; align-items: center;"><span style="color: #dc3545; font-size: 20px; font-weight: bold;">{{price}}</span><span style="background: #007bff; color: white; padding: 8px 16px; border-radius: 20px; font-size: 12px;">{{buttonText}}</span></div></div></div></a>',
             '["title", "description", "price", "buttonText", "imageUrl", "linkUrl"]', 'EC商品用のカード広告'),

            -- サイドバー系テンプレート
            ('サイドバー縦長',
             '<a href="{{linkUrl}}" rel="nofollow" style="text-decoration: none; display: block;"><div style="width: 160px; background: linear-gradient(180deg, #4CAF50, #45a049); color: white; border-radius: 8px; overflow: hidden; cursor: pointer;"><img src="{{imageUrl}}" style="width: 100%; height: 120px; object-fit: cover;" alt="{{title}}" /><div style="padding: 12px; text-align: center;"><h4 style="font-size: 14px; margin-bottom: 8px;">{{title}}</h4><p style="font-size: 11px; opacity: 0.9; margin-bottom: 8px;">{{description}}</p><span style="font-size: 10px; background: rgba(255,255,255,0.2); padding: 4px 8px; border-radius: 4px;">{{buttonText}}</span></div></div></a>',
             '["title", "description", "buttonText", "imageUrl", "linkUrl"]', 'サイドバー用の縦長広告'),

            ('サイドバースクエア',
             '<a href="{{linkUrl}}" rel="nofollow" style="text-decoration: none; display: block;"><div style="width: 200px; height: 200px; background: #ff6b35; color: white; display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center; border-radius: 12px; cursor: pointer; position: relative; overflow: hidden;"><div style="position: relative; z-index: 2;"><h3 style="font-size: 18px; font-weight: bold; margin-bottom: 8px;">{{title}}</h3><p style="font-size: 12px; margin-bottom: 12px;">{{description}}</p><span style="background: rgba(255,255,255,0.2); padding: 6px 12px; border-radius: 16px; font-size: 11px;">{{buttonText}}</span></div><div style="position: absolute; top: -20px; right: -20px; width: 80px; height: 80px; background: rgba(255,255,255,0.1); border-radius: 50%;"></div></div></a>',
             '["title", "description", "buttonText", "linkUrl"]', 'サイドバー用のスクエア広告'),

            -- 記事内テンプレート
            ('記事内インライン',
             '<div style="background: #f8f9fa; border-left: 4px solid #007bff; padding: 16px; margin: 20px 0; border-radius: 4px;"><p style="color: #6c757d; font-size: 12px; margin-bottom: 8px; text-transform: uppercase;">スポンサード</p><a href="{{linkUrl}}" rel="nofollow" style="text-decoration: none; color: inherit;"><h4 style="color: #212529; font-size: 16px; margin-bottom: 8px;">{{title}}</h4><p style="color: #6c757d; font-size: 14px; line-height: 1.5;">{{description}}</p></a></div>',
             '["title", "description", "linkUrl"]', '記事内に自然に溶け込むインライン広告'),

            ('記事内カード',
             '<div style="margin: 24px 0; padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 12px; color: white;"><p style="font-size: 11px; opacity: 0.8; margin-bottom: 12px; text-transform: uppercase; letter-spacing: 1px;">おすすめ</p><a href="{{linkUrl}}" rel="nofollow" style="text-decoration: none; color: white;"><div style="display: flex; align-items: center; gap: 16px;"><img src="{{imageUrl}}" style="width: 80px; height: 80px; border-radius: 8px; object-fit: cover;" alt="{{title}}" /><div style="flex: 1;"><h3 style="font-size: 18px; margin-bottom: 8px;">{{title}}</h3><p style="font-size: 14px; opacity: 0.9; margin-bottom: 8px;">{{description}}</p><span style="font-size: 12px; background: rgba(255,255,255,0.2); padding: 4px 12px; border-radius: 12px;">{{buttonText}}</span></div></div></a></div>',
             '["title", "description", "buttonText", "imageUrl", "linkUrl"]', '記事内に挿入するカード型広告'),

            -- 特殊形状テンプレート
            ('リボン型',
             '<div style="position: relative; margin: 20px 0;"><a href="{{linkUrl}}" rel="nofollow" style="text-decoration: none;"><div style="background: #ff6b6b; color: white; padding: 12px 20px; border-radius: 0 8px 8px 0; display: inline-block; cursor: pointer; box-shadow: 0 2px 8px rgba(255,107,107,0.3);"><h4 style="font-size: 16px; margin-bottom: 4px;">{{title}}</h4><p style="font-size: 12px; opacity: 0.9;">{{description}}</p></div></a><div style="position: absolute; left: 0; top: 0; width: 0; height: 0; border-style: solid; border-width: 0 0 20px 20px; border-color: transparent transparent #c92a2a transparent;"></div></div>',
             '["title", "description", "linkUrl"]', 'リボンのような特殊形状の広告'),

            ('円形アイコン広告',
             '<a href="{{linkUrl}}" rel="nofollow" style="text-decoration: none; display: block;"><div style="display: flex; align-items: center; gap: 16px; padding: 16px; background: white; border: 2px solid #e9ecef; border-radius: 50px; cursor: pointer; transition: all 0.2s;"><div style="width: 60px; height: 60px; background: linear-gradient(45deg, #ff9a9e, #fecfef); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 24px;">{{icon}}</div><div style="flex: 1;"><h4 style="color: #212529; font-size: 16px; margin-bottom: 4px;">{{title}}</h4><p style="color: #6c757d; font-size: 12px;">{{description}}</p></div><div style="background: #007bff; color: white; padding: 8px 16px; border-radius: 20px; font-size: 12px;">{{buttonText}}</div></div></a>',
             '["title", "description", "buttonText", "icon", "linkUrl"]', '円形アイコンを使った横長広告');
    `;

    console.log('Database seeded successfully!');
    console.log('Test credentials:');
    console.log('Admin: admin@example.com / password123');
    console.log('Editor: editor@example.com / password123');
    console.log('Sample ad templates created.');

  } catch (error) {
    console.error('Error seeding database:', error);
  }
}

seed();
