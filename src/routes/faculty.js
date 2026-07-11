import { Router } from 'express';
import { query } from '../config/database.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();
router.use(authMiddleware);

router.get('/', async (req, res, next) => {
  try {
    const result = await query(`
      SELECT f.*, COALESCE(json_agg(s.id) FILTER (WHERE s.id IS NOT NULL), '[]') as subject_ids
      FROM faculty f
      LEFT JOIN faculty_subjects fs ON f.id = fs.faculty_id
      LEFT JOIN subjects s ON fs.subject_id = s.id
      GROUP BY f.id
      ORDER BY f.full_name
    `);
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const result = await query('SELECT * FROM faculty WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Faculty not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const { employeeId, fullName, email } = req.body;
    if (!employeeId || !fullName || !email) {
      return res.status(400).json({ error: 'All fields required' });
    }
    const result = await query(
      'INSERT INTO faculty (employee_id, full_name, email) VALUES ($1, $2, $3) RETURNING *',
      [employeeId, fullName, email]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err.code === '23505') {
      return res.status(400).json({ error: 'Employee ID already exists' });
    }
    next(err);
  }
});

router.put('/:id', async (req, res, next) => {
  try {
    const { employeeId, fullName, email } = req.body;
    const result = await query(
      `UPDATE faculty SET
        employee_id = COALESCE($1, employee_id),
        full_name = COALESCE($2, full_name),
        email = COALESCE($3, email)
       WHERE id = $4 RETURNING *`,
      [employeeId, fullName, email, req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Faculty not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const result = await query('DELETE FROM faculty WHERE id = $1 RETURNING id', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Faculty not found' });
    }
    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    next(err);
  }
});

// Update faculty subjects
router.put('/:id/subjects', async (req, res, next) => {
  try {
    const { subjectIds } = req.body;
    if (!Array.isArray(subjectIds)) {
      return res.status(400).json({ error: 'subjectIds must be an array' });
    }

    const client = await (await import('../config/database.js')).default.connect();
    try {
      await client.query('BEGIN');
      await client.query('DELETE FROM faculty_subjects WHERE faculty_id = $1', [req.params.id]);
      if (subjectIds.length > 0) {
        const values = subjectIds.map((sid, i) => `($1, $${i + 2})`).join(', ');
        await client.query(
          `INSERT INTO faculty_subjects (faculty_id, subject_id) VALUES ${values}`,
          [req.params.id, ...subjectIds]
        );
      }
      await client.query('COMMIT');
      res.json({ message: 'Subjects updated' });
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  } catch (err) {
    next(err);
  }
});

export default router;
