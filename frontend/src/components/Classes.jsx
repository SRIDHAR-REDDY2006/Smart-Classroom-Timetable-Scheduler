import { useState, useEffect } from 'react';
import api from '../api';

export default function Classes() {
  const [items, setItems] = useState([]);
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState({ name: '', branchId: '', year: '1', semester: '1' });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [clsRes, brRes] = await Promise.all([
        api.get('/classes'),
        api.get('/branches')
      ]);
      setItems(clsRes.data);
      setBranches(brRes.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const openModal = (item = null) => {
    setEditItem(item);
    setForm(item ? {
      name: item.name,
      branchId: item.branch_id,
      year: String(item.year),
      semester: String(item.semester)
    } : { name: '', branchId: '', year: '1', semester: '1' });
    setError('');
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const payload = { ...form, year: parseInt(form.year), semester: parseInt(form.semester) };
      if (editItem) {
        await api.put(`/classes/${editItem.id}`, payload);
      } else {
        await api.post('/classes', payload);
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
    if (!confirm('Delete this class?')) return;
    try {
      await api.delete(`/classes/${id}`);
      loadData();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete');
    }
  };

  const getBranchName = (branchId) => {
    const b = branches.find(br => br.id === branchId);
    return b ? b.name : '-';
  };

  return (
    <div>
      <div className="page-header">
        <h1>Classes</h1>
        <button className="btn btn-primary" onClick={() => openModal()}>+ Add Class</button>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="card">
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Branch</th>
                <th>Year</th>
                <th>Semester</th>
                <th style={{ width: 120 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="5" style={{ textAlign: 'center' }}>Loading...</td></tr>
              ) : items.length === 0 ? (
                <tr><td colSpan="5" className="empty-state">No classes yet</td></tr>
              ) : (
                items.map((item) => (
                  <tr key={item.id}>
                    <td><strong>{item.name}</strong></td>
                    <td>{item.branch_name || getBranchName(item.branch_id)}</td>
                    <td>{item.year}</td>
                    <td>{item.semester}</td>
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
              <h2>{editItem ? 'Edit' : 'Add'} Class</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>&times;</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                {error && <div className="alert alert-danger">{error}</div>}
                <div className="form-group">
                  <label>Name *</label>
                  <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required placeholder="e.g., AIML S1" />
                </div>
                <div className="form-group">
                  <label>Branch *</label>
                  <select value={form.branchId} onChange={(e) => setForm({ ...form, branchId: e.target.value })} required>
                    <option value="">Select branch</option>
                    {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Year *</label>
                  <select value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })} required>
                    {[1,2,3,4].map(y => <option key={y} value={y}>Year {y}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Semester *</label>
                  <select value={form.semester} onChange={(e) => setForm({ ...form, semester: e.target.value })} required>
                    {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s}>Semester {s}</option>)}
                  </select>
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
