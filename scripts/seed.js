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
    await sql`DELETE FROM ad_templates`;

    // Insert sample ad templates for job-hunting services
    await sql`
        INSERT INTO ad_templates (name, html, placeholders, description)
        VALUES
            -- バナー系テンプレート
            ('就活支援バナー',
             '<a href="{{linkUrl}}" rel="nofollow" style="text-decoration: none; display: block;">
  <div class="ad-banner" style="background: linear-gradient(90deg, #3B82F6, #8B5CF6); color: white; padding: 20px; border-radius: 8px; text-align: center; cursor: pointer; transition: transform 0.2s;">
    <h2 style="font-size: 24px; margin-bottom: 16px;">{{title}}</h2>
    <img src="{{imageUrl}}" style="width: 100%; height: 200px; object-fit: cover; border-radius: 4px; margin-bottom: 16px;" alt="{{title}}" />
    <p style="font-size: 14px; opacity: 0.9;">{{buttonText}}</p>
  </div>
</a>',
             '["title", "imageUrl", "linkUrl", "buttonText"]', 
             '就活支援サービス向けの基本的なバナーテンプレート'),

            ('大型就活バナー',
             '<a href="{{linkUrl}}" rel="nofollow" style="text-decoration: none; display: block;">
  <div style="position: relative; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px; border-radius: 16px; overflow: hidden; cursor: pointer;">
    <div style="position: relative; z-index: 2;">
      <h1 style="font-size: 32px; font-weight: bold; margin-bottom: 12px;">{{title}}</h1>
      <p style="font-size: 18px; margin-bottom: 20px; opacity: 0.9;">{{description}}</p>
      <div style="margin-bottom: 16px;">
        <span style="background: rgba(255,255,255,0.2); padding: 8px 16px; border-radius: 20px; font-size: 14px; margin-right: 12px;">{{feature}}</span>
        <span style="background: rgba(255,255,255,0.2); padding: 8px 16px; border-radius: 20px; font-size: 14px;">{{rating}}</span>
      </div>
      <span style="display: inline-block; background: rgba(255,255,255,0.2); padding: 12px 24px; border-radius: 8px; font-weight: bold;">{{buttonText}}</span>
    </div>
    <img src="{{imageUrl}}" style="position: absolute; top: 0; right: 0; width: 300px; height: 100%; object-fit: cover; opacity: 0.3;" alt="{{title}}" />
  </div>
</a>',
             '["title", "description", "feature", "rating", "buttonText", "imageUrl", "linkUrl"]', 
             '就活サービス向けの大型インパクトバナー'),

            -- テキスト系テンプレート
            ('就活テキスト広告',
             '<a href="{{linkUrl}}" rel="nofollow" style="text-decoration: none; display: block;">
  <div class="ad-text" style="border: 2px solid #E5E7EB; padding: 16px; border-radius: 8px; background: #F9FAFB; cursor: pointer; transition: background-color 0.2s;">
    <h3 style="color: #1F2937; font-size: 18px; margin-bottom: 8px;">{{title}}</h3>
    <p style="color: #6B7280; font-size: 14px; line-height: 1.5; margin-bottom: 12px;">{{description}}</p>
    <div style="display: flex; justify-content: space-between; align-items: center;">
      <span style="color: #10B981; font-weight: bold;">{{benefit}}</span>
      <span style="color: #3B82F6; font-size: 12px;">{{category}}</span>
    </div>
  </div>
</a>',
             '["title", "description", "benefit", "category", "linkUrl"]', 
             '就活向けテキストのみの広告'),

            -- カード系テンプレート
            ('就活サービスカード',
             '<a href="{{linkUrl}}" rel="nofollow" style="text-decoration: none; display: block;">
  <div class="ad-card" style="border: 1px solid #D1D5DB; border-radius: 12px; overflow: hidden; background: white; box-shadow: 0 4px 6px rgba(0,0,0,0.1); cursor: pointer; transition: transform 0.2s;">
    <img src="{{imageUrl}}" style="width: 100%; height: 160px; object-fit: cover;" alt="{{title}}" />
    <div style="padding: 16px;">
      <div style="display: flex; align-items: center; margin-bottom: 8px;">
        <img src="{{logoUrl}}" style="width: 24px; height: 24px; margin-right: 8px; border-radius: 4px;" alt="{{serviceName}}" />
        <span style="color: #6B7280; font-size: 12px;">{{serviceName}}</span>
      </div>
      <h3 style="color: #1F2937; font-size: 18px; margin-bottom: 8px;">{{title}}</h3>
      <p style="color: #6B7280; font-size: 14px; line-height: 1.5; margin-bottom: 12px;">{{description}}</p>
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <span style="color: #10B981; font-weight: bold;">{{offer}}</span>
        <span style="background: #3B82F6; color: white; padding: 4px 12px; border-radius: 12px; font-size: 12px;">{{category}}</span>
      </div>
    </div>
  </div>
</a>',
             '["title", "description", "serviceName", "logoUrl", "imageUrl", "offer", "category", "linkUrl"]', 
             '就活サービス向けのカード型広告'),

            -- 記事内テンプレート
            ('記事内就活インライン',
             '<div style="background: #f8f9fa; border-left: 4px solid #007bff; padding: 16px; margin: 20px 0; border-radius: 4px;">
  <p style="color: #6c757d; font-size: 12px; margin-bottom: 8px; text-transform: uppercase;">就活支援</p>
  <a href="{{linkUrl}}" rel="nofollow" style="text-decoration: none; color: inherit;">
    <h4 style="color: #212529; font-size: 16px; margin-bottom: 8px;">{{title}}</h4>
    <p style="color: #6c757d; font-size: 14px; line-height: 1.5; margin-bottom: 8px;">{{description}}</p>
    <div style="display: flex; align-items: center; gap: 12px;">
      <span style="color: #28a745; font-weight: bold; font-size: 14px;">{{benefit}}</span>
      <span style="color: #17a2b8; font-size: 12px;">{{industry}}</span>
    </div>
  </a>
</div>',
             '["title", "description", "benefit", "industry", "linkUrl"]', 
             '記事内に自然に溶け込む就活インライン広告'),

            ('記事内就活カード',
             '<div style="margin: 24px 0; padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 12px; color: white;">
  <p style="font-size: 11px; opacity: 0.8; margin-bottom: 12px; text-transform: uppercase; letter-spacing: 1px;">就活おすすめ</p>
  <a href="{{linkUrl}}" rel="nofollow" style="text-decoration: none; color: white;">
    <div style="display: flex; align-items: center; gap: 16px;">
      <img src="{{imageUrl}}" style="width: 80px; height: 80px; border-radius: 8px; object-fit: cover;" alt="{{title}}" />
      <div style="flex: 1;">
        <h3 style="font-size: 18px; margin-bottom: 8px;">{{title}}</h3>
        <p style="font-size: 14px; opacity: 0.9; margin-bottom: 8px;">{{description}}</p>
        <div style="display: flex; gap: 8px; margin-bottom: 8px;">
          <span style="font-size: 12px; background: rgba(255,255,255,0.2); padding: 4px 8px; border-radius: 12px;">{{benefit}}</span>
          <span style="font-size: 12px; background: rgba(255,255,255,0.2); padding: 4px 8px; border-radius: 12px;">{{rating}}</span>
        </div>
        <span style="font-size: 12px; background: rgba(255,255,255,0.2); padding: 4px 12px; border-radius: 12px;">{{buttonText}}</span>
      </div>
    </div>
  </a>
</div>',
             '["title", "description", "benefit", "rating", "buttonText", "imageUrl", "linkUrl"]', 
             '記事内に挿入する就活カード型広告'),

            -- 特殊形状テンプレート
            ('就活リボン型',
             '<div style="position: relative; margin: 20px 0;">
  <a href="{{linkUrl}}" rel="nofollow" style="text-decoration: none;">
    <div style="background: #ff6b6b; color: white; padding: 12px 20px; border-radius: 0 8px 8px 0; display: inline-block; cursor: pointer; box-shadow: 0 2px 8px rgba(255,107,107,0.3);">
      <h4 style="font-size: 16px; margin-bottom: 4px;">{{title}}</h4>
      <p style="font-size: 12px; opacity: 0.9; margin-bottom: 4px;">{{description}}</p>
      <span style="font-size: 11px; opacity: 0.8;">{{category}}</span>
    </div>
  </a>
  <div style="position: absolute; left: 0; top: 0; width: 0; height: 0; border-style: solid; border-width: 0 0 20px 20px; border-color: transparent transparent #c92a2a transparent;"></div>
</div>',
             '["title", "description", "category", "linkUrl"]', 
             '就活向けリボン型の特殊形状広告'),

            ('就活アイコン広告',
             '<a href="{{linkUrl}}" rel="nofollow" style="text-decoration: none; display: block;">
  <div style="display: flex; align-items: center; gap: 16px; padding: 16px; background: white; border: 2px solid #e9ecef; border-radius: 50px; cursor: pointer; transition: all 0.2s;">
    <div style="width: 60px; height: 60px; background: linear-gradient(45deg, #ff9a9e, #fecfef); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 24px;">{{icon}}</div>
    <div style="flex: 1;">
      <h4 style="color: #212529; font-size: 16px; margin-bottom: 4px;">{{title}}</h4>
      <p style="color: #6c757d; font-size: 12px; margin-bottom: 4px;">{{description}}</p>
      <span style="color: #28a745; font-size: 11px; font-weight: bold;">{{benefit}}</span>
    </div>
    <div style="background: #007bff; color: white; padding: 8px 16px; border-radius: 20px; font-size: 12px;">{{buttonText}}</div>
  </div>
</a>',
             '["title", "description", "benefit", "buttonText", "icon", "linkUrl"]', 
             '就活向け円形アイコンを使った横長広告');
    `;

    console.log('Database seeded successfully!');
    console.log('Test credentials:');
    console.log('Admin: admin@example.com / password123');
    console.log('Editor: editor@example.com / password123');
    console.log('Sample job-hunting ad templates created.');

  } catch (error) {
    console.error('Error seeding database:', error);
  }
}

seed();
