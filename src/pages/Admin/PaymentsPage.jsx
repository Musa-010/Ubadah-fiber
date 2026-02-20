import React, { useState, useEffect } from 'react';
import { getPayments, addPayment, updatePayment, deletePayment, getUsers } from '../../firebase/firebaseService';
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiX, FiCreditCard } from 'react-icons/fi';

const PaymentsPage = () => {
  const [payments, setPayments] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editingPayment, setEditingPayment] = useState(null);
  const [showDelete, setShowDelete] = useState(null);
  const [form, setForm] = useState({ userName: '', amount: '', method: 'cash', status: 'paid', month: '', description: '' });

  useEffect(() => { loadAll(); }, []);

  const loadAll = async () => {
    try {
      const [pay, usr] = await Promise.all([getPayments(), getUsers()]);
      setPayments(pay); setUsers(usr);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = { ...form, amount: Number(form.amount) };
    try {
      if (editingPayment) { await updatePayment(editingPayment.id, data); } else { await addPayment(data); }
      setShowModal(false); setEditingPayment(null);
      setForm({ userName: '', amount: '', method: 'cash', status: 'paid', month: '', description: '' });
      loadAll();
    } catch (err) { console.error(err); }
  };

  const handleEdit = (pay) => {
    setEditingPayment(pay);
    setForm({ userName: pay.userName || '', amount: pay.amount || '', method: pay.method || 'cash', status: pay.status || 'paid', month: pay.month || '', description: pay.description || '' });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    try { await deletePayment(id); setShowDelete(null); loadAll(); } catch (err) { console.error(err); }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-PK', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const totalRevenue = payments.reduce((sum, p) => sum + (p.amount || 0), 0);

  const filtered = payments.filter(p => {
    const matchSearch = p.userName?.toLowerCase().includes(search.toLowerCase()) || p.method?.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'all' || p.status === filter;
    return matchSearch && matchFilter;
  });

  if (loading) return <div className="admin-loading" style={{ minHeight: '400px' }}><div className="admin-spinner"></div><p>Loading payments...</p></div>;

  return (
    <div>
      <div className="admin-page-header">
        <h1>Payments</h1>
        <button className="admin-btn admin-btn-primary" onClick={() => { setEditingPayment(null); setForm({ userName: '', amount: '', method: 'cash', status: 'paid', month: '', description: '' }); setShowModal(true); }}>
          <FiPlus /> Record Payment
        </button>
      </div>

      <div className="admin-stats-grid" style={{ marginBottom: 24 }}>
        <div className="admin-stat-card">
          <div className="admin-stat-header"><div><div className="admin-stat-value">Rs.{totalRevenue.toLocaleString()}</div><div className="admin-stat-label">Total Revenue</div></div><div className="admin-stat-icon green"><FiCreditCard /></div></div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-header"><div><div className="admin-stat-value">{payments.length}</div><div className="admin-stat-label">Total Payments</div></div><div className="admin-stat-icon blue"><FiCreditCard /></div></div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-header"><div><div className="admin-stat-value">{payments.filter(p => p.status === 'pending').length}</div><div className="admin-stat-label">Pending Payments</div></div><div className="admin-stat-icon yellow"><FiCreditCard /></div></div>
        </div>
      </div>

      <div className="admin-card">
        <div className="admin-card-header">
          <div className="admin-toolbar">
            <div className="admin-search-input"><FiSearch /><input type="text" placeholder="Search payments..." value={search} onChange={(e) => setSearch(e.target.value)} /></div>
            <select className="admin-filter-select" value={filter} onChange={(e) => setFilter(e.target.value)}>
              <option value="all">All Status</option><option value="paid">Paid</option><option value="pending">Pending</option><option value="overdue">Overdue</option>
            </select>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="admin-empty"><FiCreditCard /><h3>No payments found</h3><p>Record your first payment</p></div>
        ) : (
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead><tr><th>User</th><th>Amount (Rs.)</th><th>Method</th><th>Month</th><th>Status</th><th>Date</th><th>Actions</th></tr></thead>
              <tbody>
                {filtered.map((pay) => (
                  <tr key={pay.id}>
                    <td><strong>{pay.userName}</strong></td>
                    <td>Rs.{pay.amount?.toLocaleString()}</td>
                    <td style={{ textTransform: 'capitalize' }}>{pay.method}</td>
                    <td>{pay.month || '—'}</td>
                    <td><span className={`admin-badge ${pay.status}`}>{pay.status}</span></td>
                    <td>{formatDate(pay.createdAt)}</td>
                    <td>
                      <div className="admin-actions">
                        <button className="admin-btn-icon" onClick={() => handleEdit(pay)}><FiEdit2 /></button>
                        <button className="admin-btn-icon danger" onClick={() => setShowDelete(pay)}><FiTrash2 /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <div className="admin-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header"><h3>{editingPayment ? 'Edit Payment' : 'Record Payment'}</h3><button className="admin-modal-close" onClick={() => setShowModal(false)}><FiX /></button></div>
            <form onSubmit={handleSubmit}>
              <div className="admin-modal-body">
                <div className="admin-form-row">
                  <div className="admin-form-group"><label className="admin-form-label">User *</label>
                    <select className="admin-form-select" value={form.userName} onChange={(e) => setForm({ ...form, userName: e.target.value })} required>
                      <option value="">Select User</option>
                      {users.map(u => <option key={u.id} value={u.name}>{u.name}</option>)}
                    </select>
                  </div>
                  <div className="admin-form-group"><label className="admin-form-label">Amount (Rs.) *</label><input className="admin-form-input" type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} required /></div>
                </div>
                <div className="admin-form-row">
                  <div className="admin-form-group"><label className="admin-form-label">Payment Method</label>
                    <select className="admin-form-select" value={form.method} onChange={(e) => setForm({ ...form, method: e.target.value })}>
                      <option value="cash">Cash</option><option value="bank-transfer">Bank Transfer</option><option value="easypaisa">Easypaisa</option><option value="jazzcash">JazzCash</option>
                    </select>
                  </div>
                  <div className="admin-form-group"><label className="admin-form-label">Month</label><input className="admin-form-input" type="month" value={form.month} onChange={(e) => setForm({ ...form, month: e.target.value })} /></div>
                </div>
                <div className="admin-form-group"><label className="admin-form-label">Status</label>
                  <select className="admin-form-select" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                    <option value="paid">Paid</option><option value="pending">Pending</option><option value="overdue">Overdue</option>
                  </select>
                </div>
                <div className="admin-form-group"><label className="admin-form-label">Description</label><textarea className="admin-form-textarea" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
              </div>
              <div className="admin-modal-footer">
                <button type="button" className="admin-btn admin-btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="admin-btn admin-btn-primary">{editingPayment ? 'Update' : 'Record Payment'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showDelete && (
        <div className="admin-modal-overlay" onClick={() => setShowDelete(null)}>
          <div className="admin-modal" style={{ maxWidth: 400 }} onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header"><h3>Confirm Delete</h3><button className="admin-modal-close" onClick={() => setShowDelete(null)}><FiX /></button></div>
            <div className="admin-modal-body"><p className="admin-confirm-text">Delete payment of <strong>Rs.{showDelete.amount?.toLocaleString()}</strong> from {showDelete.userName}?</p></div>
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

export default PaymentsPage;
