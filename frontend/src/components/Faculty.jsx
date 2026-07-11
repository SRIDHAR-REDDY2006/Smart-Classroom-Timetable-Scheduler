import { useState, useEffect, useRef } from 'react';
import api from '../api';

function SubjectDropdown({ subjects, selected, onChange }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const ref = useRef(null);

  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const filtered = subjects.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.code.toLowerCase().includes(search.toLowerCase())
  );

  const selectedNames = subjects
    .filter(s => selected.includes(s.id))
    .map(s => s.code)
    .join(', ');

  return (
    <div className="multi-select" ref={ref}>
      <div className="multi-select-trigger" onClick={() => setOpen(!open)}>
        <span className="multi-select-value">
          {selectedNames || 'Select subjects...'}
        </span>
        <span className="multi-select-arrow">&#9662;</span>
      </div>
      {open && (
        <div className="multi-select-dropdown">
          <input
            className="multi-select-search"
            placeholder="Search subjects..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            autoFocus
          />
          <div className="multi-select-options">
            {filtered.length === 0 ? (
              <div className="multi-select-option" style={{ color: '#999' }}>No subjects found</div>
            ) : (
              filtered.map((s) => (
                <label key={s.id} className="multi-select-option">
                  <input
                    type="checkbox"
                    checked={selected.includes(s.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        onChange([...selected, s.id]);
                      } else {
                        onChange(selected.filter(id => id !== s.id));
                      }
                    }}
                  />
                  <span>{s.code} - {s.name}</span>
                </label>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function Faculty() {
  const [items, setItems] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState({ employeeId: '', fullName: '', email: '' });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  // subject editing state per faculty row
  const [editingSubjects, setEditingSubjects] = useState(null);
  const [editingSubjectIds, setEditingSubjectIds] = useState([]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [facRes, subRes] = await Promise.all([
        api.get('/faculty'),
        api.get('/subjects')
      ]);
      setItems(facRes.data);
      setSubjects(subRes.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const openModal = (item = null) => {
    setEditItem(item);
    setForm(item ? { employeeId: item.employee_id, fullName: item.full_name, email: item.email } : { employeeId: '', fullName: '', email: '' });
    setError('');
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      if (editItem) {
        await api.put(`/faculty/${editItem.id}`, form);
      } else {
        await api.post('/faculty', form);
      }
      setShowModal(false);
      loadData();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this faculty member?')) return;
    try {
      await api.delete(`/faculty/${id}`);
      loadData();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete');
    }
  };

  const saveSubjects = async (facultyId, subjectIds) => {
    try {
      await api.put(`/faculty/${facultyId}/subjects`, { subjectIds });
      setEditingSubjects(null);
      loadData();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to save subjects');
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1>Faculty</h1>
        <button className="btn btn-primary" onClick={() => openModal()}>+ Add Faculty</button>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="card">
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Employee ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Subjects</th>
                <th style={{ width: 120 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="5" style={{ textAlign: 'center' }}>Loading...</td></tr>
              ) : items.length === 0 ? (
                <tr><td colSpan="5" className="empty-state">No faculty yet</td></tr>
              ) : (
                items.map((item) => (
                  <tr key={item.id}>
                    <td><strong>{item.employee_id}</strong></td>
                    <td>{item.full_name}</td>
                    <td>{item.email}</td>
                    <td style={{ minWidth: 250 }}>
                      {editingSubjects === item.id ? (
                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                          <SubjectDropdown
                            subjects={subjects}
                            selected={editingSubjectIds}
                            onChange={setEditingSubjectIds}
                          />
                          <button
                            className="btn btn-primary btn-sm"
                            onClick={() => saveSubjects(item.id, editingSubjectIds)}
                          >Save</button>
                          <button
                            className="btn btn-secondary btn-sm"
                            onClick={() => setEditingSubjects(null)}
                          >X</button>
                        </div>
                      ) : (
                        <div
                          className="subject-tags"
                          onClick={() => {
                            setEditingSubjects(item.id);
                            setEditingSubjectIds(item.subject_ids || []);
                          }}
                          style={{ cursor: 'pointer' }}
                        >
                          {item.subject_ids && item.subject_ids.length > 0 ? (
                            item.subject_ids.map(sid => {
                              const sub = subjects.find(s => s.id === sid);
                              return sub ? (
                                <span key={sid} className="subject-tag">{sub.code}</span>
                              ) : null;
                            })
                          ) : (
                            <span style={{ color: '#999' }}>Click to assign</span>
                          )}
                        </div>
                      )}
                    </td>
                    <td>
                      <div className="actions">
                        <button className="btn btn-secondary btn-sm" onClick={() => openModal(item)}>Edit</button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(item.id)}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editItem ? 'Edit' : 'Add'} Faculty</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>&times;</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                {error && <div className="alert alert-danger">{error}</div>}
                <div className="form-group">
                  <label>Employee ID *</label>
                  <input
                    value={form.employeeId}
                    onChange={(e) => setForm({ ...form, employeeId: e.target.value })}
                    required
                    placeholder="e.g., FAC001"
                  />
                </div>
                <div className="form-group">
                  <label>Full Name *</label>
                  <input
                    value={form.fullName}
                    onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Email *</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
