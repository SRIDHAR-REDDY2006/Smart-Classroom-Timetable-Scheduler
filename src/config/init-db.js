import 'dotenv/config';
import pool from './database.js';

const schema = `
-- Users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(80) UNIQUE NOT NULL,
  email VARCHAR(120) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(120),
  role VARCHAR(20) DEFAULT 'USER',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Faculty table
CREATE TABLE IF NOT EXISTS faculty (
  id SERIAL PRIMARY KEY,
  employee_id VARCHAR(30) UNIQUE NOT NULL,
  full_name VARCHAR(120) NOT NULL,
  email VARCHAR(120) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Subjects table
CREATE TABLE IF NOT EXISTS subjects (
  id SERIAL PRIMARY KEY,
  code VARCHAR(30) UNIQUE NOT NULL,
  name VARCHAR(150) NOT NULL,
  credits INTEGER DEFAULT 0,
  weekly_hours INTEGER DEFAULT 0,
  type VARCHAR(20) DEFAULT 'THEORY',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Branches table
CREATE TABLE IF NOT EXISTS branches (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Classes table (linked to branch via FK)
CREATE TABLE IF NOT EXISTS classes (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  branch_id INTEGER NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
  year INTEGER NOT NULL,
  semester INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Class subjects mapping (which subjects belong to which class)
CREATE TABLE IF NOT EXISTS class_subjects (
  class_id INTEGER NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  subject_id INTEGER NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  PRIMARY KEY (class_id, subject_id)
);

-- Time slots table
CREATE TABLE IF NOT EXISTS time_slots (
  id SERIAL PRIMARY KEY,
  day_of_week INTEGER NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  slot_label VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Time tables table
CREATE TABLE IF NOT EXISTS time_tables (
  id SERIAL PRIMARY KEY,
  branch_id INTEGER NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
  subject_id INTEGER NOT NULL REFERENCES subjects(id),
  faculty_id INTEGER NOT NULL REFERENCES faculty(id),
  class_id INTEGER NOT NULL REFERENCES classes(id),
  time_slot_id INTEGER NOT NULL REFERENCES time_slots(id),
  academic_year VARCHAR(20) NOT NULL,
  semester VARCHAR(20) NOT NULL,
  variation INTEGER DEFAULT 1,
  status VARCHAR(20) DEFAULT 'DRAFT',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(class_id, time_slot_id, academic_year, semester, variation)
);

-- Faculty subjects (many-to-many)
CREATE TABLE IF NOT EXISTS faculty_subjects (
  faculty_id INTEGER REFERENCES faculty(id) ON DELETE CASCADE,
  subject_id INTEGER REFERENCES subjects(id) ON DELETE CASCADE,
  PRIMARY KEY (faculty_id, subject_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_time_tables_branch ON time_tables(branch_id);
CREATE INDEX IF NOT EXISTS idx_time_tables_faculty ON time_tables(faculty_id);
CREATE INDEX IF NOT EXISTS idx_time_tables_class ON time_tables(class_id);
CREATE INDEX IF NOT EXISTS idx_time_tables_time_slot ON time_tables(time_slot_id);
`;

async function initDB() {
  const client = await pool.connect();
  try {
    await client.query(schema);
    console.log('Database schema created successfully');
  } catch (err) {
    console.error('Error creating schema:', err);
    process.exit(1);
  } finally {
    client.release();
    process.exit(0);
  }
}

initDB();
