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

    // Add role column if it doesn't exist (for existing installations)
    await sql`
      ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'editor' NOT NULL;
    `;

    // Add updated_at column if it doesn't exist
    await sql`
      ALTER TABLE users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW();
    `;

    // Create index on role column
    await sql`
      CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
    `;

    console.log('Seeding users...');

    // Hash passwords
    const adminPassword = await bcrypt.hash('password123', 10);
    const editorPassword = await bcrypt.hash('password123', 10);

    // Insert test users
    await sql`
      INSERT INTO users (name, email, password, role)
      VALUES 
        ('管理者', 'admin@example.com', ${adminPassword}, 'admin'),
        ('編集者', 'editor@example.com', ${editorPassword}, 'editor')
      ON CONFLICT (email) DO UPDATE SET
        role = EXCLUDED.role,
        password = EXCLUDED.password;
    `;

    console.log('Database seeded successfully!');
    console.log('Test credentials:');
    console.log('Admin: admin@example.com / password123');
    console.log('Editor: editor@example.com / password123');

  } catch (error) {
    console.error('Error seeding database:', error);
  }
}

seed();
