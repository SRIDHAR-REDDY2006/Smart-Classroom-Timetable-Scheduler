import React, { useState, useEffect } from 'react';
import api from '../api';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function TimeTables() {
  const [timetables, setTimetables] = useState([]);
  const [branches, setBranches] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [faculty, setFaculty] = useState([]);
  const [classes, setClasses] = useState([]);
  const [timeSlots, setTimeSlots] = useState([]);
  const [loading, setLoading] = useState(true);

  const [viewMode, setViewMode] = useState('grid');

  // Filters
  const [filterBranch, setFilterBranch] = useState('');
  const [filterYear, setFilterYear] = useState('');
  const [filterSemester, setFilterSemester] = useState('');
  const [filterClass, setFilterClass] = useState('');

  // Generate modal
  const [showGenModal, setShowGenModal] = useState(false);
  const [genAcademicYear, setGenAcademicYear] = useState('2024-25');
  const [genClassId, setGenClassId] = useState('');
  const [generating, setGenerating] = useState(false);
  const [genResult, setGenResult] = useState(null);

  // Add/edit entry modal
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState({
    branchId: '', subjectId: '', facultyId: '', classId: '', timeSlotId: '',
    academicYear: '2024-25', semester: '1', variation: 1
  });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [ttRes, branchRes, subRes, facRes, clsRes, slotRes] = await Promise.all([
        api.get('/time_tables'),
        api.get('/branches'),
        api.get('/subjects'),
        api.get('/faculty'),
        api.get('/classes'),
        api.get('/timeslots')
      ]);
      setTimetables(ttRes.data);
      setBranches(branchRes.data);
      setSubjects(subRes.data);
      setFaculty(facRes.data);
      setClasses(clsRes.data);
      setTimeSlots(slotRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  // Cascading filter: classes available based on current filter selections
  const filteredClasses = classes.filter(c => {
    if (filterBranch && c.branch_id != filterBranch) return false;
    if (filterYear && c.year != filterYear) return false;
    if (filterSemester && c.semester != filterSemester) return false;
    return true;
  });

  // Filtered timetables for display
  const displayTimetables = timetables.filter(t => {
    if (filterBranch && t.branch_id != filterBranch) return false;
    if (filterYear && t.year != filterYear) return false;
    if (filterSemester && t.semester != filterSemester) return false;
    if (filterClass && t.class_id != filterClass) return false;
    return true;
  });

  const clearFilters = () => {
    setFilterBranch('');
    setFilterYear('');
    setFilterSemester('');
    setFilterClass('');
  };

  // Get unique time slot labels (use Monday as template)
  const uniqueSlotLabels = (() => {
    const map = new Map();
    timeSlots
      .filter(s => s.day_of_week === 1)
      .sort((a, b) => a.start_time.localeCompare(b.start_time))
      .forEach(s => map.set(s.slot_label, s));
    return [...map.values()];
  })();

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!genClassId) return;
    setGenerating(true);
    setGenResult(null);
    try {
      const cls = classes.find(c => c.id == genClassId);
      const res = await api.post('/time_tables/generate', {
        academicYear: genAcademicYear,
        semester: String(cls.semester),
        classId: genClassId
      });
      setGenResult(res.data);
      loadData();
    } catch (err) {
      setGenResult({ error: err.response?.data?.error || 'Generation failed' });
    } finally {
      setGenerating(false);
    }
  };

  const openModal = (item = null) => {
    setEditItem(item);
    setForm(item ? {
      branchId: item.branch_id, subjectId: item.subject_id, facultyId: item.faculty_id,
      classId: item.class_id, timeSlotId: item.time_slot_id,
      academicYear: item.academic_year, semester: item.semester, variation: item.variation
    } : {
      branchId: '', subjectId: '', facultyId: '', classId: '', timeSlotId: '',
      academicYear: '2024-25', semester: '1', variation: 1
    });
    setError('');
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      if (editItem) await api.put(`/time_tables/${editItem.id}`, form);
      else await api.post('/time_tables', form);
      setShowModal(false);
      loadData();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this entry?')) return;
    try { await api.delete(`/time_tables/${id}`); loadData(); }
    catch (err) { alert(err.response?.data?.error || 'Failed to delete'); }
  };

  // Gen modal: filtered classes by semester
  const genClasses = classes.slice().sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div>
      <div className="page-header">
        <h1>Time Tables</h1>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button className={`btn ${viewMode === 'grid' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setViewMode('grid')}>Grid</button>
          <button className={`btn ${viewMode === 'list' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setViewMode('list')}>List</button>
          <button className="btn btn-primary" onClick={() => openModal()}>+ Add Entry</button>
          <button className="btn btn-primary" onClick={() => { setShowGenModal(true); setGenResult(null); setGenClassId(''); }}>Generate</button>
        </div>
      </div>

      {/* Filters */}
      <div className="card" style={{ marginBottom: '1rem' }}>
        <div className="card-body">
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
            <div className="form-group" style={{ marginBottom: 0, minWidth: 140 }}>
              <label>Branch</label>
              <select value={filterBranch} onChange={(e) => { setFilterBranch(e.target.value); setFilterClass(''); }}>
                <option value="">All</option>
                {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </div>
            <div className="form-group" style={{ marginBottom: 0, minWidth: 100 }}>
              <label>Year</label>
              <select value={filterYear} onChange={(e) => { setFilterYear(e.target.value); setFilterClass(''); }}>
                <option value="">All</option>
                {[1,2,3,4].map(y => <option key={y} value={y}>Year {y}</option>)}
              </select>
            </div>
            <div className="form-group" style={{ marginBottom: 0, minWidth: 110 }}>
              <label>Semester</label>
              <select value={filterSemester} onChange={(e) => { setFilterSemester(e.target.value); setFilterClass(''); }}>
                <option value="">All</option>
                {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s}>Sem {s}</option>)}
              </select>
            </div>
            <div className="form-group" style={{ marginBottom: 0, minWidth: 140 }}>
              <label>Class</label>
              <select value={filterClass} onChange={(e) => setFilterClass(e.target.value)}>
                <option value="">All</option>
                {filteredClasses.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <button className="btn btn-secondary" onClick={clearFilters}>Clear</button>
          </div>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="card"><div className="card-body" style={{ textAlign: 'center', padding: '3rem' }}>
          <div className="loading" style={{ width: '2rem', height: '2rem', borderWidth: '3px', margin: '0 auto 1rem' }}></div>
          <p>Loading...</p>
        </div></div>
      ) : viewMode === 'grid' ? (
        <div className="card">
          <div className="card-body" style={{ padding: 0, overflowX: 'auto' }}>
            <div className="timetable-grid">
              <div className="header">Time</div>
              {[1,2,3,4,5,6].map(day => (
                <div key={day} className="header">{DAYS[day]}</div>
              ))}

              {uniqueSlotLabels.map((slot) => {
                const isAfternoon = slot.start_time >= '14:00';
                return (
                  <React.Fragment key={`row-${slot.id}`}>
                    <div className="slot" style={isAfternoon ? { background: '#fef3c7', fontWeight: 500 } : {}}>
                      {slot.slot_label}
                    </div>
                    {[1,2,3,4,5,6].map(day => {
                      const daySlot = timeSlots.find(ts =>
                        ts.day_of_week === day && ts.start_time === slot.start_time && ts.end_time === slot.end_time
                      );
                      const entry = daySlot ? displayTimetables.find(t => t.time_slot_id === daySlot.id) : null;
                      const isLab = entry?.subject_type === 'LAB';
                      return (
                        <div key={`${slot.id}-${day}`} className="slot" style={isLab ? { background: '#ede9fe' } : {}}>
                          {entry ? (
                            <>
                              <strong>{entry.subject_code}</strong>
                              <span className={`badge ${isLab ? 'badge-lab' : 'badge-theory'}`}>
                                {isLab ? 'Lab' : 'Theory'}
                              </span>
                              <span style={{ fontSize: '0.7rem' }}>{entry.faculty_name}</span>
                            </>
                          ) : '-'}
                        </div>
                      );
                    })}
                  </React.Fragment>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        <div className="card">
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Class</th>
                  <th>Subject</th>
                  <th>Faculty</th>
                  <th>Day</th>
                  <th>Time</th>
                  <th>Status</th>
                  <th style={{ width: 100 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {displayTimetables.length === 0 ? (
                  <tr><td colSpan="7" className="empty-state">No schedules found</td></tr>
                ) : (
                  displayTimetables.map(item => (
                    <tr key={item.id}>
                      <td><strong>{item.class_name}</strong></td>
                      <td>
                        {item.subject_code}
                        <span className={`badge ${item.subject_type === 'LAB' ? 'badge-lab' : 'badge-theory'}`} style={{ marginLeft: '0.4rem' }}>
                          {item.subject_type === 'LAB' ? 'Lab' : 'Theory'}
                        </span>
                      </td>
                      <td>{item.faculty_name}</td>
                      <td>{DAYS[item.day_of_week]}</td>
                      <td>{item.slot_label}</td>
                      <td><span className={`badge badge-${item.status}`}>{item.status}</span></td>
                      <td>
                        <div className="actions">
                          <button className="btn btn-secondary btn-sm" onClick={() => openModal(item)}>Edit</button>
                          <button className="btn btn-danger btn-sm" onClick={() => handleDelete(item.id)}>Del</button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Generate Modal */}
      {showGenModal && (
        <div className="modal-overlay" onClick={() => !generating && setShowGenModal(false)}>
          <div className="modal" style={{ maxWidth: '500px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Generate Timetable</h2>
              {!generating && <button className="modal-close" onClick={() => setShowGenModal(false)}>&times;</button>}
            </div>
            <form onSubmit={handleGenerate}>
              <div className="modal-body">
                {generating ? (
                  <div style={{ textAlign: 'center', padding: '2rem' }}>
                    <div className="loading" style={{ width: '2.5rem', height: '2.5rem', borderWidth: '3px', margin: '0 auto 1rem' }}></div>
                    <p style={{ fontWeight: 500 }}>Generating timetable...</p>
                    <p style={{ color: '#6b7280', marginTop: '0.5rem' }}>Assigning subjects and faculty</p>
                  </div>
                ) : (
                  <>
                    {genResult && (
                      <div className={`alert ${genResult.error ? 'alert-danger' : 'alert-success'}`} style={{ marginBottom: '1rem' }}>
                        {genResult.error || genResult.message}
                        {genResult.conflicts?.length > 0 && (
                          <ul style={{ marginTop: '0.5rem', fontSize: '0.85rem' }}>
                            {genResult.conflicts.map((c, i) => <li key={i}>{c.subject} - {c.reason}</li>)}
                          </ul>
                        )}
                      </div>
                    )}
                    <div className="form-group">
                      <label>Academic Year *</label>
                      <input value={genAcademicYear} onChange={(e) => setGenAcademicYear(e.target.value)} required />
                    </div>
                    <div className="form-group">
                      <label>Class *</label>
                      <select value={genClassId} onChange={(e) => { setGenClassId(e.target.value); setGenResult(null); }} required>
                        <option value="">Select class</option>
                        {genClasses.map(c => {
                          const br = branches.find(b => b.id === c.branch_id);
                          return <option key={c.id} value={c.id}>{c.name} ({br?.name} Y{c.year} S{c.semester})</option>;
                        })}
                      </select>
                    </div>
                    {genClassId && (
                      <div style={{ marginTop: '0.5rem', padding: '0.75rem', background: '#f9fafb', borderRadius: '6px', fontSize: '0.85rem' }}>
                        <strong>Subjects for this class will be auto-loaded from curriculum.</strong>
                      </div>
                    )}
                  </>
                )}
              </div>
              {!generating && (
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowGenModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary" disabled={!genClassId}>Generate</button>
                </div>
              )}
            </form>
          </div>
        </div>
      )}

      {/* Add/Edit Entry Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editItem ? 'Edit' : 'Add'} Entry</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>&times;</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                {error && <div className="alert alert-danger">{error}</div>}
                <div className="form-group">
                  <label>Branch *</label>
                  <select value={form.branchId} onChange={(e) => setForm({ ...form, branchId: e.target.value })} required>
                    <option value="">Select</option>
                    {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Class *</label>
                  <select value={form.classId} onChange={(e) => setForm({ ...form, classId: e.target.value })} required>
                    <option value="">Select</option>
                    {classes.map(c => {
                      const br = branches.find(b => b.id === c.branch_id);
                      return <option key={c.id} value={c.id}>{c.name} ({br?.name})</option>;
                    })}
                  </select>
                </div>
                <div className="form-group">
                  <label>Subject *</label>
                  <select value={form.subjectId} onChange={(e) => setForm({ ...form, subjectId: e.target.value })} required>
                    <option value="">Select</option>
                    {subjects.map(s => <option key={s.id} value={s.id}>{s.code} - {s.name}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Faculty *</label>
                  <select value={form.facultyId} onChange={(e) => setForm({ ...form, facultyId: e.target.value })} required>
                    <option value="">Select</option>
                    {faculty.map(f => <option key={f.id} value={f.id}>{f.full_name}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Time Slot *</label>
                  <select value={form.timeSlotId} onChange={(e) => setForm({ ...form, timeSlotId: e.target.value })} required>
                    <option value="">Select</option>
                    {timeSlots.map(t => (
                      <option key={t.id} value={t.id}>{DAYS[t.day_of_week]} - {t.slot_label}</option>
                    ))}
                  </select>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label>Academic Year *</label>
                    <input value={form.academicYear} onChange={(e) => setForm({ ...form, academicYear: e.target.value })} required />
                  </div>
                  <div className="form-group">
                    <label>Semester *</label>
                    <input value={form.semester} onChange={(e) => setForm({ ...form, semester: e.target.value })} required />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
