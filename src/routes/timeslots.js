import { Router } from 'express';
import { query } from '../config/database.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();
router.use(authMiddleware);

router.get('/', async (req, res, next) => {
  try {
    const result = await query(`
      SELECT * FROM time_slots
      ORDER BY day_of_week, start_time
    `);
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const result = await query('SELECT * FROM time_slots WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Time slot not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const { dayOfWeek, startTime, endTime, slotLabel, shift } = req.body;
    if (dayOfWeek === undefined || !startTime || !endTime || !slotLabel) {
      return res.status(400).json({ error: 'Day, start time, end time, and label required' });
    }
    const result = await query(
      'INSERT INTO time_slots (day_of_week, start_time, end_time, slot_label, shift) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [dayOfWeek, startTime, endTime, slotLabel, shift || 'MORNING']
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

router.put('/:id', async (req, res, next) => {
  try {
    const { dayOfWeek, startTime, endTime, slotLabel, shift } = req.body;
    const result = await query(
      `UPDATE time_slots SET
        day_of_week = COALESCE($1, day_of_week),
        start_time = COALESCE($2, start_time),
        end_time = COALESCE($3, end_time),
        slot_label = COALESCE($4, slot_label),
        shift = COALESCE($5, shift)
       WHERE id = $6 RETURNING *`,
      [dayOfWeek, startTime, endTime, slotLabel, shift, req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Time slot not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const result = await query('DELETE FROM time_slots WHERE id = $1 RETURNING id', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Time slot not found' });
    }
    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    next(err);
  }
});

export default router;
