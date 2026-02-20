import React, { useState, useEffect } from 'react';
import { getPackages, addPackage, updatePackage, deletePackage } from '../../firebase/firebaseService';
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiX, FiPackage } from 'react-icons/fi';

const PackagesPage = () => {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingPkg, setEditingPkg] = useState(null);
  const [showDelete, setShowDelete] = useState(null);
  const [form, setForm] = useState({ name: '', speed: '', monthlyPrice: '', installationFee: '', type: 'fiber', status: 'active', description: '' });

  useEffect(() => { loadPackages(); }, []);

  const loadPackages = async () => {
    try { setPackages(await getPackages()); } catch (err) { console.error(err); }
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = { ...form, monthlyPrice: Number(form.monthlyPrice), installationFee: Number(form.installationFee) };
    try {
      if (editingPkg) { await updatePackage(editingPkg.id, data); } else { await addPackage(data); }
      setShowModal(false); setEditingPkg(null);
      setForm({ name: '', speed: '', monthlyPrice: '', installationFee: '', type: 'fiber', status: 'active', description: '' });
      loadPackages();
    } catch (err) { console.error(err); }
  };

  const handleEdit = (pkg) => {
    setEditingPkg(pkg);
    setForm({ name: pkg.name, speed: pkg.speed, monthlyPrice: pkg.monthlyPrice, installationFee: pkg.installationFee || '', type: pkg.type || 'fiber', status: pkg.status || 'active', description: pkg.description || '' });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    try { await deletePackage(id); setShowDelete(null); loadPackages(); } catch (err) { console.error(err); }
  };

  const openAddModal = () => {
    setEditingPkg(null);
    setForm({ name: '', speed: '', monthlyPrice: '', installationFee: '', type: 'fiber', status: 'active', description: '' });
    setShowModal(true);
  };

  const filtered = packages.filter(p => p.name?.toLowerCase().includes(search.toLowerCase()));

  if (loading) return <div className="admin-loading" style={{ minHeight: '400px' }}><div className="admin-spinner"></div><p>Loading packages...</p></div>;

  return (
    <div>
      <div className="admin-page-header">
        <h1>Packages Management</h1>
        <button className="admin-btn admin-btn-primary" onClick={openAddModal}><FiPlus /> Add Package</button>
      </div>

      <div className="admin-card">
        <div className="admin-card-header">
          <div className="admin-toolbar">
            <div className="admin-search-input"><FiSearch /><input type="text" placeholder="Search packages..." value={search} onChange={(e) => setSearch(e.target.value)} /></div>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="admin-empty"><FiPackage /><h3>No packages found</h3><p>Add your first package to get started</p></div>
        ) : (
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead><tr><th>Package Name</th><th>Speed</th><th>Monthly (Rs.)</th><th>Installation (Rs.)</th><th>Type</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>
                {filtered.map((pkg) => (
                  <tr key={pkg.id}>
                    <td><strong>{pkg.name}</strong></td>
                    <td>{pkg.speed}</td>
                    <td>Rs.{pkg.monthlyPrice?.toLocaleString()}</td>
                    <td>Rs.{pkg.installationFee?.toLocaleString()}</td>
                    <td>{pkg.type}</td>
                    <td><span className={`admin-badge ${pkg.status}`}>{pkg.status}</span></td>
                    <td>
                      <div className="admin-actions">
                        <button className="admin-btn-icon" onClick={() => handleEdit(pkg)}><FiEdit2 /></button>
                        <button className="admin-btn-icon danger" onClick={() => setShowDelete(pkg)}><FiTrash2 /></button>
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
            <div className="admin-modal-header"><h3>{editingPkg ? 'Edit Package' : 'Add New Package'}</h3><button className="admin-modal-close" onClick={() => setShowModal(false)}><FiX /></button></div>
            <form onSubmit={handleSubmit}>
              <div className="admin-modal-body">
                <div className="admin-form-group"><label className="admin-form-label">Package Name *</label><input className="admin-form-input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></div>
                <div className="admin-form-row">
                  <div className="admin-form-group"><label className="admin-form-label">Speed *</label><input className="admin-form-input" placeholder="e.g. 10 Mbps" value={form.speed} onChange={(e) => setForm({ ...form, speed: e.target.value })} required /></div>
                  <div className="admin-form-group"><label className="admin-form-label">Type</label>
                    <select className="admin-form-select" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}><option value="fiber">Fiber</option><option value="wireless">Wireless</option><option value="cable">Cable</option></select>
                  </div>
                </div>
                <div className="admin-form-row">
                  <div className="admin-form-group"><label className="admin-form-label">Monthly Price (Rs.) *</label><input className="admin-form-input" type="number" value={form.monthlyPrice} onChange={(e) => setForm({ ...form, monthlyPrice: e.target.value })} required /></div>
                  <div className="admin-form-group"><label className="admin-form-label">Installation Fee (Rs.)</label><input className="admin-form-input" type="number" value={form.installationFee} onChange={(e) => setForm({ ...form, installationFee: e.target.value })} /></div>
                </div>
                <div className="admin-form-group"><label className="admin-form-label">Description</label><textarea className="admin-form-textarea" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
                <div className="admin-form-group"><label className="admin-form-label">Status</label>
                  <select className="admin-form-select" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}><option value="active">Active</option><option value="inactive">Inactive</option></select>
                </div>
              </div>
              <div className="admin-modal-footer">
                <button type="button" className="admin-btn admin-btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="admin-btn admin-btn-primary">{editingPkg ? 'Update Package' : 'Add Package'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showDelete && (
        <div className="admin-modal-overlay" onClick={() => setShowDelete(null)}>
          <div className="admin-modal" style={{ maxWidth: 400 }} onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header"><h3>Confirm Delete</h3><button className="admin-modal-close" onClick={() => setShowDelete(null)}><FiX /></button></div>
            <div className="admin-modal-body"><p className="admin-confirm-text">Are you sure you want to delete <strong>{showDelete.name}</strong>?</p></div>
            <div className="admin-modal-footer">
              <button className="admin-btn admin-btn-secondary" onClick={() => setShowDelete(null)}>Cancel</button>
              <button className="admin-btn admin-btn-danger" onClick={() => handleDelete(showDelete.id)}>Delete Package</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PackagesPage;
