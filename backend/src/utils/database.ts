import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

// Use SQLite for development if PostgreSQL is not available
const useSQLite = process.env.USE_SQLITE === 'true' || !process.env.DB_HOST;

let pool: any;

if (useSQLite) {
  // Import SQLite database
  const { initializeDatabase: initSQLite, query: sqliteQuery } = require('./sqlite');
  pool = {
    connect: () => Promise.resolve({
      query: sqliteQuery,
      release: () => Promise.resolve()
    }),
    query: sqliteQuery
  };
  
  // Initialize SQLite database
  initSQLite().catch(console.error);
} else {
  // Use PostgreSQL
  pool = new Pool({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'collegecodehub',
    password: process.env.DB_PASSWORD || 'password',
    port: parseInt(process.env.DB_PORT || '5432'),
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  });
}

export default pool;

// Database initialization
export const initializeDatabase = async () => {
  try {
    if (useSQLite) {
      console.log('✅ SQLite database connected successfully');
      // SQLite tables are created in the sqlite.ts file
      return;
    }
    
    // Test PostgreSQL connection
    const client = await pool.connect();
    console.log('✅ PostgreSQL database connected successfully');
    client.release();

    // Create tables if they don't exist
    await createTables();
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    console.log('💡 For development, you can:');
    console.log('   1. Install PostgreSQL locally');
    console.log('   2. Use Docker: docker run --name postgres-dev -e POSTGRES_PASSWORD=password -e POSTGRES_DB=collegecodehub -p 5432:5432 -d postgres:15');
    console.log('   3. Use a cloud database like Supabase');
    console.log('🔄 Continuing without database for now...');
    // Don't exit - allow the app to run for frontend development
    // process.exit(1);
  }
};

const createTables = async () => {
  const client = await pool.connect();
  
  try {
    // Colleges table
    await client.query(`
      CREATE TABLE IF NOT EXISTS colleges (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) UNIQUE NOT NULL,
        domain VARCHAR(255),
        city VARCHAR(100),
        state VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Users table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255),
        username VARCHAR(50) UNIQUE,
        role VARCHAR(20) NOT NULL CHECK (role IN ('student', 'admin', 'super-admin')),
        prn VARCHAR(50) UNIQUE,
        batch VARCHAR(20),
        department VARCHAR(100),
        college_id UUID REFERENCES colleges(id),
        year_of_study INTEGER,
        bio TEXT,
        avatar_url TEXT,
        github_link TEXT,
        linkedin_url TEXT,
        resume_link TEXT,
        portfolio_link TEXT,
        privacy_settings JSONB DEFAULT '{"show_email": false, "show_github": true, "show_linkedin": true, "show_bio": true, "show_resume": false, "show_portfolio": true}',
        verified BOOLEAN DEFAULT false,
        linkedin_id VARCHAR(255) UNIQUE,
        approval_status VARCHAR(20) DEFAULT 'pending' CHECK (approval_status IN ('pending', 'approved', 'rejected')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Problems table
    await client.query(`
      CREATE TABLE IF NOT EXISTS problems (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        title VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        difficulty VARCHAR(10) NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
        topic VARCHAR(100) NOT NULL,
        test_cases JSONB NOT NULL,
        examples JSONB NOT NULL,
        constraints TEXT[] NOT NULL,
        created_by UUID NOT NULL REFERENCES users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Submissions table
    await client.query(`
      CREATE TABLE IF NOT EXISTS submissions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id),
        problem_id UUID NOT NULL REFERENCES problems(id),
        code TEXT NOT NULL,
        language VARCHAR(10) NOT NULL CHECK (language IN ('python', 'java', 'cpp', 'c')),
        status VARCHAR(30) NOT NULL CHECK (status IN ('pending', 'accepted', 'wrong_answer', 'time_limit_exceeded', 'runtime_error', 'compilation_error')),
        runtime INTEGER,
        memory INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Leaderboard table
    await client.query(`
      CREATE TABLE IF NOT EXISTS leaderboard (
        user_id UUID PRIMARY KEY REFERENCES users(id),
        total_solved INTEGER DEFAULT 0,
        rank INTEGER DEFAULT 0,
        last_submission_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Badges table
    await client.query(`
      CREATE TABLE IF NOT EXISTS badges (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(100) NOT NULL,
        description TEXT NOT NULL,
        criteria TEXT NOT NULL,
        icon VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // User badges table
    await client.query(`
      CREATE TABLE IF NOT EXISTS user_badges (
        user_id UUID NOT NULL REFERENCES users(id),
        badge_id UUID NOT NULL REFERENCES badges(id),
        earned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (user_id, badge_id)
      )
    `);

    // Create indexes for better performance
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_submissions_user_id ON submissions(user_id);
      CREATE INDEX IF NOT EXISTS idx_submissions_problem_id ON submissions(problem_id);
      CREATE INDEX IF NOT EXISTS idx_submissions_status ON submissions(status);
      CREATE INDEX IF NOT EXISTS idx_problems_difficulty ON problems(difficulty);
      CREATE INDEX IF NOT EXISTS idx_problems_topic ON problems(topic);
      CREATE INDEX IF NOT EXISTS idx_leaderboard_rank ON leaderboard(rank);
    `);

    console.log('✅ Database tables created successfully');
  } catch (error) {
    console.error('❌ Error creating tables:', error);
    throw error;
  } finally {
    client.release();
  }
};
