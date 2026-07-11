import 'dotenv/config';
import pool from './database.js';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

async function generateAll() {
  const client = await pool.connect();
  try {
    // Get all classes for semesters 1-6
    const classesRes = await client.query(`
      SELECT c.*, b.name as branch_name, b.id as branch_id
      FROM classes c JOIN branches b ON c.branch_id = b.id
      WHERE c.semester <= 6
      ORDER BY c.id
    `);
    const classes = classesRes.rows;
    console.log(`\nGenerating timetables for ${classes.length} classes...\n`);

    let totalInserted = 0;
    let totalConflicts = 0;

    for (const classInfo of classes) {
      const classId = classInfo.id;
      const branchId = classInfo.branch_id;
      const academicYear = '2024-25';
      const semester = String(classInfo.semester);

      // Get subjects
      const subjectsRes = await client.query(`
        SELECT s.id, s.code, s.name, s.weekly_hours, s.type
        FROM subjects s JOIN class_subjects cs ON s.id = cs.subject_id
        WHERE cs.class_id = $1
        ORDER BY s.weekly_hours DESC, s.type DESC
      `, [classId]);
      const subjects = subjectsRes.rows;

      if (!subjects.length) {
        console.log(`  ${classInfo.name}: No subjects, skipping`);
        continue;
      }

      // Get faculty
      const facultyRes = await client.query(`
        SELECT f.id, f.full_name, fs.subject_id
        FROM faculty f JOIN faculty_subjects fs ON f.id = fs.faculty_id
        WHERE fs.subject_id = ANY($1)
      `, [subjects.map(s => s.id)]);
      const faculty = facultyRes.rows;

      if (!faculty.length) {
        console.log(`  ${classInfo.name}: No faculty, skipping`);
        continue;
      }

      // Get time slots
      const slotsRes = await client.query('SELECT id, day_of_week, start_time, end_time, slot_label FROM time_slots ORDER BY day_of_week, start_time');
      const slots = slotsRes.rows;

      // Delete existing entries for this class
      await client.query(
        'DELETE FROM time_tables WHERE class_id = $1 AND academic_year = $2 AND semester = $3',
        [classId, academicYear, semester]
      );

      // Load existing faculty assignments from other classes
      const existingRes = await client.query(
        'SELECT faculty_id, time_slot_id FROM time_tables WHERE class_id != $1 AND academic_year = $2',
        [classId, academicYear]
      );

      // Build lookups
      const facultyBySubject = {};
      faculty.forEach(f => {
        if (!facultyBySubject[f.subject_id]) facultyBySubject[f.subject_id] = [];
        facultyBySubject[f.subject_id].push(f.id);
      });

      const slotsByDay = {};
      for (const slot of slots) {
        if (!slotsByDay[slot.day_of_week]) slotsByDay[slot.day_of_week] = [];
        slotsByDay[slot.day_of_week].push(slot);
      }
      const days = Object.keys(slotsByDay).map(Number).sort();

      const isAfternoon = (s) => s.start_time.substring(0, 5) >= '14:00';
      const isLabAfternoon = (s) => s.start_time.substring(0, 5) >= '16:00';

      // Build tasks
      const labTasks = [];
      const theoryTasks = [];
      for (const subject of subjects) {
        const eligibleFaculty = facultyBySubject[subject.id];
        if (!eligibleFaculty || eligibleFaculty.length === 0) continue;
        if (subject.type === 'LAB') {
          labTasks.push({ subject, sessions: 2, eligibleFaculty });
        } else {
          theoryTasks.push({ subject, slotsNeeded: subject.weekly_hours || 1, eligibleFaculty });
        }
      }
      labTasks.sort((a, b) => b.sessions - a.sessions);
      theoryTasks.sort((a, b) => b.slotsNeeded - a.slotsNeeded);

      // State
      const classSlotUsed = new Set();
      const facultySlotUsed = new Set();
      const subjectDayUsed = new Set();
      existingRes.rows.forEach(a => facultySlotUsed.add(`${a.faculty_id}-${a.time_slot_id}`));
      const facultyLoad = {};
      const dayLoad = {};
      const assignments = [];

      const getSortedFaculty = (eligible) => [...eligible].sort((a, b) => (facultyLoad[a] || 0) - (facultyLoad[b] || 0));

      const getMorningTriples = (day) => {
        const morning = (slotsByDay[day] || []).filter(s => !isAfternoon(s))
          .sort((a, b) => a.start_time.localeCompare(b.start_time));
        const triples = [];
        for (let i = 0; i <= morning.length - 3; i++) triples.push([morning[i], morning[i + 1], morning[i + 2]]);
        return triples;
      };

      const getLastAfternoonPair = (day) => {
        const afternoon = (slotsByDay[day] || []).filter(isAfternoon)
          .sort((a, b) => a.start_time.localeCompare(b.start_time));
        if (afternoon.length >= 2) return [[afternoon[afternoon.length - 2], afternoon[afternoon.length - 1]]];
        return [];
      };

      // Place labs (greedy)
      let labIdx = 0;
      for (const task of labTasks) {
        let sessionsPlaced = 0;
        const shuffledDays = [...days].sort(() => (dayLoad[Math.random()] || 0) - 0.5);
        for (const day of shuffledDays) {
          if (sessionsPlaced >= task.sessions) break;
          if (subjectDayUsed.has(`${task.subject.id}-${day}`)) continue;
          const options = labIdx % 2 === 0
            ? (sessionsPlaced === 0 ? getMorningTriples(day) : getLastAfternoonPair(day))
            : (sessionsPlaced === 0 ? getLastAfternoonPair(day) : getMorningTriples(day));
          for (const slotGroup of options) {
            if (slotGroup.some(s => classSlotUsed.has(`${classId}-${s.id}`))) continue;
            const facId = getSortedFaculty(task.eligibleFaculty).find(f => !slotGroup.some(s => facultySlotUsed.has(`${f}-${s.id}`)));
            if (!facId) continue;
            slotGroup.forEach(s => {
              assignments.push({ branchId, subjectId: task.subject.id, facultyId: facId, classId, timeSlotId: s.id, academicYear, semester, variation: 1 });
              classSlotUsed.add(`${classId}-${s.id}`);
              facultySlotUsed.add(`${facId}-${s.id}`);
            });
            subjectDayUsed.add(`${task.subject.id}-${day}`);
            facultyLoad[facId] = (facultyLoad[facId] || 0) + slotGroup.length;
            dayLoad[day] = (dayLoad[day] || 0) + slotGroup.length;
            sessionsPlaced++;
            break;
          }
        }
        labIdx++;
      }

      // Place theory (greedy)
      for (const task of theoryTasks) {
        let placed = 0;
        const sortedDays = [...days].sort((a, b) => (dayLoad[a] || 0) - (dayLoad[b] || 0));
        for (const day of sortedDays) {
          if (placed >= task.slotsNeeded) break;
          if (subjectDayUsed.has(`${task.subject.id}-${day}`)) continue;
          const theorySlots = (slotsByDay[day] || []).filter(s => !isLabAfternoon(s) && !classSlotUsed.has(`${classId}-${s.id}`));
          if (!theorySlots.length) continue;
          const slot = theorySlots[0];
          const facId = getSortedFaculty(task.eligibleFaculty).find(f => !facultySlotUsed.has(`${f}-${slot.id}`));
          if (!facId) continue;
          assignments.push({ branchId, subjectId: task.subject.id, facultyId: facId, classId, timeSlotId: slot.id, academicYear, semester, variation: 1 });
          classSlotUsed.add(`${classId}-${slot.id}`);
          facultySlotUsed.add(`${facId}-${slot.id}`);
          subjectDayUsed.add(`${task.subject.id}-${day}`);
          facultyLoad[facId] = (facultyLoad[facId] || 0) + 1;
          dayLoad[day] = (dayLoad[day] || 0) + 1;
          placed++;
        }
      }

      // Insert
      const inserted = [];
      for (const entry of assignments) {
        try {
          const result = await client.query(
            `INSERT INTO time_tables (branch_id, subject_id, faculty_id, class_id, time_slot_id, academic_year, semester, variation, status)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'DRAFT') RETURNING *`,
            [entry.branchId, entry.subjectId, entry.facultyId, entry.classId, entry.timeSlotId, entry.academicYear, entry.semester, entry.variation]
          );
          inserted.push(result.rows[0]);
        } catch (e) { /* skip duplicates */ }
      }

      totalInserted += inserted.length;
      console.log(`  ${classInfo.name} (${classInfo.branch_name} Y${classInfo.year} S${classInfo.semester}): ${inserted.length} entries`);
    }

    console.log(`\n=== Generation Complete ===`);
    console.log(`  Total entries: ${totalInserted}`);

    const ttCount = await client.query('SELECT count(*) FROM time_tables');
    console.log(`  DB time_tables count: ${ttCount.rows[0].count}\n`);

  } catch (err) {
    console.error('Generation error:', err);
    process.exit(1);
  } finally {
    client.release();
    process.exit(0);
  }
}

generateAll();
