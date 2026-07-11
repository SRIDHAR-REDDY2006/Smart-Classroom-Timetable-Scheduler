import { useState, useEffect } from 'react';
import api from '../api';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function TimeSlots() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState({ dayOfWeek: 1, startTime: '09:00', endTime: '10:00', slotLabel: '', shift: 'MORNING' });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const loadItems = async () => {
    setLoading(true);
    try {
      const res = await api.get('/timeslots');
      setItems(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadItems(); }, []);

  const openModal = (item = null) => {
    setEditItem(item);
    setForm(item ? {
      dayOfWeek: item.day_of_week,
      startTime: item.start_time?.substring(0, 5) || '09:00',
      endTime: item.end_time?.substring(0, 5) || '10:00',
      slotLabel: item.slot_label,
      shift: item.shift
    } : { dayOfWeek: 1, startTime: '09:00', endTime: '10:00', slotLabel: '', shift: 'MORNING' });
    setError('');
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    const label = form.slotLabel || `${form.startTime} - ${form.endTime}`;

    try {
      if (editItem) {
        await api.put(`/timeslots/${editItem.id}`, { ...form, slotLabel: label });
      } else {
        await api.post('/timeslots', { ...form, slotLabel: label });
      }
      setShowModal(false);
      loadItems();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this time slot?')) return;
    try {
      await api.delete(`/timeslots/${id}`);
      loadItems();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete');
    }
  };

  // Group slots by day
  const slotsByDay = DAYS.reduce((acc, _, idx) => {
    acc[idx] = items.filter(item => item.day_of_week === idx);
    return acc;
  }, {});

  return (
    <div>
      <div className="page-header">
        <h1>Time Slots</h1>
        <button className="btn btn-primary" onClick={() => openModal()}>+ Add Time Slot</button>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="card">
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Day</th>
                <th>Time</th>
                <th>Label</th>
                <th>Shift</th>
                <th style={{ width: 120 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="5" style={{ textAlign: 'center' }}>Loading...</td></tr>
              ) : items.length === 0 ? (
                <tr><td colSpan="5" className="empty-state">No time slots yet</td></tr>
              ) : (
                DAYS.map((day, idx) =>
                  slotsByDay[idx]?.map((item, i) => (
                    <tr key={item.id}>
                      <td>{i === 0 ? <strong>{day}</strong> : ''}</td>
                      <td>{item.start_time?.substring(0, 5)} - {item.end_time?.substring(0, 5)}</td>
                      <td>{item.slot_label}</td>
                      <td>{item.shift}</td>
                      <td>
                        <div className="actions">
                          <button className="btn btn-secondary btn-sm" onClick={() => openModal(item)}>Edit</button>
                          <button className="btn btn-danger btn-sm" onClick={() => handleDelete(item.id)}>Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))
                )
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editItem ? 'Edit' : 'Add'} Time Slot</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>&times;</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                {error && <div className="alert alert-danger">{error}</div>}
                <div className="form-group">
                  <label>Day *</label>
                  <select value={form.dayOfWeek} onChange={(e) => setForm({ ...form, dayOfWeek: parseInt(e.target.value) })}>
                    {DAYS.map((day, idx) => (
                      <option key={idx} value={idx}>{day}</option>
                    ))}
                  </select>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label>Start Time *</label>
                    <input type="time" value={form.startTime} onChange={(e) => setForm({ ...form, startTime: e.target.value })} required />
                  </div>
                  <div className="form-group">
                    <label>End Time *</label>
                    <input type="time" value={form.endTime} onChange={(e) => setForm({ ...form, endTime: e.target.value })} required />
                  </div>
                </div>
                <div className="form-group">
                  <label>Label (optional)</label>
                  <input value={form.slotLabel} onChange={(e) => setForm({ ...form, slotLabel: e.target.value })} placeholder="e.g., 9:00 AM - 10:00 AM" />
                </div>
                <div className="form-group">
                  <label>Shift</label>
                  <select value={form.shift} onChange={(e) => setForm({ ...form, shift: e.target.value })}>
                    <option value="MORNING">Morning</option>
                    <option value="AFTERNOON">Afternoon</option>
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
