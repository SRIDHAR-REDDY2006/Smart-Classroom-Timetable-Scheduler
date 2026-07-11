import { Router } from 'express';
import { query } from '../config/database.js';
import { authMiddleware, requireRole } from '../middleware/auth.js';

const router = Router();
router.use(authMiddleware);

// Get all time_tables with full details
router.get('/', async (req, res, next) => {
  try {
    const { branchId, academicYear, semester, classId, status } = req.query;
    let sql = `
      SELECT t.*,
        b.name as branch_name,
        s.code as subject_code, s.name as subject_name, s.type as subject_type,
        f.full_name as faculty_name, f.employee_id as faculty_employee_id,
        c.name as class_name, c.year as year, c.semester as class_semester,
        ts.day_of_week, ts.start_time, ts.end_time, ts.slot_label
      FROM time_tables t
      JOIN branches b ON t.branch_id = b.id
      JOIN subjects s ON t.subject_id = s.id
      JOIN faculty f ON t.faculty_id = f.id
      JOIN classes c ON t.class_id = c.id
      JOIN time_slots ts ON t.time_slot_id = ts.id
      WHERE 1=1
    `;
    const params = [];
    if (branchId) { params.push(branchId); sql += ` AND t.branch_id = $${params.length}`; }
    if (academicYear) { params.push(academicYear); sql += ` AND t.academic_year = $${params.length}`; }
    if (semester) { params.push(semester); sql += ` AND t.semester = $${params.length}`; }
    if (classId) { params.push(classId); sql += ` AND t.class_id = $${params.length}`; }
    if (status) { params.push(status); sql += ` AND t.status = $${params.length}`; }
    sql += ' ORDER BY c.name, ts.day_of_week, ts.start_time';

    const result = await query(sql, params);
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

// Get pending approvals
router.get('/pending', async (req, res, next) => {
  try {
    const userRole = req.user.role;
    let statusFilter;
    if (userRole === 'HOD') statusFilter = 'DRAFT';
    else if (userRole === 'PRINCIPAL') statusFilter = 'HOD_APPROVED';
    else statusFilter = 'DRAFT';

    const result = await query(`
      SELECT t.*,
        b.name as branch_name,
        s.code as subject_code, s.name as subject_name,
        f.full_name as faculty_name,
        c.name as class_name,
        ts.day_of_week, ts.slot_label
      FROM time_tables t
      JOIN branches b ON t.branch_id = b.id
      JOIN subjects s ON t.subject_id = s.id
      JOIN faculty f ON t.faculty_id = f.id
      JOIN classes c ON t.class_id = c.id
      JOIN time_slots ts ON t.time_slot_id = ts.id
      WHERE t.status = $1
      ORDER BY t.created_at DESC
    `, [statusFilter]);

    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

// Create time_table entry
router.post('/', async (req, res, next) => {
  try {
    const { branchId, subjectId, facultyId, classId, timeSlotId, academicYear, semester, variation } = req.body;
    if (!branchId || !subjectId || !facultyId || !classId || !timeSlotId || !academicYear || !semester) {
      return res.status(400).json({ error: 'All fields required except variation' });
    }
    const result = await query(
      `INSERT INTO time_tables (branch_id, subject_id, faculty_id, class_id, time_slot_id, academic_year, semester, variation, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'DRAFT') RETURNING *`,
      [branchId, subjectId, facultyId, classId, timeSlotId, academicYear, semester, variation || 1]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err.code === '23505') {
      return res.status(400).json({ error: 'Conflict: This slot is already taken' });
    }
    next(err);
  }
});

// Update time_table entry
router.put('/:id', async (req, res, next) => {
  try {
    const { branchId, subjectId, facultyId, classId, timeSlotId, academicYear, semester, variation } = req.body;
    const result = await query(
      `UPDATE time_tables SET
        branch_id = COALESCE($1, branch_id),
        subject_id = COALESCE($2, subject_id),
        faculty_id = COALESCE($3, faculty_id),
        class_id = COALESCE($4, class_id),
        time_slot_id = COALESCE($5, time_slot_id),
        academic_year = COALESCE($6, academic_year),
        semester = COALESCE($7, semester),
        variation = COALESCE($8, variation),
        updated_at = CURRENT_TIMESTAMP
       WHERE id = $9 RETURNING *`,
      [branchId, subjectId, facultyId, classId, timeSlotId, academicYear, semester, variation, req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Time table entry not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

// Delete time_table entry
router.delete('/:id', async (req, res, next) => {
  try {
    const result = await query('DELETE FROM time_tables WHERE id = $1 RETURNING id', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Time table entry not found' });
    }
    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    next(err);
  }
});

// Approve
router.patch('/:id/approve', async (req, res, next) => {
  try {
    const userRole = req.user.role;
    const currentResult = await query('SELECT status FROM time_tables WHERE id = $1', [req.params.id]);
    if (currentResult.rows.length === 0) return res.status(404).json({ error: 'Not found' });

    const currentStatus = currentResult.rows[0].status;
    let newStatus;
    if (userRole === 'HOD' && currentStatus === 'DRAFT') newStatus = 'HOD_APPROVED';
    else if (userRole === 'PRINCIPAL' && currentStatus === 'HOD_APPROVED') newStatus = 'FINALIZED';
    else return res.status(400).json({ error: 'Cannot approve this entry' });

    const result = await query(
      'UPDATE time_tables SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
      [newStatus, req.params.id]
    );
    res.json(result.rows[0]);
  } catch (err) { next(err); }
});

// Reject
router.patch('/:id/reject', async (req, res, next) => {
  try {
    const result = await query(
      "UPDATE time_tables SET status = 'REJECTED', updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *",
      [req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) { next(err); }
});

// Auto-generate timetable for a specific class using constraint-based backtracking
// All time slots are uniform 55-min intervals.
// Theory: placed in morning slots (9-12), 1 slot per weekly_hour
// Lab: placed in afternoon slots (2-5) as 2 consecutive slots per session
router.post('/generate', async (req, res, next) => {
  try {
    const { academicYear, semester, classId } = req.body;
    if (!academicYear || !semester || !classId) {
      return res.status(400).json({ error: 'Academic year, semester, and classId are required' });
    }

    // Get the class with branch info
    const classRes = await query(`
      SELECT c.*, b.id as branch_id, b.name as branch_name
      FROM classes c
      JOIN branches b ON c.branch_id = b.id
      WHERE c.id = $1
    `, [classId]);

    if (classRes.rows.length === 0) {
      return res.status(404).json({ error: 'Class not found' });
    }
    const classInfo = classRes.rows[0];
    const branchId = classInfo.branch_id;

    // Get subjects for this class from class_subjects
    const subjectsRes = await query(`
      SELECT s.id, s.code, s.name, s.weekly_hours, s.type
      FROM subjects s
      JOIN class_subjects cs ON s.id = cs.subject_id
      WHERE cs.class_id = $1
      ORDER BY s.weekly_hours DESC, s.type DESC
    `, [classId]);
    const subjects = subjectsRes.rows;

    // Get faculty who can teach these subjects
    const facultyRes = await query(`
      SELECT f.id, f.full_name, fs.subject_id
      FROM faculty f
      JOIN faculty_subjects fs ON f.id = fs.faculty_id
      WHERE fs.subject_id = ANY($1)
    `, [subjects.map(s => s.id)]);
    const faculty = facultyRes.rows;

    // Get time slots grouped by day
    const slotsRes = await query('SELECT id, day_of_week, start_time, end_time, slot_label FROM time_slots ORDER BY day_of_week, start_time');
    const slots = slotsRes.rows;

    if (!subjects.length) {
      return res.status(400).json({ error: 'No subjects assigned to this class. Add subjects in class_subjects.' });
    }
    if (!faculty.length) {
      return res.status(400).json({ error: 'No faculty available for this class\'s subjects' });
    }
    if (!slots.length) {
      return res.status(400).json({ error: 'No time slots defined' });
    }

    // Delete existing entries for this class + academicYear + semester
    await query(
      'DELETE FROM time_tables WHERE class_id = $1 AND academic_year = $2 AND semester = $3',
      [classId, academicYear, semester]
    );

    // Load existing faculty assignments from OTHER classes to avoid cross-class double-booking
    const existingAssignments = await query(`
      SELECT faculty_id, time_slot_id FROM time_tables
      WHERE class_id != $1 AND academic_year = $2
    `, [classId, academicYear]);

    // Build faculty lookup: subject_id -> [faculty ids]
    const facultyBySubject = {};
    faculty.forEach(f => {
      if (!facultyBySubject[f.subject_id]) facultyBySubject[f.subject_id] = [];
      facultyBySubject[f.subject_id].push(f.id);
    });

    // Build slot lookup: day -> [slots sorted by start_time]
    const slotsByDay = {};
    for (const slot of slots) {
      if (!slotsByDay[slot.day_of_week]) slotsByDay[slot.day_of_week] = [];
      slotsByDay[slot.day_of_week].push(slot);
    }
    const days = Object.keys(slotsByDay).map(Number).sort();

    // Morning = before 14:00, Afternoon = 14:00 onward
    const isAfternoon = (slot) => slot.start_time.substring(0, 5) >= '14:00';

    // Build a slot index map for finding consecutive afternoon slots
    const slotById = {};
    slots.forEach(s => { slotById[s.id] = s; });

    // Build task list
    // Lab: 2 days/week, each day either 3 consecutive morning slots or last 2 afternoon slots
    // Theory: 1 morning slot per weekly_hour
    const labTasks = [];
    const theoryTasks = [];
    for (const subject of subjects) {
      const eligibleFaculty = facultyBySubject[subject.id];
      if (!eligibleFaculty || eligibleFaculty.length === 0) continue;

      if (subject.type === 'LAB') {
        labTasks.push({ subject, sessions: 2, eligibleFaculty });
      } else {
        const slotsNeeded = subject.weekly_hours || 1;
        theoryTasks.push({ subject, slotsNeeded, eligibleFaculty });
      }
    }

    // Labs first (harder to place), then theory by most hours
    labTasks.sort((a, b) => b.sessions - a.sessions);
    theoryTasks.sort((a, b) => b.slotsNeeded - a.slotsNeeded);
    const tasks = [...labTasks, ...theoryTasks];

    // State tracking
    const classSlotUsed = new Set();
    const facultySlotUsed = new Set();
    const subjectDayUsed = new Set();
    existingAssignments.rows.forEach(a => {
      facultySlotUsed.add(`${a.faculty_id}-${a.time_slot_id}`);
    });
    const facultyLoad = {};
    const dayLoad = {};
    const assignments = [];

    const getSortedFaculty = (eligible) => {
      return [...eligible].sort((a, b) => (facultyLoad[a] || 0) - (facultyLoad[b] || 0));
    };

    // Slots reserved for labs only (last 2 afternoon)
    const isLabAfternoon = (slot) => slot.start_time.substring(0, 5) >= '16:00';

    // Get 3 consecutive morning slots for a given day
    const getMorningTriples = (day) => {
      const morning = (slotsByDay[day] || []).filter(s => !isAfternoon(s))
        .sort((a, b) => a.start_time.localeCompare(b.start_time));
      const triples = [];
      for (let i = 0; i <= morning.length - 3; i++) {
        triples.push([morning[i], morning[i + 1], morning[i + 2]]);
      }
      return triples;
    };

    // Get the last 2 afternoon slots for a given day
    const getLastAfternoonPair = (day) => {
      const afternoon = (slotsByDay[day] || []).filter(isAfternoon)
        .sort((a, b) => a.start_time.localeCompare(b.start_time));
      if (afternoon.length >= 2) {
        return [[afternoon[afternoon.length - 2], afternoon[afternoon.length - 1]]];
      }
      return [];
    };

    // ---- GREEDY PLACEMENT ----

    // Place labs first: 2 sessions per lab, alternating morning/afternoon for variety
    let labSubjectIdx = 0;
    for (const task of labTasks) {
      let sessionsPlaced = 0;
      // Shuffle days for variety across different lab subjects
      const shuffledDays = [...days].sort(() => (dayLoad[Math.random()] || 0) - 0.5);

      for (const day of shuffledDays) {
        if (sessionsPlaced >= task.sessions) break;
        if (subjectDayUsed.has(`${task.subject.id}-${day}`)) continue;

        // Alternate: odd-indexed lab subjects try afternoon first, even try morning first
        let options;
        if (labSubjectIdx % 2 === 0) {
          // Even: session 0 = morning, session 1 = afternoon
          options = sessionsPlaced === 0 ? [...getMorningTriples(day)] : [...getLastAfternoonPair(day)];
        } else {
          // Odd: session 0 = afternoon, session 1 = morning
          options = sessionsPlaced === 0 ? [...getLastAfternoonPair(day)] : [...getMorningTriples(day)];
        }

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
      labSubjectIdx++;
    }

    // Place theory: spread across days, use morning + first 2 afternoon (not last 2)
    for (const task of theoryTasks) {
      let placed = 0;
      const sortedDays = [...days].sort((a, b) => (dayLoad[a] || 0) - (dayLoad[b] || 0));

      for (const day of sortedDays) {
        if (placed >= task.slotsNeeded) break;
        if (subjectDayUsed.has(`${task.subject.id}-${day}`)) continue;

        // Get available theory-eligible slots for this day
        const theorySlots = (slotsByDay[day] || [])
          .filter(s => !isLabAfternoon(s))
          .filter(s => !classSlotUsed.has(`${classId}-${s.id}`));

        if (theorySlots.length === 0) continue;

        const slot = theorySlots[0]; // pick first available
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

    // Report conflicts for subjects with insufficient placement
    const conflicts = [];
    for (const task of tasks) {
      const expected = task.subject.type === 'LAB' ? task.sessions * 2 : task.slotsNeeded;
      const count = assignments.filter(a => a.subjectId === task.subject.id).length;
      if (count < expected) {
        conflicts.push({
          subject: task.subject.code,
          reason: count === 0 ? 'Could not schedule' : `Only ${count}/${expected} slots placed`
        });
      }
    }

    // Insert all assignments
    const inserted = [];
    for (const entry of assignments) {
      try {
        const result = await query(
          `INSERT INTO time_tables (branch_id, subject_id, faculty_id, class_id, time_slot_id, academic_year, semester, variation, status)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'DRAFT') RETURNING *`,
          [entry.branchId, entry.subjectId, entry.facultyId, entry.classId, entry.timeSlotId, entry.academicYear, entry.semester, entry.variation]
        );
        inserted.push(result.rows[0]);
      } catch (e) {
        // Skip duplicates
      }
    }

    res.json({
      message: `Generated ${inserted.length} entries for ${classInfo.name} (${classInfo.branch_name} Y${classInfo.year} S${classInfo.semester})`,
      inserted: inserted.length,
      totalSubjects: subjects.length,
      success: conflicts.length === 0,
      conflicts
    });
  } catch (err) {
    next(err);
  }
});

export default router;
