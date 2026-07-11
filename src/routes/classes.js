import { Router } from 'express';
import { query } from '../config/database.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();
router.use(authMiddleware);

router.get('/', async (req, res, next) => {
  try {
    const result = await query(`
      SELECT c.*, b.name as branch_name
      FROM classes c
      JOIN branches b ON c.branch_id = b.id
      ORDER BY b.name, c.year, c.semester
    `);
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const result = await query(`
      SELECT c.*, b.name as branch_name
      FROM classes c
      JOIN branches b ON c.branch_id = b.id
      WHERE c.id = $1
    `, [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Class not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

router.get('/:id/subjects', async (req, res, next) => {
  try {
    const result = await query(`
      SELECT s.* FROM subjects s
      JOIN class_subjects cs ON s.id = cs.subject_id
      WHERE cs.class_id = $1
      ORDER BY s.code
    `, [req.params.id]);
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const { name, branchId, year, semester } = req.body;
    if (!name || !branchId || !year || !semester) {
      return res.status(400).json({ error: 'Name, branch, year, and semester are required' });
    }
    const result = await query(
      'INSERT INTO classes (name, branch_id, year, semester) VALUES ($1, $2, $3, $4) RETURNING *',
      [name, branchId, year, semester]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

router.put('/:id', async (req, res, next) => {
  try {
    const { name, branchId, year, semester } = req.body;
    const result = await query(
      `UPDATE classes SET
        name = COALESCE($1, name),
        branch_id = COALESCE($2, branch_id),
        year = COALESCE($3, year),
        semester = COALESCE($4, semester)
       WHERE id = $5 RETURNING *`,
      [name, branchId, year, semester, req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Class not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const result = await query('DELETE FROM classes WHERE id = $1 RETURNING id', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Class not found' });
    }
    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    next(err);
  }
});

export default router;
