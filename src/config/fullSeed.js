import 'dotenv/config';
import pool from './database.js';
import bcrypt from 'bcrypt';

async function seed() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Clear existing data
    await client.query('TRUNCATE users, faculty, subjects, classes, branches, time_slots, time_tables, faculty_subjects, class_subjects RESTART IDENTITY CASCADE');

    // ===================== USERS =====================
    const passwordHash = await bcrypt.hash('password123', 10);
    await client.query(`
      INSERT INTO users (username, email, password_hash, full_name, role) VALUES
      ('admin', 'admin@campus.edu', $1, 'Dr. Raghavendra Sharma', 'ADMIN'),
      ('hod_cse', 'hod_cse@campus.edu', $1, 'Dr. Anand Kumar', 'HOD'),
      ('hod_ece', 'hod_ece@campus.edu', $1, 'Dr. Lakshmi Devi', 'HOD'),
      ('hod_civil', 'hod_civil@campus.edu', $1, 'Prof. Venkateshwara Rao', 'HOD'),
      ('principal', 'principal@campus.edu', $1, 'Dr. Suresh Babu', 'PRINCIPAL')
    `, [passwordHash]);

    // ===================== FACULTY =====================
    const facultyNames = [
      // CSE/AIML Faculty
      { emp: 'CSE001', name: 'Dr. Anand Kumar', email: 'anand.kumar@campus.edu' },
      { emp: 'CSE002', name: 'Dr. Priya Venkatesh', email: 'priya.v@campus.edu' },
      { emp: 'CSE003', name: 'Prof. Ramesh Babu', email: 'ramesh.b@campus.edu' },
      { emp: 'CSE004', name: 'Dr. Kavitha Srinivas', email: 'kavitha.s@campus.edu' },
      { emp: 'CSE005', name: 'Prof. Srinivas Reddy', email: 'srinivas.r@campus.edu' },
      { emp: 'CSE006', name: 'Dr. Deepa Nair', email: 'deepa.n@campus.edu' },
      { emp: 'CSE007', name: 'Prof. Mohan Das', email: 'mohan.d@campus.edu' },
      { emp: 'CSE008', name: 'Dr. Shalini Gupta', email: 'shalini.g@campus.edu' },
      { emp: 'CSE009', name: 'Prof. Karthik Rajan', email: 'karthik.r@campus.edu' },
      { emp: 'CSE010', name: 'Dr. Meena Kumari', email: 'meena.k@campus.edu' },
      { emp: 'CSE011', name: 'Prof. Arjun Mehta', email: 'arjun.m@campus.edu' },
      { emp: 'CSE012', name: 'Dr. Nithya Raman', email: 'nithya.r@campus.edu' },

      // ECE Faculty
      { emp: 'ECE001', name: 'Dr. Lakshmi Devi', email: 'lakshmi.d@campus.edu' },
      { emp: 'ECE002', name: 'Prof. Rajesh Kulkarni', email: 'rajesh.k@campus.edu' },
      { emp: 'ECE003', name: 'Dr. Sunitha Menon', email: 'sunitha.m@campus.edu' },
      { emp: 'ECE004', name: 'Prof. Girish Patil', email: 'girish.p@campus.edu' },
      { emp: 'ECE005', name: 'Dr. Padmavathi Iyer', email: 'padma.i@campus.edu' },
      { emp: 'ECE006', name: 'Prof. Harish Chandra', email: 'harish.c@campus.edu' },
      { emp: 'ECE007', name: 'Dr. Bhavani Shankar', email: 'bhavani.s@campus.edu' },
      { emp: 'ECE008', name: 'Prof. Divya Prakash', email: 'divya.p@campus.edu' },
      { emp: 'ECE009', name: 'Dr. Vasanth Kumar', email: 'vasanth.k@campus.edu' },
      { emp: 'ECE010', name: 'Prof. Rekha Joshi', email: 'rekha.j@campus.edu' },

      // Civil Faculty
      { emp: 'CIV001', name: 'Prof. Venkateshwara Rao', email: 'venkat.rao@campus.edu' },
      { emp: 'CIV002', name: 'Dr. Nagarjuna Reddy', email: 'nagarjuna.r@campus.edu' },
      { emp: 'CIV003', name: 'Prof. Sujatha Rani', email: 'sujatha.r@campus.edu' },
      { emp: 'CIV004', name: 'Dr. Kiran Chandra', email: 'kiran.c@campus.edu' },
      { emp: 'CIV005', name: 'Prof. Padma Priya', email: 'padma.p@campus.edu' },
      { emp: 'CIV006', name: 'Dr. Ravi Shankar', email: 'ravi.s@campus.edu' },
      { emp: 'CIV007', name: 'Prof. Annapurna Devi', email: 'anna.d@campus.edu' },
      { emp: 'CIV008', name: 'Dr. Mahesh Varma', email: 'mahesh.v@campus.edu' },

      // Common/HSS Faculty (Maths, Physics, Chemistry, English)
      { emp: 'HSS001', name: 'Dr. Raghavendra Sharma', email: 'raghav.s@campus.edu' },
      { emp: 'HSS002', name: 'Prof. Usha Krishnan', email: 'usha.k@campus.edu' },
      { emp: 'HSS003', name: 'Dr. Balasubramanian', email: 'bala.s@campus.edu' },
      { emp: 'HSS004', name: 'Prof. Saroja Devi', email: 'saroja.d@campus.edu' },
      { emp: 'HSS005', name: 'Dr. Narayana Swamy', email: 'narayana.s@campus.edu' },
      { emp: 'HSS006', name: 'Prof. Jayalakshmi', email: 'jaya.l@campus.edu' },
      { emp: 'HSS007', name: 'Dr. Prakash Rao', email: 'prakash.r@campus.edu' },

      // ME Faculty
      { emp: 'ME001', name: 'Prof. Subramanyam', email: 'subra.m@campus.edu' },
      { emp: 'ME002', name: 'Dr. Durga Prasad', email: 'durga.p@campus.edu' },
      { emp: 'ME003', name: 'Prof. Shankar Reddy', email: 'shankar.r@campus.edu' },

      // EEE Faculty
      { emp: 'EEE001', name: 'Dr. Chandrasekhar', email: 'chandra.s@campus.edu' },
      { emp: 'EEE002', name: 'Prof. Lalitha Kumari', email: 'lalitha.k@campus.edu' },
    ];

    const facultyRes = await client.query(
      `INSERT INTO faculty (employee_id, full_name, email) VALUES ${facultyNames.map((_, i) => `($${i*3+1}, $${i*3+2}, $${i*3+3})`).join(', ')} RETURNING id, employee_id`,
      facultyNames.flatMap(f => [f.emp, f.name, f.email])
    );

    // Build a map: employee_id -> db_id
    const facMap = {};
    facultyRes.rows.forEach(r => { facMap[r.employee_id] = r.id; });

    // ===================== SUBJECTS =====================
    const subjects = [
      // === SEM 1 Common ===
      { code: 'AHSC01', name: 'English', credits: 3, hours: 3, type: 'THEORY' },
      { code: 'AHSC02', name: 'Linear Algebra and Calculus', credits: 4, hours: 4, type: 'THEORY' },
      { code: 'AHSC03', name: 'Engineering Physics', credits: 4, hours: 4, type: 'THEORY' },
      { code: 'AHSC04', name: 'English Language and Communication Skills Laboratory', credits: 2, hours: 3, type: 'LAB' },
      { code: 'AHSC05', name: 'Physics Laboratory', credits: 2, hours: 3, type: 'LAB' },
      { code: 'ACSC01', name: 'Python Programming', credits: 3, hours: 3, type: 'THEORY' },
      { code: 'ACSC02', name: 'Python Programming Laboratory', credits: 2, hours: 3, type: 'LAB' },
      { code: 'AHSC06', name: 'Chemistry', credits: 4, hours: 4, type: 'THEORY' },
      { code: 'AEEC01', name: 'Basic Electrical Engineering', credits: 3, hours: 3, type: 'THEORY' },
      { code: 'ACSC06', name: 'Experiential Engineering Education - Academic Success', credits: 1, hours: 2, type: 'THEORY' },
      { code: 'AEEC04', name: 'Basic Electrical Engineering Laboratory', credits: 2, hours: 3, type: 'LAB' },
      { code: 'AMEC04', name: 'Engineering Workshop Practice', credits: 2, hours: 3, type: 'LAB' },
      { code: 'AHSC03B', name: 'Applied Physics', credits: 4, hours: 4, type: 'THEORY' },
      { code: 'AHSC07', name: 'Mathematical Transform Techniques', credits: 4, hours: 4, type: 'THEORY' },
      { code: 'AEEC02', name: 'Electrical Circuits', credits: 3, hours: 3, type: 'THEORY' },
      { code: 'ACSC04', name: 'Programming for Problem Solving using C', credits: 3, hours: 3, type: 'THEORY' },
      { code: 'ACSC05', name: 'Programming for Problem Solving using C Laboratory', credits: 2, hours: 3, type: 'LAB' },
      { code: 'AEEC03', name: 'Electrical Circuits Laboratory', credits: 2, hours: 3, type: 'LAB' },
      { code: 'AMEC01', name: 'Engineering Mechanics', credits: 4, hours: 4, type: 'THEORY' },
      { code: 'AMEC02', name: 'Manufacturing Practice', credits: 2, hours: 3, type: 'LAB' },
      { code: 'AMEC03', name: 'Computer Aided Engineering Drawing', credits: 2, hours: 3, type: 'LAB' },

      // === SEM 3 CSE/AIML ===
      { code: 'AITC01', name: 'Discrete Mathematical Structures', credits: 3, hours: 3, type: 'THEORY' },
      { code: 'ACSC07', name: 'Computer Organization and Architecture', credits: 3, hours: 3, type: 'THEORY' },
      { code: 'ACSC08', name: 'Data Structures', credits: 3, hours: 3, type: 'THEORY' },
      { code: 'AITC02', name: 'Programming with Objects', credits: 3, hours: 3, type: 'THEORY' },
      { code: 'AECC08', name: 'Analog and Digital Electronics', credits: 3, hours: 3, type: 'THEORY' },
      { code: 'ACSC09', name: 'Experiential Engineering Education - Prototype/Design Building', credits: 1, hours: 2, type: 'THEORY' },
      { code: 'ACSC10', name: 'Data Structures Laboratory', credits: 2, hours: 3, type: 'LAB' },
      { code: 'AITC03', name: 'Programming with Objects Laboratory', credits: 2, hours: 3, type: 'LAB' },
      { code: 'ACSC11', name: 'Advanced Python Programming Laboratory', credits: 2, hours: 3, type: 'LAB' },
      { code: 'AHSC10', name: 'Essence of Indian Traditional Knowledge', credits: 1, hours: 2, type: 'THEORY' },

      // === SEM 4 CSE/AIML ===
      { code: 'AITC04', name: 'Theory of Computation', credits: 3, hours: 3, type: 'THEORY' },
      { code: 'ACSC12', name: 'Operating Systems', credits: 3, hours: 3, type: 'THEORY' },
      { code: 'AITC05', name: 'Database Management Systems', credits: 3, hours: 3, type: 'THEORY' },
      { code: 'ACSC13', name: 'Design and Analysis of Algorithms', credits: 3, hours: 3, type: 'THEORY' },
      { code: 'AHSC13', name: 'Business Economics and Financial Analysis', credits: 3, hours: 3, type: 'THEORY' },
      { code: 'ACSC14', name: 'Experiential Engineering Education - Fabrication/Model Development', credits: 1, hours: 2, type: 'THEORY' },
      { code: 'AITC07', name: 'Database Management Systems Laboratory', credits: 2, hours: 3, type: 'LAB' },
      { code: 'ACSC15', name: 'Design and Analysis of Algorithms Laboratory', credits: 2, hours: 3, type: 'LAB' },
      { code: 'ACSC16', name: 'Linux Programming Laboratory', credits: 2, hours: 3, type: 'LAB' },
      { code: 'AHSC14', name: 'Indian Constitution', credits: 1, hours: 2, type: 'THEORY' },

      // === SEM 5 CSE/AIML ===
      { code: 'AITC06', name: 'Computer Networks', credits: 3, hours: 3, type: 'THEORY' },
      { code: 'ACSC40', name: 'Compiler Design', credits: 3, hours: 3, type: 'THEORY' },
      { code: 'ACSC19', name: 'Object Oriented Software Engineering', credits: 3, hours: 3, type: 'THEORY' },
      { code: 'AITC09', name: 'Web Application Development', credits: 3, hours: 3, type: 'THEORY' },
      { code: 'ACSC20', name: 'Experiential Engineering Education - Project Based Learning', credits: 1, hours: 2, type: 'THEORY' },
      { code: 'ACSC21', name: 'Object Oriented Software Design Laboratory', credits: 2, hours: 3, type: 'LAB' },
      { code: 'AITC10', name: 'Web Application Development Laboratory', credits: 2, hours: 3, type: 'LAB' },
      { code: 'ACSC22', name: 'Competitive Programming using Graph Algorithms', credits: 1, hours: 2, type: 'THEORY' },
      // AIML elective
      { code: 'ACPE01', name: 'Machine Learning', credits: 3, hours: 3, type: 'THEORY' },

      // === SEM 6 CSE/AIML ===
      { code: 'ACIC01', name: 'Data Mining and Knowledge Discovery', credits: 3, hours: 3, type: 'THEORY' },
      { code: 'ACIC02', name: 'Software Quality Assurance and Testing', credits: 3, hours: 3, type: 'THEORY' },
      { code: 'ACIC03', name: 'Network and Web Security', credits: 3, hours: 3, type: 'THEORY' },
      { code: 'ACSC27', name: 'Experiential Engineering Education - Research Based Learning', credits: 1, hours: 2, type: 'THEORY' },
      { code: 'ACIC08', name: 'Data Mining and Knowledge Discovery Laboratory', credits: 2, hours: 3, type: 'LAB' },
      { code: 'ACIC09', name: 'Software Testing Laboratory', credits: 2, hours: 3, type: 'LAB' },
      { code: 'ACSC28', name: 'Go Programming', credits: 1, hours: 2, type: 'THEORY' },
      { code: 'ACSC42', name: 'DevOps', credits: 1, hours: 2, type: 'THEORY' },
      // AIML elective
      { code: 'ACPE02', name: 'Deep Learning', credits: 3, hours: 3, type: 'THEORY' },
      { code: 'ACPE03', name: 'Natural Language Processing', credits: 3, hours: 3, type: 'THEORY' },

      // === SEM 7 CSE/AIML ===
      { code: 'ACSC30', name: 'Cloud Application Development', credits: 3, hours: 3, type: 'THEORY' },
      { code: 'ACSC31', name: 'Big Data and Analytics', credits: 3, hours: 3, type: 'THEORY' },
      { code: 'ACSC33', name: 'Cloud Application Development Laboratory', credits: 2, hours: 3, type: 'LAB' },
      { code: 'ACSC34', name: 'Big Data and Analytics Laboratory', credits: 2, hours: 3, type: 'LAB' },
      { code: 'ACSC35', name: 'Project Work Phase I', credits: 4, hours: 6, type: 'LAB' },
      { code: 'ACPE04', name: 'Artificial Intelligence', credits: 3, hours: 3, type: 'THEORY' },
      { code: 'ACPE05', name: 'Computer Vision', credits: 3, hours: 3, type: 'THEORY' },

      // === SEM 8 CSE/AIML ===
      { code: 'ACSC39', name: 'Project Work Phase II', credits: 8, hours: 12, type: 'LAB' },
      { code: 'ACPE06', name: 'Reinforcement Learning', credits: 3, hours: 3, type: 'THEORY' },
      { code: 'ACPE07', name: 'Blockchain Technology', credits: 3, hours: 3, type: 'THEORY' },

      // === SEM 3 ECE ===
      { code: 'AECC01', name: 'Electronic Devices and Circuits', credits: 3, hours: 3, type: 'THEORY' },
      { code: 'AECC02', name: 'Signals and Systems', credits: 3, hours: 3, type: 'THEORY' },
      { code: 'AECC03', name: 'Digital System Design', credits: 3, hours: 3, type: 'THEORY' },
      { code: 'AECC04', name: 'Probability Theory and Stochastic Processes', credits: 3, hours: 3, type: 'THEORY' },
      { code: 'AECC05', name: 'Electronic Devices and Circuits Laboratory', credits: 2, hours: 3, type: 'LAB' },
      { code: 'AECC06', name: 'Digital System Design Laboratory', credits: 2, hours: 3, type: 'LAB' },

      // === SEM 4 ECE ===
      { code: 'AHSC12', name: 'Complex Analysis and Special Functions', credits: 4, hours: 4, type: 'THEORY' },
      { code: 'AECC09', name: 'Analog and Pulse Circuits', credits: 3, hours: 3, type: 'THEORY' },
      { code: 'AECC10', name: 'Analog and Digital Communications', credits: 3, hours: 3, type: 'THEORY' },
      { code: 'AECC11', name: 'Electromagnetic Waves and Transmission Lines', credits: 3, hours: 3, type: 'THEORY' },
      { code: 'AECC12', name: 'IC Applications', credits: 3, hours: 3, type: 'THEORY' },
      { code: 'AECC13', name: 'Analog and Pulse Circuits Laboratory', credits: 2, hours: 3, type: 'LAB' },
      { code: 'AECC14', name: 'Analog and Digital Communications Laboratory', credits: 2, hours: 3, type: 'LAB' },
      { code: 'AECC15', name: 'IC Applications Laboratory', credits: 2, hours: 3, type: 'LAB' },
      { code: 'ACSC18', name: 'Fundamentals of Database Systems', credits: 1, hours: 2, type: 'THEORY' },

      // === SEM 5 ECE ===
      { code: 'AECC18', name: 'Antennas and Wave Propagation', credits: 3, hours: 3, type: 'THEORY' },
      { code: 'AECC19', name: 'Microprocessors and Microcontrollers', credits: 3, hours: 3, type: 'THEORY' },
      { code: 'AECC20', name: 'Electronic Measurements and Instrumentation', credits: 3, hours: 3, type: 'THEORY' },
      { code: 'AECC21', name: 'Control Systems', credits: 3, hours: 3, type: 'THEORY' },
      { code: 'AECC30', name: 'Virtual Instrumentation Laboratory', credits: 2, hours: 3, type: 'LAB' },
      { code: 'AECC31', name: 'Microprocessors and Microcontrollers Laboratory', credits: 2, hours: 3, type: 'LAB' },
      { code: 'ACSC23', name: 'Object Oriented Programming Development and Languages', credits: 1, hours: 2, type: 'THEORY' },

      // === SEM 6 ECE ===
      { code: 'AECC32', name: 'Microwave and Radar Engineering', credits: 3, hours: 3, type: 'THEORY' },
      { code: 'AECC33', name: 'Digital Signal Processing', credits: 3, hours: 3, type: 'THEORY' },
      { code: 'AECC41', name: 'Antennas and Microwave Engineering Laboratory', credits: 2, hours: 3, type: 'LAB' },
      { code: 'AECC42', name: 'Digital Signal Processing Laboratory', credits: 2, hours: 3, type: 'LAB' },
      { code: 'ACSC29', name: 'Design of Algorithms', credits: 1, hours: 2, type: 'THEORY' },
      { code: 'AEPE01', name: 'VLSI Signal Processing', credits: 3, hours: 3, type: 'THEORY' },
      { code: 'AEPE02', name: 'Wireless Communications', credits: 3, hours: 3, type: 'THEORY' },

      // === SEM 7 ECE ===
      { code: 'AECC43', name: 'Embedded System Design', credits: 3, hours: 3, type: 'THEORY' },
      { code: 'AECC44', name: 'VLSI Design', credits: 3, hours: 3, type: 'THEORY' },
      { code: 'AECC53', name: 'Embedded System Design Laboratory', credits: 2, hours: 3, type: 'LAB' },
      { code: 'AECC54', name: 'VLSI Design Laboratory', credits: 2, hours: 3, type: 'LAB' },
      { code: 'AECC55', name: 'Project Work Phase I', credits: 4, hours: 6, type: 'LAB' },
      { code: 'AEPE03', name: 'IoT Systems', credits: 3, hours: 3, type: 'THEORY' },

      // === SEM 8 ECE ===
      { code: 'AECC64', name: 'Project Work Phase II', credits: 8, hours: 12, type: 'LAB' },
      { code: 'AEPE04', name: 'Satellite Communications', credits: 3, hours: 3, type: 'THEORY' },
      { code: 'AEPE05', name: 'Optical Communications', credits: 3, hours: 3, type: 'THEORY' },

      // === SEM 3 CIVIL ===
      { code: 'ACEC01', name: 'Surveying and Geomatics', credits: 3, hours: 3, type: 'THEORY' },
      { code: 'ACEC02', name: 'Strength of Materials', credits: 4, hours: 4, type: 'THEORY' },
      { code: 'ACEC03', name: 'Fluid Mechanics', credits: 4, hours: 4, type: 'THEORY' },
      { code: 'ACEC04', name: 'Engineering Geology', credits: 3, hours: 3, type: 'THEORY' },
      { code: 'ACEC05', name: 'Surveying and Geomatics Laboratory', credits: 2, hours: 3, type: 'LAB' },
      { code: 'ACEC06', name: 'Engineering Geology Laboratory', credits: 2, hours: 3, type: 'LAB' },

      // === SEM 4 CIVIL ===
      { code: 'ACEC07', name: 'Theory of Structures', credits: 4, hours: 4, type: 'THEORY' },
      { code: 'ACEC08', name: 'Hydraulics and Hydraulic Machinery', credits: 4, hours: 4, type: 'THEORY' },
      { code: 'ACEC09', name: 'Building Materials - Planning and Construction', credits: 3, hours: 3, type: 'THEORY' },
      { code: 'ACEC10', name: 'Concrete Technology', credits: 3, hours: 3, type: 'THEORY' },
      { code: 'ACEC11', name: 'Concrete Technology Laboratory', credits: 2, hours: 3, type: 'LAB' },
      { code: 'ACEC12', name: 'Hydraulics and Hydraulic Machinery Laboratory', credits: 2, hours: 3, type: 'LAB' },
      { code: 'ACEC13', name: 'Strength of Materials Laboratory', credits: 2, hours: 3, type: 'LAB' },

      // === SEM 5 CIVIL ===
      { code: 'ACEC14', name: 'Analysis of Structures', credits: 4, hours: 4, type: 'THEORY' },
      { code: 'ACEC15', name: 'Hydrology and Water Resources Engineering', credits: 3, hours: 3, type: 'THEORY' },
      { code: 'ACEC16', name: 'Reinforced Concrete Structures Design and Drawing', credits: 4, hours: 4, type: 'THEORY' },
      { code: 'ACEC21', name: 'Advanced Surveying Laboratory', credits: 2, hours: 3, type: 'LAB' },
      { code: 'ACEC22', name: 'Advanced Material Testing Laboratory', credits: 2, hours: 3, type: 'LAB' },

      // === SEM 6 CIVIL ===
      { code: 'ACEC23', name: 'Steel Structures Design and Drawing', credits: 4, hours: 4, type: 'THEORY' },
      { code: 'ACEC24', name: 'Geotechnical Engineering', credits: 3, hours: 3, type: 'THEORY' },
      { code: 'ACEC25', name: 'Transportation Engineering', credits: 3, hours: 3, type: 'THEORY' },
      { code: 'ACEC32', name: 'Geotechnical Engineering Laboratory', credits: 2, hours: 3, type: 'LAB' },
      { code: 'ACEC33', name: 'Transportation Engineering Laboratory', credits: 2, hours: 3, type: 'LAB' },

      // === SEM 7 CIVIL ===
      { code: 'ACEC34', name: 'Environmental Engineering', credits: 3, hours: 3, type: 'THEORY' },
      { code: 'ACEC35', name: 'Foundation Engineering', credits: 3, hours: 3, type: 'THEORY' },
      { code: 'ACEC44', name: 'Advanced Structural Design Laboratory', credits: 2, hours: 3, type: 'LAB' },
      { code: 'ACEC45', name: 'Project Planning Laboratory', credits: 2, hours: 3, type: 'LAB' },
      { code: 'ACEC46', name: 'Project Work Phase I', credits: 4, hours: 6, type: 'LAB' },

      // === SEM 8 CIVIL ===
      { code: 'ACEC55', name: 'Project Work Phase II', credits: 8, hours: 12, type: 'LAB' },
      { code: 'ACPE08', name: 'Earthquake Engineering', credits: 3, hours: 3, type: 'THEORY' },
      { code: 'ACPE09', name: 'Green Building Technology', credits: 3, hours: 3, type: 'THEORY' },
    ];

    const subjectRes = await client.query(
      `INSERT INTO subjects (code, name, credits, weekly_hours, type) VALUES ${subjects.map((_, i) => `($${i*5+1}, $${i*5+2}, $${i*5+3}, $${i*5+4}, $${i*5+5})`).join(', ')} RETURNING id, code`,
      subjects.flatMap(s => [s.code, s.name, s.credits, s.hours, s.type])
    );

    const subMap = {};
    subjectRes.rows.forEach(r => { subMap[r.code] = r.id; });

    // ===================== BRANCHES =====================
    const branchRes = await client.query(`
      INSERT INTO branches (name) VALUES
      ('AIML'), ('ECE'), ('CIVIL')
      RETURNING id, name
    `);

    const branchMap = {};
    branchRes.rows.forEach(r => { branchMap[r.name] = r.id; });

    // ===================== CLASSES =====================
    // 24 classes: 8 semesters x 3 branches
    // year = ceil(semester / 2)
    const classDefs = [];
    for (const branchName of ['AIML', 'ECE', 'CIVIL']) {
      for (let sem = 1; sem <= 8; sem++) {
        const year = Math.ceil(sem / 2);
        classDefs.push({
          name: `${branchName} S${sem}`,
          branch_id: branchMap[branchName],
          year,
          semester: sem
        });
      }
    }

    const classRes = await client.query(
      `INSERT INTO classes (name, branch_id, year, semester) VALUES ${classDefs.map((_, i) => `($${i*4+1}, $${i*4+2}, $${i*4+3}, $${i*4+4})`).join(', ')} RETURNING id, name, branch_id, semester`,
      classDefs.flatMap(c => [c.name, c.branch_id, c.year, c.semester])
    );

    // Build class map: "BRANCH S#" -> class id
    const classMap = {};
    classRes.rows.forEach(r => { classMap[r.name] = r.id; });

    // ===================== CLASS-SUBJECTS =====================
    // Define which subjects belong to which class per semester per branch
    const classSubjectsDef = {
      // AIML Branch subjects by semester
      'AIML': {
        1: ['AHSC01', 'AHSC02', 'AHSC06', 'AEEC01', 'ACSC01', 'ACSC06', 'AHSC04', 'AHSC05', 'ACSC02', 'AEEC04', 'AMEC04'],
        2: ['AHSC01', 'AHSC08', 'AHSC09', 'ACSC04', 'AHSC04', 'AHSC05', 'ACSC05'],
        3: ['AITC01', 'ACSC07', 'ACSC08', 'AITC02', 'AECC08', 'ACSC09', 'ACSC10', 'AITC03', 'ACSC11', 'AHSC10'],
        4: ['AITC04', 'ACSC12', 'AITC05', 'ACSC13', 'AHSC13', 'ACSC14', 'AITC07', 'ACSC15', 'ACSC16', 'AHSC14'],
        5: ['AITC06', 'ACSC40', 'ACSC19', 'AITC09', 'ACPE01', 'ACSC20', 'ACSC21', 'AITC10', 'ACSC22'],
        6: ['ACIC01', 'ACIC02', 'ACIC03', 'ACPE02', 'ACPE03', 'ACSC27', 'ACIC08', 'ACIC09', 'ACSC28', 'ACSC42'],
        7: ['ACSC30', 'ACSC31', 'ACPE04', 'ACPE05', 'ACSC33', 'ACSC34', 'ACSC35'],
        8: ['ACPE06', 'ACPE07', 'ACSC39'],
      },
      // ECE Branch subjects by semester
      'ECE': {
        1: ['AHSC01', 'AHSC02', 'AHSC03', 'ACSC01', 'AHSC04', 'AHSC05', 'ACSC02'],
        2: ['AHSC06', 'AHSC07', 'AEEC02', 'ACSC04', 'ACSC06', 'AEEC03', 'ACSC05', 'AMEC04'],
        3: ['AECC01', 'AECC02', 'AECC03', 'AECC04', 'ACSC08', 'ACSC09', 'AECC05', 'AECC06', 'ACSC10', 'AHSC10'],
        4: ['AHSC12', 'AECC09', 'AECC10', 'AECC11', 'AECC12', 'ACSC14', 'AECC13', 'AECC14', 'AECC15', 'ACSC18'],
        5: ['AECC18', 'AECC19', 'AECC20', 'AECC21', 'AEPE01', 'ACSC20', 'AECC30', 'AECC31', 'ACSC23'],
        6: ['AECC32', 'AECC33', 'AHSC13', 'AEPE02', 'AEPE03', 'ACSC27', 'AECC41', 'AECC42', 'ACSC29'],
        7: ['AECC43', 'AECC44', 'AEPE03', 'AEPE04', 'AEPE05', 'AECC53', 'AECC54', 'AECC55'],
        8: ['AEPE04', 'AEPE05', 'AECC64'],
      },
      // CIVIL Branch subjects by semester
      'CIVIL': {
        1: ['AHSC01', 'AHSC02', 'AHSC03', 'ACSC01', 'AHSC04', 'AHSC05', 'ACSC02'],
        2: ['AHSC06', 'AHSC07', 'AMEC01', 'AEEC01', 'ACSC06', 'AMEC02', 'AMEC03', 'ACSC05'],
        3: ['ACEC01', 'ACEC02', 'ACEC03', 'ACEC04', 'ACSC08', 'ACSC09', 'ACEC05', 'ACEC06', 'ACSC10', 'AHSC10'],
        4: ['ACEC07', 'AHSC08', 'ACEC08', 'ACEC09', 'ACEC10', 'ACSC14', 'ACEC11', 'ACEC12', 'ACEC13', 'ACSC18'],
        5: ['ACEC14', 'ACEC15', 'ACEC16', 'AHSC13', 'ACEC21', 'ACEC22', 'ACSC23'],
        6: ['ACEC23', 'ACEC24', 'ACEC25', 'ACEC32', 'ACEC33', 'ACSC27', 'ACSC29'],
        7: ['ACEC34', 'ACEC35', 'ACPE08', 'ACPE09', 'ACEC44', 'ACEC45', 'ACEC46'],
        8: ['ACPE08', 'ACPE09', 'ACEC55'],
      },
    };

    // Build class_subjects rows, skipping any subject codes that don't exist
    const csValues = [];
    for (const [branchName, semesters] of Object.entries(classSubjectsDef)) {
      for (const [sem, codes] of Object.entries(semesters)) {
        const className = `${branchName} S${sem}`;
        const classId = classMap[className];
        if (!classId) continue;
        for (const code of codes) {
          const subjectId = subMap[code];
          if (!subjectId) {
            console.warn(`  Skipping missing subject ${code} for class ${className}`);
            continue;
          }
          csValues.push(classId, subjectId);
        }
      }
    }

    if (csValues.length > 0) {
      const csPlaceholders = [];
      for (let i = 0; i < csValues.length; i += 2) {
        csPlaceholders.push(`($${i + 1}, $${i + 2})`);
      }
      await client.query(
        `INSERT INTO class_subjects (class_id, subject_id) VALUES ${csPlaceholders.join(', ')}`,
        csValues
      );
    }

    // ===================== TIME SLOTS =====================
    // Monday-Saturday, same slots each day
    // 8 uniform 55-min slots: 4 morning + 4 afternoon
    const slotLabels = [
      { start: '09:00', end: '09:55', label: '9:00 AM - 9:55 AM' },
      { start: '10:00', end: '10:55', label: '10:00 AM - 10:55 AM' },
      { start: '11:00', end: '11:55', label: '11:00 AM - 11:55 AM' },
      { start: '12:00', end: '12:55', label: '12:00 PM - 12:55 PM' },
      { start: '14:00', end: '14:55', label: '2:00 PM - 2:55 PM' },
      { start: '15:00', end: '15:55', label: '3:00 PM - 3:55 PM' },
      { start: '16:00', end: '16:55', label: '4:00 PM - 4:55 PM' },
      { start: '17:00', end: '17:55', label: '5:00 PM - 5:55 PM' },
    ];

    const slotValues = [];
    for (let day = 1; day <= 6; day++) {
      for (const s of slotLabels) {
        slotValues.push(day, s.start, s.end, s.label);
      }
    }

    const slotRes = await client.query(
      `INSERT INTO time_slots (day_of_week, start_time, end_time, slot_label) VALUES ${slotValues.map((_, i) => {
        const idx = Math.floor(i / 4);
        return `($${idx*4+1}, $${idx*4+2}, $${idx*4+3}, $${idx*4+4})`;
      }).filter((v, i, a) => a.indexOf(v) === i).join(', ')}`,
      slotValues
    );

    // ===================== FACULTY-SUBJECT LINKS =====================
    // Assign each subject to 1-3 faculty members to keep it balanced
    const facultySubjectLinks = [
      // HSS faculty -> common subjects
      [facMap['HSS001'], [subMap['AHSC02'], subMap['AHSC07'], subMap['AITC01'], subMap['AHSC12']]], // Raghavendra Sharma -> Maths
      [facMap['HSS002'], [subMap['AHSC01'], subMap['AHSC04'], subMap['AHSC06']]], // Usha Krishnan -> English, Chemistry
      [facMap['HSS003'], [subMap['AHSC03'], subMap['AHSC03B'], subMap['AHSC05']]], // Balasubramanian -> Physics
      [facMap['HSS004'], [subMap['AHSC01'], subMap['AHSC04']]], // Saroja Devi -> English
      [facMap['HSS005'], [subMap['AHSC02'], subMap['AHSC08'], subMap['AHSC07']]], // Narayana Swamy -> Maths
      [facMap['HSS006'], [subMap['AHSC10'], subMap['AHSC14'], subMap['AHSC13']]], // Jayalakshmi -> Value added
      [facMap['HSS007'], [subMap['AHSC06'], subMap['AHSC03']]], // Prakash Rao -> Chemistry, Physics

      // CSE Faculty
      [facMap['CSE001'], [subMap['ACSC01'], subMap['ACSC02'], subMap['ACSC04'], subMap['ACSC05']]], // Anand Kumar -> Programming
      [facMap['CSE002'], [subMap['ACSC08'], subMap['ACSC10'], subMap['ACSC13'], subMap['ACSC15']]], // Priya Venkatesh -> DSA
      [facMap['CSE003'], [subMap['ACSC07'], subMap['AITC04'], subMap['ACSC12']]], // Ramesh Babu -> COA, OS, TOC
      [facMap['CSE004'], [subMap['AITC02'], subMap['AITC03'], subMap['ACSC19'], subMap['ACSC21']]], // Kavitha Srinivas -> OOP, SE
      [facMap['CSE005'], [subMap['AITC05'], subMap['AITC07'], subMap['ACSC18']]], // Srinivas Reddy -> DBMS
      [facMap['CSE006'], [subMap['AITC06'], subMap['ACIC03'], subMap['AECC08']]], // Deepa Nair -> Networks
      [facMap['CSE007'], [subMap['ACSC40'], subMap['ACSC11'], subMap['ACSC01']]], // Mohan Das -> Compiler, Python
      [facMap['CSE008'], [subMap['AITC09'], subMap['AITC10'], subMap['ACSC20'], subMap['ACSC06']]], // Shalini Gupta -> Web Dev, ExEEd
      [facMap['CSE009'], [subMap['ACIC01'], subMap['ACIC08'], subMap['ACPE01'], subMap['ACPE02']]], // Karthik Rajan -> Data Mining, ML, DL
      [facMap['CSE010'], [subMap['ACIC02'], subMap['ACIC09'], subMap['ACSC27']]], // Meena Kumari -> Testing, ExEEd
      [facMap['CSE011'], [subMap['ACSC30'], subMap['ACSC33'], subMap['ACSC31'], subMap['ACSC34']]], // Arjun Mehta -> Cloud, Big Data
      [facMap['CSE012'], [subMap['ACSC16'], subMap['ACSC28'], subMap['ACSC42'], subMap['ACSC22']]], // Nithya Raman -> Linux, Go, DevOps
      // Extra AIML subjects
      [facMap['CSE009'], [...(subMap['ACPE03'] ? [subMap['ACPE03']] : []), ...(subMap['ACPE04'] ? [subMap['ACPE04']] : []), ...(subMap['ACPE05'] ? [subMap['ACPE05']] : [])]],
      [facMap['CSE006'], [...(subMap['ACPE06'] ? [subMap['ACPE06']] : []), ...(subMap['ACPE07'] ? [subMap['ACPE07']] : [])]],

      // ECE Faculty
      [facMap['ECE001'], [subMap['AECC01'], subMap['AECC05'], subMap['AECC09'], subMap['AECC13']]], // Lakshmi Devi -> EDC
      [facMap['ECE002'], [subMap['AECC02'], subMap['AECC33'], subMap['AECC42']]], // Rajesh Kulkarni -> Signals, DSP
      [facMap['ECE003'], [subMap['AECC03'], subMap['AECC06'], subMap['AECC10'], subMap['AECC14']]], // Sunitha Menon -> Digital, Comm
      [facMap['ECE004'], [subMap['AECC04'], subMap['AECC11'], subMap['AECC32'], subMap['AECC41']]], // Girish Patil -> EMWTL, Microwave
      [facMap['ECE005'], [subMap['AECC12'], subMap['AECC15'], subMap['AECC18'], subMap['AECC43']]], // Padmavathi Iyer -> ICA, Antennas
      [facMap['ECE006'], [subMap['AECC19'], subMap['AECC31'], subMap['AECC44'], subMap['AECC54']]], // Harish Chandra -> MP&M, VLSI
      [facMap['ECE007'], [subMap['AECC20'], subMap['AECC21'], subMap['AECC30']]], // Bhavani Shankar -> Measurements, Control
      [facMap['ECE008'], [subMap['AECC08'], subMap['AEEC01'], subMap['AEEC04']]], // Divya Prakash -> Analog Electronics, BEE
      [facMap['ECE009'], [subMap['AEEC02'], subMap['AEEC03'], subMap['AECC55'], subMap['AECC64']]], // Vasanth Kumar -> Circuits, Project
      [facMap['ECE010'], [subMap['AEPE01'], subMap['AEPE02'], subMap['AEPE03']]], // Rekha Joshi -> Electives

      // Civil Faculty
      [facMap['CIV001'], [subMap['ACEC07'], subMap['ACEC14'], subMap['ACEC16'], subMap['ACEC23']]], // Venkateshwara Rao -> Structures
      [facMap['CIV002'], [subMap['ACEC03'], subMap['ACEC08'], subMap['ACEC12'], subMap['ACEC15']]], // Nagarjuna Reddy -> Fluids
      [facMap['CIV003'], [subMap['ACEC01'], subMap['ACEC05'], subMap['ACEC21'], subMap['ACEC25']]], // Sujatha Rani -> Surveying
      [facMap['CIV004'], [subMap['ACEC02'], subMap['ACEC13'], subMap['ACEC22']]], // Kiran Chandra -> SOM
      [facMap['CIV005'], [subMap['ACEC04'], subMap['ACEC06'], subMap['ACEC24'], subMap['ACEC32']]], // Padma Priya -> Geology, Geotech
      [facMap['CIV006'], [subMap['ACEC10'], subMap['ACEC11'], subMap['ACEC09'], subMap['ACEC35']]], // Ravi Shankar -> Concrete, Bldg
      [facMap['CIV007'], [subMap['AMEC01'], subMap['ACEC34'], subMap['ACEC45'], subMap['ACEC46']]], // Annapurna Devi -> Env Eng, Project
      [facMap['CIV008'], [subMap['ACEC33'], subMap['ACEC44'], subMap['ACEC55']]], // Mahesh Varma -> Transport, Project

      // ME Faculty -> Workshop
      [facMap['ME001'], [subMap['AMEC04'], subMap['AMEC01']]], // Subramanyam -> Workshop, Engg Mechanics
      [facMap['ME002'], [subMap['AMEC02'], subMap['AMEC04']]], // Durga Prasad -> Manufacturing
      [facMap['ME003'], [subMap['AMEC03'], subMap['AMEC02']]], // Shankar Reddy -> CAD

      // EEE Faculty -> Basic EE
      [facMap['EEE001'], [subMap['AEEC01'], subMap['AEEC04'], subMap['AEEC02'], subMap['AEEC03']]], // Chandrasekhar -> BEE
      [facMap['EEE002'], [subMap['AECC21'], subMap['AEEC01'], subMap['AECC08']]], // Lalitha Kumari -> Control Systems, BEE

      // Cross-assignments for common subjects
      [facMap['CSE001'], [subMap['ACSC09'], subMap['ACSC14'], subMap['ACSC09']]], // Anand Kumar -> ExEEd
      [facMap['ECE001'], [subMap['ACSC09']]], // Lakshmi Devi -> ExEEd
      [facMap['CIV001'], [subMap['ACSC09'], subMap['ACSC14']]], // Venkateshwara Rao -> ExEEd
      [facMap['CSE002'], [subMap['ACSC23'], subMap['ACSC29'], subMap['ACSC22']]], // Priya -> OOP Dev, Algo Design, Competitive Prog
    ];

    // Flatten and deduplicate faculty-subject links
    const fsLinks = [];
    const seen = new Set();
    for (const [facId, subIds] of facultySubjectLinks) {
      if (!facId) continue;
      for (const subId of subIds) {
        if (!subId) continue;
        const key = `${facId}-${subId}`;
        if (!seen.has(key)) {
          seen.add(key);
          fsLinks.push(facId, subId);
        }
      }
    }

    if (fsLinks.length > 0) {
      const placeholders = [];
      for (let i = 0; i < fsLinks.length; i += 2) {
        placeholders.push(`($${i+1}, $${i+2})`);
      }
      await client.query(
        `INSERT INTO faculty_subjects (faculty_id, subject_id) VALUES ${placeholders.join(', ')}`,
        fsLinks
      );
    }

    await client.query('COMMIT');

    // Print summary
    const counts = await client.query(`
      SELECT 'faculty' as tbl, count(*) FROM faculty
      UNION ALL SELECT 'subjects', count(*) FROM subjects
      UNION ALL SELECT 'branches', count(*) FROM branches
      UNION ALL SELECT 'classes', count(*) FROM classes
      UNION ALL SELECT 'time_slots', count(*) FROM time_slots
      UNION ALL SELECT 'faculty_subjects', count(*) FROM faculty_subjects
      UNION ALL SELECT 'class_subjects', count(*) FROM class_subjects
    `);
    console.log('\n=== Seed Summary ===');
    counts.rows.forEach(r => console.log(`  ${r.tbl}: ${r.count}`));
    console.log('\nDefault password: password123');
    console.log('Users: admin, hod_cse, hod_ece, hod_civil, principal\n');

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
