import { Router } from 'express';
import { query } from '../config/database.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();
router.use(authMiddleware);

router.get('/', async (req, res, next) => {
  try {
    const result = await query('SELECT * FROM subjects ORDER BY code');
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const result = await query('SELECT * FROM subjects WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Subject not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const { code, name, credits, weeklyHours, type } = req.body;
    if (!code || !name) {
      return res.status(400).json({ error: 'Code and name are required' });
    }
    const result = await query(
      'INSERT INTO subjects (code, name, credits, weekly_hours, type) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [code, name, credits || 0, weeklyHours || 0, type || 'THEORY']
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err.code === '23505') {
      return res.status(400).json({ error: 'Subject code already exists' });
    }
    next(err);
  }
});

router.put('/:id', async (req, res, next) => {
  try {
    const { code, name, credits, weeklyHours, type } = req.body;
    const result = await query(
      `UPDATE subjects SET
        code = COALESCE($1, code),
        name = COALESCE($2, name),
        credits = COALESCE($3, credits),
        weekly_hours = COALESCE($4, weekly_hours),
        type = COALESCE($5, type)
       WHERE id = $6 RETURNING *`,
      [code, name, credits, weeklyHours, type, req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Subject not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const result = await query('DELETE FROM subjects WHERE id = $1 RETURNING id', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Subject not found' });
    }
    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    next(err);
  }
});

export default router;
