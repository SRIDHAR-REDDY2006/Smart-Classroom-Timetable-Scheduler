import { useState, useEffect } from 'react';
import api from '../api';

const STATUS_LABELS = {
  DRAFT: 'Draft',
  HOD_APPROVED: 'HOD Approved',
  PRINCIPAL_APPROVED: 'Principal Approved',
  FINALIZED: 'Finalized',
  REJECTED: 'Rejected'
};

export default function Approval() {
  const [pendingItems, setPendingItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [rejectModal, setRejectModal] = useState({ show: false, item: null, comments: '' });
  const [processing, setProcessing] = useState(false);

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await api.get('/timetables/pending');
      setPendingItems(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const handleApprove = async (item) => {
    if (!confirm('Approve this schedule?')) return;
    setProcessing(true);
    try {
      await api.patch(`/timetables/${item.id}/approve`);
      loadData();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to approve');
    } finally {
      setProcessing(false);
    }
  };

  const openRejectModal = (item) => {
    setRejectModal({ show: true, item, comments: '' });
  };

  const handleReject = async () => {
    setProcessing(true);
    try {
      await api.patch(`/timetables/${rejectModal.item.id}/reject`, {
        comments: rejectModal.comments
      });
      setRejectModal({ show: false, item: null, comments: '' });
      loadData();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to reject');
    } finally {
      setProcessing(false);
    }
  };

  const canApprove = (item) => {
    if (user.role === 'HOD' && item.status === 'DRAFT') return true;
    if (user.role === 'PRINCIPAL' && item.status === 'HOD_APPROVED') return true;
    return false;
  };

  return (
    <div>
      <div className="page-header">
        <h1>Approval</h1>
      </div>

      <p style={{ color: '#6b7280', marginBottom: '1rem' }}>
        Your role: <strong>{user.role}</strong>
        {user.role === 'HOD' && ' - You can approve DRAFT entries'}
        {user.role === 'PRINCIPAL' && ' - You can approve HOD_APPROVED entries'}
        {user.role === 'ADMIN' && ' - View all pending entries'}
      </p>

      {error && <div className="alert alert-danger">{error}</div>}

      {loading ? (
        <div className="card"><div className="card-body">Loading...</div></div>
      ) : pendingItems.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <h3>No pending approvals</h3>
            <p>All schedule entries have been processed.</p>
          </div>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '1rem' }}>
          {pendingItems.map((item) => (
            <div key={item.id} className="card">
              <div className="card-body" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                    <h3 style={{ fontSize: '1rem' }}>{item.batch_name}</h3>
                    <span className={`badge badge-${item.status.toLowerCase()}`}>
                      {STATUS_LABELS[item.status] || item.status}
                    </span>
                  </div>
                  <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>
                    <strong>{item.subject_code}</strong> - {item.subject_name}
                    <br />
                    {item.faculty_name} | {item.classroom_name} | {item.day_of_week_text || `Day ${item.day_of_week}`} - {item.slot_label}
                  </p>
                  <p style={{ color: '#9ca3af', fontSize: '0.75rem', marginTop: '0.25rem' }}>
                    Department: {item.department_name}
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {canApprove(item) && (
                    <>
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => handleApprove(item)}
                        disabled={processing}
                      >
                        Approve
                      </button>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => openRejectModal(item)}
                        disabled={processing}
                      >
                        Reject
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {rejectModal.show && (
        <div className="modal-overlay" onClick={() => setRejectModal({ show: false, item: null, comments: '' })}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Reject Schedule</h2>
              <button className="modal-close" onClick={() => setRejectModal({ show: false, item: null, comments: '' })}>&times;</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Rejection Reason</label>
                <textarea
                  value={rejectModal.comments}
                  onChange={(e) => setRejectModal({ ...rejectModal, comments: e.target.value })}
                  rows={3}
                  placeholder="Enter reason for rejection..."
                />
              </div>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setRejectModal({ show: false, item: null, comments: '' })}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-danger"
                onClick={handleReject}
                disabled={processing}
              >
                {processing ? 'Processing...' : 'Reject'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
