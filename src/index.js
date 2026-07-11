import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync } from 'fs';

import { errorHandler } from './middleware/errorHandler.js';
import authRoutes from './routes/auth.js';
import facultyRoutes from './routes/faculty.js';
import subjectRoutes from './routes/subjects.js';
import classRoutes from './routes/classes.js';
import branchRoutes from './routes/branches.js';
import timeslotRoutes from './routes/timeslots.js';
import timeTableRoutes from './routes/time_tables.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/faculty', facultyRoutes);
app.use('/api/subjects', subjectRoutes);
app.use('/api/classes', classRoutes);
app.use('/api/branches', branchRoutes);
app.use('/api/timeslots', timeslotRoutes);
app.use('/api/time_tables', timeTableRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Serve static files from frontend dist (production only)
const distPath = join(__dirname, '../../frontend/dist');
if (existsSync(distPath)) {
  app.use(express.static(distPath));
  // SPA fallback
  app.get('*', (req, res) => {
    res.sendFile(join(distPath, 'index.html'));
  });
}

// Error handler
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
