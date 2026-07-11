import { useState, useEffect } from 'react';
import api from '../api';

export default function Dashboard() {
  const [stats, setStats] = useState({
    faculty: 0, subjects: 0, branches: 0, classes: 0, timetables: 0
  });

  useEffect(() => {
    Promise.all([
      api.get('/faculty'),
      api.get('/subjects'),
      api.get('/branches'),
      api.get('/classes'),
      api.get('/time_tables')
    ]).then(([faculty, subjects, branches, classes, timetables]) => {
      setStats({
        faculty: faculty.data.length,
        subjects: subjects.data.length,
        branches: branches.data.length,
        classes: classes.data.length,
        timetables: timetables.data.length
      });
    }).catch(console.error);
  }, []);

  return (
    <div>
      <div className="page-header"><h1>Dashboard</h1></div>
      <div className="stats-grid">
        <div className="stat-card"><h3>Branches</h3><div className="value">{stats.branches}</div></div>
        <div className="stat-card"><h3>Faculty</h3><div className="value">{stats.faculty}</div></div>
        <div className="stat-card"><h3>Subjects</h3><div className="value">{stats.subjects}</div></div>
        <div className="stat-card"><h3>Classes</h3><div className="value">{stats.classes}</div></div>
        <div className="stat-card"><h3>Scheduled</h3><div className="value">{stats.timetables}</div></div>
      </div>
      <div className="card">
        <div className="card-header"><h3>Quick Start</h3></div>
        <div className="card-body">
          <ol style={{ paddingLeft: '1.5rem', lineHeight: 2 }}>
            <li>Create <strong>Branches</strong> (AIML, ECE, CIVIL)</li>
            <li>Add <strong>Faculty</strong> and assign subjects to them</li>
            <li>Create <strong>Subjects</strong></li>
            <li>Create <strong>Classes</strong> linked to branches</li>
            <li>Define <strong>Time Slots</strong></li>
            <li>Go to <strong>Time Tables</strong> and generate for each class</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
