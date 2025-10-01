import sqlite3 from 'sqlite3';
import { promisify } from 'util';

const db = new sqlite3.Database('./database.sqlite');

// Promisify database methods
const dbRun = promisify(db.run.bind(db));
const dbGet = promisify(db.get.bind(db));
const dbAll = promisify(db.all.bind(db));

export default db;

// Database initialization
export const initializeDatabase = async () => {
  try {
    console.log('✅ SQLite database connected successfully');
    
    // Create tables if they don't exist
    await createTables();
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    throw error;
  }
};

const createTables = async () => {
  try {
    // Colleges table
    await dbRun(`
      CREATE TABLE IF NOT EXISTS colleges (
        id TEXT PRIMARY KEY,
        name TEXT UNIQUE NOT NULL,
        domain TEXT,
        city TEXT,
        state TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Users table
    await dbRun(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT,
        username TEXT UNIQUE,
        role TEXT NOT NULL CHECK (role IN ('student', 'admin', 'super-admin')),
        prn TEXT UNIQUE,
        batch TEXT,
        department TEXT,
        college_id TEXT,
        year_of_study INTEGER,
        bio TEXT,
        avatar_url TEXT,
        github_link TEXT,
        linkedin_url TEXT,
        resume_link TEXT,
        portfolio_link TEXT,
        privacy_settings TEXT DEFAULT '{"show_email": false, "show_github": true, "show_linkedin": true, "show_bio": true, "show_resume": false, "show_portfolio": true}',
        verified INTEGER DEFAULT 0,
        linkedin_id TEXT UNIQUE,
        approval_status TEXT DEFAULT 'pending' CHECK (approval_status IN ('pending', 'approved', 'rejected')),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (college_id) REFERENCES colleges(id)
      )
    `);

    // Problems table
    await dbRun(`
      CREATE TABLE IF NOT EXISTS problems (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        difficulty TEXT NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
        topic TEXT NOT NULL,
        test_cases TEXT NOT NULL,
        examples TEXT NOT NULL,
        constraints TEXT NOT NULL,
        created_by TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (created_by) REFERENCES users(id)
      )
    `);

    // Submissions table
    await dbRun(`
      CREATE TABLE IF NOT EXISTS submissions (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        problem_id TEXT NOT NULL,
        code TEXT NOT NULL,
        language TEXT NOT NULL CHECK (language IN ('python', 'java', 'cpp', 'c')),
        status TEXT NOT NULL CHECK (status IN ('pending', 'accepted', 'wrong_answer', 'time_limit_exceeded', 'runtime_error', 'compilation_error')),
        runtime INTEGER,
        memory INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (problem_id) REFERENCES problems(id)
      )
    `);

    // Leaderboard table
    await dbRun(`
      CREATE TABLE IF NOT EXISTS leaderboard (
        user_id TEXT PRIMARY KEY,
        total_solved INTEGER DEFAULT 0,
        rank INTEGER DEFAULT 0,
        last_submission_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);

    // Badges table
    await dbRun(`
      CREATE TABLE IF NOT EXISTS badges (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT NOT NULL,
        criteria TEXT NOT NULL,
        icon TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // User badges table
    await dbRun(`
      CREATE TABLE IF NOT EXISTS user_badges (
        user_id TEXT NOT NULL,
        badge_id TEXT NOT NULL,
        earned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (user_id, badge_id),
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (badge_id) REFERENCES badges(id)
      )
    `);

    // Create indexes for better performance
    await dbRun(`CREATE INDEX IF NOT EXISTS idx_submissions_user_id ON submissions(user_id)`);
    await dbRun(`CREATE INDEX IF NOT EXISTS idx_submissions_problem_id ON submissions(problem_id)`);
    await dbRun(`CREATE INDEX IF NOT EXISTS idx_submissions_status ON submissions(status)`);
    await dbRun(`CREATE INDEX IF NOT EXISTS idx_problems_difficulty ON problems(difficulty)`);
    await dbRun(`CREATE INDEX IF NOT EXISTS idx_problems_topic ON problems(topic)`);
    await dbRun(`CREATE INDEX IF NOT EXISTS idx_leaderboard_rank ON leaderboard(rank)`);

    console.log('✅ Database tables created successfully');
  } catch (error) {
    console.error('❌ Error creating tables:', error);
    throw error;
  }
};

// Helper functions for database operations
export const dbOperations = {
  run: dbRun,
  get: dbGet,
  all: dbAll,
};

// Wrapper to match PostgreSQL interface
export const query = async (text: string, params: any[] = []) => {
  try {
    if (text.includes('SELECT') || text.includes('select')) {
      const result = await dbAll(text);
      return { rows: result };
    } else {
      const result = await dbRun(text);
      return { rows: [], rowCount: (result as any).changes || 0 };
    }
  } catch (error) {
    console.error('SQLite query error:', error);
    throw error;
  }
};
