import React, { useState, useEffect } from 'react';
import { getBookings, updateBooking, deleteBooking } from '../../firebase/firebaseService';
import { FiEdit2, FiTrash2, FiSearch, FiX, FiCalendar, FiEye } from 'react-icons/fi';

const BookingsPage = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [showDetail, setShowDetail] = useState(null);
  const [showStatusModal, setShowStatusModal] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [showDelete, setShowDelete] = useState(null);

  useEffect(() => { loadBookings(); }, []);

  const loadBookings = async () => {
    try { setBookings(await getBookings()); } catch (err) { console.error(err); }
    setLoading(false);
  };

  const handleStatusUpdate = async () => {
    try {
      await updateBooking(showStatusModal.id, { status: newStatus });
      setShowStatusModal(null);
      loadBookings();
    } catch (err) { console.error(err); }
  };

  const handleDelete = async (id) => {
    try { await deleteBooking(id); setShowDelete(null); loadBookings(); } catch (err) { console.error(err); }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-PK', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const filtered = bookings.filter(b => {
    const matchSearch = b.name?.toLowerCase().includes(search.toLowerCase()) || b.email?.toLowerCase().includes(search.toLowerCase()) || b.phone?.includes(search);
    const matchFilter = filter === 'all' || b.status === filter;
    return matchSearch && matchFilter;
  });

  const statusCounts = {
    pending: bookings.filter(b => b.status === 'pending').length,
    confirmed: bookings.filter(b => b.status === 'confirmed').length,
    completed: bookings.filter(b => b.status === 'completed').length,
    cancelled: bookings.filter(b => b.status === 'cancelled').length
  };

  if (loading) return <div className="admin-loading" style={{ minHeight: '400px' }}><div className="admin-spinner"></div><p>Loading bookings...</p></div>;

  return (
    <div>
      <div className="admin-page-header">
        <h1>Bookings</h1>
      </div>

      <div className="admin-stats-grid" style={{ marginBottom: 24 }}>
        <div className="admin-stat-card"><div className="admin-stat-header"><div><div className="admin-stat-value">{bookings.length}</div><div className="admin-stat-label">Total Bookings</div></div><div className="admin-stat-icon blue"><FiCalendar /></div></div></div>
        <div className="admin-stat-card"><div className="admin-stat-header"><div><div className="admin-stat-value">{statusCounts.pending}</div><div className="admin-stat-label">Pending</div></div><div className="admin-stat-icon yellow"><FiCalendar /></div></div></div>
        <div className="admin-stat-card"><div className="admin-stat-header"><div><div className="admin-stat-value">{statusCounts.confirmed}</div><div className="admin-stat-label">Confirmed</div></div><div className="admin-stat-icon purple"><FiCalendar /></div></div></div>
        <div className="admin-stat-card"><div className="admin-stat-header"><div><div className="admin-stat-value">{statusCounts.completed}</div><div className="admin-stat-label">Completed</div></div><div className="admin-stat-icon green"><FiCalendar /></div></div></div>
      </div>

      <div className="admin-card">
        <div className="admin-card-header">
          <div className="admin-toolbar">
            <div className="admin-search-input"><FiSearch /><input type="text" placeholder="Search bookings..." value={search} onChange={(e) => setSearch(e.target.value)} /></div>
            <select className="admin-filter-select" value={filter} onChange={(e) => setFilter(e.target.value)}>
              <option value="all">All Status</option><option value="pending">Pending</option><option value="confirmed">Confirmed</option><option value="completed">Completed</option><option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="admin-empty"><FiCalendar /><h3>No bookings found</h3><p>Bookings from the website will appear here</p></div>
        ) : (
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>Package</th><th>Status</th><th>Date</th><th>Actions</th></tr></thead>
              <tbody>
                {filtered.map((booking) => (
                  <tr key={booking.id}>
                    <td><strong>{booking.name}</strong></td>
                    <td>{booking.email}</td>
                    <td>{booking.phone}</td>
                    <td>{booking.package || '—'}</td>
                    <td><span className={`admin-badge ${booking.status}`}>{booking.status}</span></td>
                    <td>{formatDate(booking.createdAt)}</td>
                    <td>
                      <div className="admin-actions">
                        <button className="admin-btn-icon" onClick={() => setShowDetail(booking)} title="View"><FiEye /></button>
                        <button className="admin-btn-icon" onClick={() => { setShowStatusModal(booking); setNewStatus(booking.status); }} title="Update Status"><FiEdit2 /></button>
                        <button className="admin-btn-icon danger" onClick={() => setShowDelete(booking)} title="Delete"><FiTrash2 /></button>
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
            <div className="admin-modal-header"><h3>Booking Details</h3><button className="admin-modal-close" onClick={() => setShowDetail(null)}><FiX /></button></div>
            <div className="admin-modal-body">
              <div className="admin-detail-grid">
                <div className="admin-detail-item"><div className="admin-detail-label">Name</div><div className="admin-detail-value">{showDetail.name}</div></div>
                <div className="admin-detail-item"><div className="admin-detail-label">Email</div><div className="admin-detail-value">{showDetail.email}</div></div>
                <div className="admin-detail-item"><div className="admin-detail-label">Phone</div><div className="admin-detail-value">{showDetail.phone}</div></div>
                <div className="admin-detail-item"><div className="admin-detail-label">Package</div><div className="admin-detail-value">{showDetail.package || '—'}</div></div>
                <div className="admin-detail-item"><div className="admin-detail-label">Address</div><div className="admin-detail-value">{showDetail.address || '—'}</div></div>
                <div className="admin-detail-item"><div className="admin-detail-label">Status</div><div className="admin-detail-value"><span className={`admin-badge ${showDetail.status}`}>{showDetail.status}</span></div></div>
                <div className="admin-detail-item"><div className="admin-detail-label">Submitted</div><div className="admin-detail-value">{formatDate(showDetail.createdAt)}</div></div>
                {showDetail.message && <div className="admin-detail-item" style={{ gridColumn: '1 / -1' }}><div className="admin-detail-label">Message</div><div className="admin-detail-value">{showDetail.message}</div></div>}
              </div>
            </div>
            <div className="admin-modal-footer">
              <button className="admin-btn admin-btn-secondary" onClick={() => setShowDetail(null)}>Close</button>
              <button className="admin-btn admin-btn-primary" onClick={() => { setShowStatusModal(showDetail); setNewStatus(showDetail.status); setShowDetail(null); }}>Update Status</button>
            </div>
          </div>
        </div>
      )}

      {/* Status Update Modal */}
      {showStatusModal && (
        <div className="admin-modal-overlay" onClick={() => setShowStatusModal(null)}>
          <div className="admin-modal" style={{ maxWidth: 400 }} onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header"><h3>Update Status</h3><button className="admin-modal-close" onClick={() => setShowStatusModal(null)}><FiX /></button></div>
            <div className="admin-modal-body">
              <p style={{ marginBottom: 16, color: '#94a3b8' }}>Booking from <strong style={{ color: '#e2e8f0' }}>{showStatusModal.name}</strong></p>
              <div className="admin-form-group"><label className="admin-form-label">New Status</label>
                <select className="admin-form-select" value={newStatus} onChange={(e) => setNewStatus(e.target.value)}>
                  <option value="pending">Pending</option><option value="confirmed">Confirmed</option><option value="in-progress">In Progress</option><option value="completed">Completed</option><option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>
            <div className="admin-modal-footer">
              <button className="admin-btn admin-btn-secondary" onClick={() => setShowStatusModal(null)}>Cancel</button>
              <button className="admin-btn admin-btn-primary" onClick={handleStatusUpdate}>Update</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete */}
      {showDelete && (
        <div className="admin-modal-overlay" onClick={() => setShowDelete(null)}>
          <div className="admin-modal" style={{ maxWidth: 400 }} onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header"><h3>Confirm Delete</h3><button className="admin-modal-close" onClick={() => setShowDelete(null)}><FiX /></button></div>
            <div className="admin-modal-body"><p className="admin-confirm-text">Delete booking from <strong>{showDelete.name}</strong>?</p></div>
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

export default BookingsPage;
