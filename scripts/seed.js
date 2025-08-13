const {neon} = require('@neondatabase/serverless');
const bcrypt = require('bcrypt');
require('dotenv').config();

const sql = neon(process.env.DATABASE_URL);

async function seed() {
  try {
    console.log('Creating users table...');

    // Create users table with role column
    await sql`
        CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            email VARCHAR(255) UNIQUE NOT NULL,
            password VARCHAR(255) NOT NULL,
            role VARCHAR(20) DEFAULT 'editor' NOT NULL,
            created_at TIMESTAMP DEFAULT NOW(),
            updated_at TIMESTAMP DEFAULT NOW()
        );
    `;

    // Create index on role column
    await sql`
        CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
    `;

    console.log('Creating ad_templates table...');

    // Create ad_templates table
    await sql`
        CREATE TABLE IF NOT EXISTS ad_templates (
            id SERIAL PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            html TEXT NOT NULL,
            placeholders JSON,
            description TEXT,
            created_at TIMESTAMP DEFAULT NOW(),
            updated_at TIMESTAMP DEFAULT NOW()
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

    // Insert sample ad templates
    await sql`
        INSERT INTO ad_templates (name, html, placeholders, description)
        VALUES ('バナー基本',
                '<div class="ad-banner" style="background: linear-gradient(90deg, #3B82F6, #8B5CF6); color: white; padding: 20px; border-radius: 8px; text-align: center;"><h2 style="font-size: 24px; margin-bottom: 16px;">{{title}}</h2><img src="{{imageUrl}}" style="width: 100%; height: 200px; object-fit: cover; border-radius: 4px; margin-bottom: 16px;" alt="{{title}}" /><p style="font-size: 14px; opacity: 0.9;">クリックして詳細を見る</p></div>',
                '["title", "imageUrl", "linkUrl"]', '基本的なバナーテンプレート'),
               ('テキスト広告',
                '<div class="ad-text" style="border: 2px solid #E5E7EB; padding: 16px; border-radius: 8px; background: #F9FAFB;"><h3 style="color: #1F2937; font-size: 18px; margin-bottom: 8px;">{{title}}</h3><p style="color: #6B7280; font-size: 14px; line-height: 1.5;">{{description}}</p></div>',
                '["title", "description"]', 'テキストのみの広告'),
               ('カード型広告',
                '<div class="ad-card" style="border: 1px solid #D1D5DB; border-radius: 12px; overflow: hidden; background: white; box-shadow: 0 4px 6px rgba(0,0,0,0.1);"><img src="{{imageUrl}}" style="width: 100%; height: 160px; object-fit: cover;" alt="{{title}}" /><div style="padding: 16px;"><h3 style="color: #1F2937; font-size: 18px; margin-bottom: 8px;">{{title}}</h3><p style="color: #6B7280; font-size: 14px; line-height: 1.5;">{{description}}</p></div></div>',
                '["title", "description", "imageUrl", "linkUrl"]', 'カード形式の広告');
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
