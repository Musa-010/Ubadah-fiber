import React, { useState, useEffect } from 'react';
import { getComplaints, addComplaint, updateComplaint, deleteComplaint, getUsers } from '../../firebase/firebaseService';
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiX, FiAlertCircle, FiEye } from 'react-icons/fi';

const ComplaintsPage = () => {
  const [complaints, setComplaints] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editingComplaint, setEditingComplaint] = useState(null);
  const [showDetail, setShowDetail] = useState(null);
  const [showDelete, setShowDelete] = useState(null);
  const [form, setForm] = useState({ userName: '', subject: '', description: '', priority: 'medium', status: 'open', resolution: '' });

  useEffect(() => { loadAll(); }, []);

  const loadAll = async () => {
    try {
      const [comp, usr] = await Promise.all([getComplaints(), getUsers()]);
      setComplaints(comp); setUsers(usr);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingComplaint) { await updateComplaint(editingComplaint.id, form); } else { await addComplaint(form); }
      setShowModal(false); setEditingComplaint(null);
      setForm({ userName: '', subject: '', description: '', priority: 'medium', status: 'open', resolution: '' });
      loadAll();
    } catch (err) { console.error(err); }
  };

  const handleEdit = (comp) => {
    setEditingComplaint(comp);
    setForm({ userName: comp.userName || '', subject: comp.subject || '', description: comp.description || '', priority: comp.priority || 'medium', status: comp.status || 'open', resolution: comp.resolution || '' });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    try { await deleteComplaint(id); setShowDelete(null); loadAll(); } catch (err) { console.error(err); }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-PK', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const filtered = complaints.filter(c => {
    const matchSearch = c.userName?.toLowerCase().includes(search.toLowerCase()) || c.subject?.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'all' || c.status === filter;
    return matchSearch && matchFilter;
  });

  if (loading) return <div className="admin-loading" style={{ minHeight: '400px' }}><div className="admin-spinner"></div><p>Loading complaints...</p></div>;

  return (
    <div>
      <div className="admin-page-header">
        <h1>Complaints</h1>
        <button className="admin-btn admin-btn-primary" onClick={() => { setEditingComplaint(null); setForm({ userName: '', subject: '', description: '', priority: 'medium', status: 'open', resolution: '' }); setShowModal(true); }}>
          <FiPlus /> Log Complaint
        </button>
      </div>

      <div className="admin-stats-grid" style={{ marginBottom: 24 }}>
        <div className="admin-stat-card"><div className="admin-stat-header"><div><div className="admin-stat-value">{complaints.length}</div><div className="admin-stat-label">Total Complaints</div></div><div className="admin-stat-icon blue"><FiAlertCircle /></div></div></div>
        <div className="admin-stat-card"><div className="admin-stat-header"><div><div className="admin-stat-value">{complaints.filter(c => c.status === 'open').length}</div><div className="admin-stat-label">Open</div></div><div className="admin-stat-icon red"><FiAlertCircle /></div></div></div>
        <div className="admin-stat-card"><div className="admin-stat-header"><div><div className="admin-stat-value">{complaints.filter(c => c.status === 'in-progress').length}</div><div className="admin-stat-label">In Progress</div></div><div className="admin-stat-icon yellow"><FiAlertCircle /></div></div></div>
        <div className="admin-stat-card"><div className="admin-stat-header"><div><div className="admin-stat-value">{complaints.filter(c => c.status === 'resolved').length}</div><div className="admin-stat-label">Resolved</div></div><div className="admin-stat-icon green"><FiAlertCircle /></div></div></div>
      </div>

      <div className="admin-card">
        <div className="admin-card-header">
          <div className="admin-toolbar">
            <div className="admin-search-input"><FiSearch /><input type="text" placeholder="Search complaints..." value={search} onChange={(e) => setSearch(e.target.value)} /></div>
            <select className="admin-filter-select" value={filter} onChange={(e) => setFilter(e.target.value)}>
              <option value="all">All Status</option><option value="open">Open</option><option value="in-progress">In Progress</option><option value="resolved">Resolved</option><option value="closed">Closed</option>
            </select>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="admin-empty"><FiAlertCircle /><h3>No complaints found</h3><p>Great! No issues reported.</p></div>
        ) : (
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead><tr><th>User</th><th>Subject</th><th>Priority</th><th>Status</th><th>Date</th><th>Actions</th></tr></thead>
              <tbody>
                {filtered.map((comp) => (
                  <tr key={comp.id}>
                    <td><strong>{comp.userName}</strong></td>
                    <td>{comp.subject}</td>
                    <td><span className={`admin-badge ${comp.priority}`}>{comp.priority}</span></td>
                    <td><span className={`admin-badge ${comp.status}`}>{comp.status}</span></td>
                    <td>{formatDate(comp.createdAt)}</td>
                    <td>
                      <div className="admin-actions">
                        <button className="admin-btn-icon" onClick={() => setShowDetail(comp)} title="View"><FiEye /></button>
                        <button className="admin-btn-icon" onClick={() => handleEdit(comp)} title="Edit"><FiEdit2 /></button>
                        <button className="admin-btn-icon danger" onClick={() => setShowDelete(comp)} title="Delete"><FiTrash2 /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {showDetail && (
        <div className="admin-modal-overlay" onClick={() => setShowDetail(null)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header"><h3>Complaint Details</h3><button className="admin-modal-close" onClick={() => setShowDetail(null)}><FiX /></button></div>
            <div className="admin-modal-body">
              <div className="admin-detail-grid">
                <div className="admin-detail-item"><div className="admin-detail-label">User</div><div className="admin-detail-value">{showDetail.userName}</div></div>
                <div className="admin-detail-item"><div className="admin-detail-label">Subject</div><div className="admin-detail-value">{showDetail.subject}</div></div>
                <div className="admin-detail-item"><div className="admin-detail-label">Priority</div><div className="admin-detail-value"><span className={`admin-badge ${showDetail.priority}`}>{showDetail.priority}</span></div></div>
                <div className="admin-detail-item"><div className="admin-detail-label">Status</div><div className="admin-detail-value"><span className={`admin-badge ${showDetail.status}`}>{showDetail.status}</span></div></div>
                <div className="admin-detail-item" style={{ gridColumn: '1 / -1' }}><div className="admin-detail-label">Description</div><div className="admin-detail-value">{showDetail.description || '—'}</div></div>
                {showDetail.resolution && <div className="admin-detail-item" style={{ gridColumn: '1 / -1' }}><div className="admin-detail-label">Resolution</div><div className="admin-detail-value">{showDetail.resolution}</div></div>}
                <div className="admin-detail-item"><div className="admin-detail-label">Submitted</div><div className="admin-detail-value">{formatDate(showDetail.createdAt)}</div></div>
              </div>
            </div>
            <div className="admin-modal-footer">
              <button className="admin-btn admin-btn-secondary" onClick={() => setShowDetail(null)}>Close</button>
              <button className="admin-btn admin-btn-primary" onClick={() => { handleEdit(showDetail); setShowDetail(null); }}>Edit Complaint</button>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="admin-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header"><h3>{editingComplaint ? 'Edit Complaint' : 'Log Complaint'}</h3><button className="admin-modal-close" onClick={() => setShowModal(false)}><FiX /></button></div>
            <form onSubmit={handleSubmit}>
              <div className="admin-modal-body">
                <div className="admin-form-row">
                  <div className="admin-form-group"><label className="admin-form-label">User *</label>
                    <select className="admin-form-select" value={form.userName} onChange={(e) => setForm({ ...form, userName: e.target.value })} required>
                      <option value="">Select User</option>
                      {users.map(u => <option key={u.id} value={u.name}>{u.name}</option>)}
                    </select>
                  </div>
                  <div className="admin-form-group"><label className="admin-form-label">Priority</label>
                    <select className="admin-form-select" value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
                      <option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option>
                    </select>
                  </div>
                </div>
                <div className="admin-form-group"><label className="admin-form-label">Subject *</label><input className="admin-form-input" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} required /></div>
                <div className="admin-form-group"><label className="admin-form-label">Description</label><textarea className="admin-form-textarea" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} /></div>
                <div className="admin-form-group"><label className="admin-form-label">Status</label>
                  <select className="admin-form-select" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                    <option value="open">Open</option><option value="in-progress">In Progress</option><option value="resolved">Resolved</option><option value="closed">Closed</option>
                  </select>
                </div>
                {(form.status === 'resolved' || form.status === 'closed') && (
                  <div className="admin-form-group"><label className="admin-form-label">Resolution</label><textarea className="admin-form-textarea" value={form.resolution} onChange={(e) => setForm({ ...form, resolution: e.target.value })} /></div>
                )}
              </div>
              <div className="admin-modal-footer">
                <button type="button" className="admin-btn admin-btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="admin-btn admin-btn-primary">{editingComplaint ? 'Update' : 'Log Complaint'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showDelete && (
        <div className="admin-modal-overlay" onClick={() => setShowDelete(null)}>
          <div className="admin-modal" style={{ maxWidth: 400 }} onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header"><h3>Confirm Delete</h3><button className="admin-modal-close" onClick={() => setShowDelete(null)}><FiX /></button></div>
            <div className="admin-modal-body"><p className="admin-confirm-text">Delete complaint <strong>"{showDelete.subject}"</strong>?</p></div>
            <div className="admin-modal-footer">
              <button className="admin-btn admin-btn-secondary" onClick={() => setShowDelete(null)}>Cancel</button>
              <button className="admin-btn admin-btn-danger" onClick={() => handleDelete(showDelete.id)}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ComplaintsPage;
