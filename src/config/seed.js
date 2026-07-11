import 'dotenv/config';
import pool from './database.js';
import bcrypt from 'bcrypt';

async function seed() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Clear existing data
    await client.query('TRUNCATE users, faculty, subjects, classes, branches, time_slots, time_tables, faculty_subjects RESTART IDENTITY CASCADE');

    // Insert users
    const passwordHash = await bcrypt.hash('password123', 10);
    await client.query(`
      INSERT INTO users (username, email, password_hash, full_name, role) VALUES
      ('admin', 'admin@school.edu', $1, 'Administrator', 'ADMIN'),
      ('hod', 'hod@school.edu', $1, 'Dr. Smith', 'HOD'),
      ('principal', 'principal@school.edu', $1, 'Dr. Johnson', 'PRINCIPAL')
    `, [passwordHash]);

    // Insert faculty
    const facultyRes = await client.query(`
      INSERT INTO faculty (employee_id, full_name, email) VALUES
      ('FAC001', 'Dr. Alice Brown', 'alice@school.edu'),
      ('FAC002', 'Prof. Bob Wilson', 'bob@school.edu'),
      ('FAC003', 'Dr. Carol Davis', 'carol@school.edu'),
      ('FAC004', 'Prof. David Miller', 'david@school.edu')
      RETURNING id
    `);
    const [fac1, fac2, fac3, fac4] = facultyRes.rows.map(r => r.id);

    // Insert subjects
    const subjectRes = await client.query(`
      INSERT INTO subjects (code, name, credits, weekly_hours, type) VALUES
      ('CS101', 'Data Structures', 3, 4, 'THEORY'),
      ('CS102', 'Algorithms', 3, 4, 'THEORY'),
      ('CS103', 'Database Lab', 2, 3, 'LAB'),
      ('EC101', 'Digital Circuits', 3, 4, 'THEORY'),
      ('ME101', 'Thermodynamics', 3, 4, 'THEORY')
      RETURNING id
    `);
    const [sub1, sub2, sub3, sub4, sub5] = subjectRes.rows.map(r => r.id);

    // Link faculty to subjects
    await client.query(`
      INSERT INTO faculty_subjects (faculty_id, subject_id) VALUES
      ($1, $2), ($3, $4), ($5, $6), ($7, $8), ($9, $10)
    `, [fac1, sub1, fac1, sub2, fac2, sub3, fac3, sub4, fac4, sub5]);

    // Insert classes
    const classRes = await client.query(`
      INSERT INTO classes (name, branch, year, semester) VALUES
      ('Section A', 'CSE', 2024, 3),
      ('Section B', 'CSE', 2024, 3),
      ('Section C', 'ECE', 2024, 3),
      ('Section D', 'CSE', 2025, 1),
      ('Section E', 'ME', 2024, 2)
      RETURNING id
    `);
    const [class1, class2, class3, class4, class5] = classRes.rows.map(r => r.id);

    // Insert branches (renamed from batches)
    const branchRes = await client.query(`
      INSERT INTO branches (name, semester, year) VALUES
      ('CSE 2024', 3, 2),
      ('CSE 2025', 1, 1),
      ('ECE 2024', 3, 2)
      RETURNING id
    `);
    const [branch1, branch2, branch3] = branchRes.rows.map(r => r.id);

    // Insert time slots
    const slotRes = await client.query(`
      INSERT INTO time_slots (day_of_week, start_time, end_time, slot_label, shift) VALUES
      (1, '09:00', '10:00', '9:00 AM - 10:00 AM', 'MORNING'),
      (1, '10:00', '11:00', '10:00 AM - 11:00 AM', 'MORNING'),
      (1, '11:00', '12:00', '11:00 AM - 12:00 PM', 'MORNING'),
      (1, '14:00', '15:00', '2:00 PM - 3:00 PM', 'AFTERNOON'),
      (2, '09:00', '10:00', '9:00 AM - 10:00 AM', 'MORNING'),
      (2, '10:00', '11:00', '10:00 AM - 11:00 AM', 'MORNING'),
      (3, '09:00', '10:00', '9:00 AM - 10:00 AM', 'MORNING'),
      (3, '10:00', '11:00', '10:00 AM - 11:00 AM', 'MORNING'),
      (4, '09:00', '10:00', '9:00 AM - 10:00 AM', 'MORNING'),
      (5, '09:00', '10:00', '9:00 AM - 10:00 AM', 'MORNING')
      RETURNING id
    `);
    const slots = slotRes.rows.map(r => r.id);

    await client.query('COMMIT');
    console.log('Seed data inserted successfully');
    console.log('Default password for all users: password123');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error seeding data:', err);
    process.exit(1);
  } finally {
    client.release();
    process.exit(0);
  }
}

seed();
