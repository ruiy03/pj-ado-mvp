const { neon } = require('@neondatabase/serverless');
const bcrypt = require('bcrypt');
require('dotenv').config();

const sql = neon(process.env.DATABASE_URL);

async function seed() {
  try {
    console.log('Creating users table...');
    
    // Create users table
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `;

    console.log('Seeding test user...');
    
    // Hash password
    const hashedPassword = await bcrypt.hash('123456', 10);
    
    // Insert test user
    await sql`
      INSERT INTO users (name, email, password)
      VALUES ('テストユーザー', 'test@example.com', ${hashedPassword})
      ON CONFLICT (email) DO NOTHING;
    `;

    console.log('Database seeded successfully!');
    console.log('Test credentials:');
    console.log('Email: test@example.com');
    console.log('Password: 123456');
    
  } catch (error) {
    console.error('Error seeding database:', error);
  }
}

seed();
