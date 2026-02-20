import React, { useState, useEffect, useRef } from 'react';
import { getInvoices, addInvoice, updateInvoice, deleteInvoice, getUsers, getPackages } from '../../firebase/firebaseService';
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiX, FiFileText, FiPrinter, FiDownload, FiEye } from 'react-icons/fi';
import InvoiceTemplate from './InvoiceTemplate';
import html2pdf from 'html2pdf.js';

const InvoicesPage = () => {
  const [invoices, setInvoices] = useState([]);
  const [users, setUsers] = useState([]);
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState(null);
  const [showDelete, setShowDelete] = useState(null);
  const [previewInvoice, setPreviewInvoice] = useState(null);
  const invoiceRef = useRef(null);

  const emptyForm = {
    userName: '', userEmail: '', userPhone: '', userAddress: '',
    packageName: '', billingPeriod: '', invoiceDate: '', dueDate: '',
    paymentMethod: 'cash', status: 'unpaid', tax: 0, discount: 0, notes: '',
    items: [{ description: '', quantity: 1, rate: 0, amount: 0 }]
  };
  const [form, setForm] = useState(emptyForm);

  useEffect(() => { loadAll(); }, []);

  const loadAll = async () => {
    try {
      const [inv, usr, pkg] = await Promise.all([getInvoices(), getUsers(), getPackages()]);
      setInvoices(inv); setUsers(usr); setPackages(pkg);
    } catch (err) { console.error('Error loading invoices:', err); }
    setLoading(false);
  };

  // Auto-fill user data when a user is selected
  const handleUserSelect = (userName) => {
    const user = users.find(u => u.name === userName);
    if (user) {
      const userPkg = packages.find(p => p.name === user.package);
      setForm(prev => ({
        ...prev,
        userName: user.name,
        userEmail: user.email || '',
        userPhone: user.phone || '',
        userAddress: user.address || '',
        packageName: user.package || '',
        items: userPkg
          ? [{ description: `Monthly Internet - ${userPkg.name}`, quantity: 1, rate: userPkg.monthlyPrice, amount: userPkg.monthlyPrice }]
          : prev.items
      }));
    } else {
      setForm(prev => ({ ...prev, userName }));
    }
  };

  // Auto-fill package data
  const handlePackageSelect = (packageName) => {
    const pkg = packages.find(p => p.name === packageName);
    if (pkg) {
      setForm(prev => ({
        ...prev,
        packageName: pkg.name,
        items: [{ description: `Monthly Internet - ${pkg.name} (${pkg.speed})`, quantity: 1, rate: pkg.monthlyPrice, amount: pkg.monthlyPrice }]
      }));
    } else {
      setForm(prev => ({ ...prev, packageName }));
    }
  };

  // Handle item changes
  const updateItem = (index, field, value) => {
    const newItems = [...form.items];
    newItems[index] = { ...newItems[index], [field]: value };
    if (field === 'quantity' || field === 'rate') {
      newItems[index].amount = (Number(newItems[index].quantity) || 0) * (Number(newItems[index].rate) || 0);
    }
    setForm(prev => ({ ...prev, items: newItems }));
  };

  const addItem = () => {
    setForm(prev => ({ ...prev, items: [...prev.items, { description: '', quantity: 1, rate: 0, amount: 0 }] }));
  };

  const removeItem = (index) => {
    if (form.items.length <= 1) return;
    setForm(prev => ({ ...prev, items: prev.items.filter((_, i) => i !== index) }));
  };

  const getTotal = () => {
    const subtotal = form.items.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
    return subtotal + (Number(form.tax) || 0) - (Number(form.discount) || 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = {
      ...form,
      tax: Number(form.tax) || 0,
      discount: Number(form.discount) || 0,
      total: getTotal(),
      items: form.items.map(item => ({
        ...item,
        quantity: Number(item.quantity) || 1,
        rate: Number(item.rate) || 0,
        amount: Number(item.amount) || 0
      }))
    };

    try {
      if (editingInvoice) {
        await updateInvoice(editingInvoice.id, data);
      } else {
        await addInvoice(data);
      }
      setShowModal(false);
      setEditingInvoice(null);
      setForm(emptyForm);
      loadAll();
    } catch (err) { console.error('Error saving invoice:', err); }
  };

  const handleEdit = (inv) => {
    setEditingInvoice(inv);
    setForm({
      userName: inv.userName || '', userEmail: inv.userEmail || '', userPhone: inv.userPhone || '',
      userAddress: inv.userAddress || '', packageName: inv.packageName || '',
      billingPeriod: inv.billingPeriod || '', invoiceDate: inv.invoiceDate || '',
      dueDate: inv.dueDate || '', paymentMethod: inv.paymentMethod || 'cash',
      status: inv.status || 'unpaid', tax: inv.tax || 0, discount: inv.discount || 0,
      notes: inv.notes || '',
      items: inv.items?.length ? inv.items : [{ description: '', quantity: 1, rate: 0, amount: 0 }]
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    try { await deleteInvoice(id); setShowDelete(null); loadAll(); } catch (err) { console.error(err); }
  };

  // PDF Download
  const downloadPDF = (invoice) => {
    setPreviewInvoice(invoice);
    setTimeout(() => {
      if (!invoiceRef.current) return;
      const opt = {
        margin: 0.3,
        filename: `Invoice-${invoice.invoiceNumber || 'draft'}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
      };
      html2pdf().set(opt).from(invoiceRef.current).save().then(() => {
        setPreviewInvoice(null);
      });
    }, 300);
  };

  // Print
  const printInvoice = (invoice) => {
    setPreviewInvoice(invoice);
    setTimeout(() => {
      const content = invoiceRef.current;
      if (!content) return;
      const printWindow = window.open('', '_blank');
      printWindow.document.write(`
        <html>
          <head>
            <title>Invoice ${invoice.invoiceNumber}</title>
            <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
            <style>
              body { margin: 0; padding: 20px; font-family: 'Inter', sans-serif; }
              @media print { body { padding: 0; } }
            </style>
          </head>
          <body>${content.innerHTML}</body>
        </html>
      `);
      printWindow.document.close();
      printWindow.onload = () => {
        printWindow.print();
        printWindow.close();
      };
      setPreviewInvoice(null);
    }, 300);
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    if (typeof timestamp === 'string') return timestamp;
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-PK', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const filtered = invoices.filter(inv => {
    const matchSearch = inv.userName?.toLowerCase().includes(search.toLowerCase()) ||
      inv.invoiceNumber?.toLowerCase().includes(search.toLowerCase()) ||
      inv.userEmail?.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'all' || inv.status === filter;
    return matchSearch && matchFilter;
  });

  const totalRevenue = invoices.filter(i => i.status === 'paid').reduce((sum, i) => sum + (i.total || 0), 0);
  const unpaidTotal = invoices.filter(i => i.status !== 'paid').reduce((sum, i) => sum + (i.total || 0), 0);

  if (loading) return <div className="admin-loading" style={{ minHeight: '400px' }}><div className="admin-spinner"></div><p>Loading invoices...</p></div>;

  return (
    <div>
      <div className="admin-page-header">
        <h1>Invoices</h1>
        <button className="admin-btn admin-btn-primary" onClick={() => { setEditingInvoice(null); setForm(emptyForm); setShowModal(true); }}>
          <FiPlus /> Create Invoice
        </button>
      </div>

      {/* Stats */}
      <div className="admin-stats-grid" style={{ marginBottom: 24 }}>
        <div className="admin-stat-card">
          <div className="admin-stat-header"><div><div className="admin-stat-value">{invoices.length}</div><div className="admin-stat-label">Total Invoices</div></div><div className="admin-stat-icon blue"><FiFileText /></div></div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-header"><div><div className="admin-stat-value">Rs.{totalRevenue.toLocaleString()}</div><div className="admin-stat-label">Paid Amount</div></div><div className="admin-stat-icon green"><FiFileText /></div></div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-header"><div><div className="admin-stat-value">Rs.{unpaidTotal.toLocaleString()}</div><div className="admin-stat-label">Unpaid Amount</div></div><div className="admin-stat-icon red"><FiFileText /></div></div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-header"><div><div className="admin-stat-value">{invoices.filter(i => i.status === 'overdue').length}</div><div className="admin-stat-label">Overdue</div></div><div className="admin-stat-icon yellow"><FiFileText /></div></div>
        </div>
      </div>

      {/* Table */}
      <div className="admin-card">
        <div className="admin-card-header">
          <div className="admin-toolbar">
            <div className="admin-search-input"><FiSearch /><input type="text" placeholder="Search invoices..." value={search} onChange={(e) => setSearch(e.target.value)} /></div>
            <select className="admin-filter-select" value={filter} onChange={(e) => setFilter(e.target.value)}>
              <option value="all">All Status</option><option value="paid">Paid</option><option value="unpaid">Unpaid</option><option value="overdue">Overdue</option><option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="admin-empty"><FiFileText /><h3>No invoices found</h3><p>Create your first invoice to get started</p></div>
        ) : (
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead><tr><th>Invoice #</th><th>Customer</th><th>Package</th><th>Amount</th><th>Status</th><th>Date</th><th>Actions</th></tr></thead>
              <tbody>
                {filtered.map((inv) => (
                  <tr key={inv.id}>
                    <td><strong style={{ color: '#2dd4bf' }}>{inv.invoiceNumber}</strong></td>
                    <td>
                      <div><strong>{inv.userName}</strong></div>
                      <div style={{ fontSize: '12px', color: '#94a3b8' }}>{inv.userEmail}</div>
                    </td>
                    <td>{inv.packageName || '—'}</td>
                    <td><strong>Rs.{(inv.total || 0).toLocaleString()}</strong></td>
                    <td><span className={`admin-badge ${inv.status}`}>{inv.status}</span></td>
                    <td>{formatDate(inv.invoiceDate || inv.createdAt)}</td>
                    <td>
                      <div className="admin-actions">
                        <button className="admin-btn-icon" onClick={() => setPreviewInvoice(inv)} title="Preview"><FiEye /></button>
                        <button className="admin-btn-icon" onClick={() => downloadPDF(inv)} title="Download PDF"><FiDownload /></button>
                        <button className="admin-btn-icon" onClick={() => printInvoice(inv)} title="Print"><FiPrinter /></button>
                        <button className="admin-btn-icon" onClick={() => handleEdit(inv)} title="Edit"><FiEdit2 /></button>
                        <button className="admin-btn-icon danger" onClick={() => setShowDelete(inv)} title="Delete"><FiTrash2 /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Hidden Invoice Template for PDF/Print */}
      <div style={{ position: 'absolute', left: '-9999px', top: 0 }}>
        {previewInvoice && <InvoiceTemplate ref={invoiceRef} invoice={previewInvoice} />}
      </div>

      {/* Preview Modal */}
      {previewInvoice && (
        <div className="admin-modal-overlay" onClick={() => setPreviewInvoice(null)}>
          <div className="admin-modal" style={{ maxWidth: 860, maxHeight: '90vh', overflow: 'auto' }} onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3>Invoice Preview</h3>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <button className="admin-btn admin-btn-sm admin-btn-secondary" onClick={() => downloadPDF(previewInvoice)}><FiDownload /> PDF</button>
                <button className="admin-btn admin-btn-sm admin-btn-primary" onClick={() => printInvoice(previewInvoice)}><FiPrinter /> Print</button>
                <button className="admin-modal-close" onClick={() => setPreviewInvoice(null)}><FiX /></button>
              </div>
            </div>
            <div style={{ padding: 24, background: '#f8fafc' }}>
              <InvoiceTemplate invoice={previewInvoice} />
            </div>
          </div>
        </div>
      )}

      {/* Create/Edit Invoice Modal */}
      {showModal && (
        <div className="admin-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="admin-modal" style={{ maxWidth: 700, maxHeight: '90vh', overflow: 'auto' }} onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3>{editingInvoice ? 'Edit Invoice' : 'Create New Invoice'}</h3>
              <button className="admin-modal-close" onClick={() => setShowModal(false)}><FiX /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="admin-modal-body">

                {/* Customer Selection */}
                <div style={{ background: 'rgba(45,212,191,0.05)', border: '1px solid rgba(45,212,191,0.15)', borderRadius: 8, padding: 16, marginBottom: 18 }}>
                  <h4 style={{ margin: '0 0 12px', fontSize: 14, color: '#2dd4bf' }}>👤 Customer Details</h4>
                  <div className="admin-form-group">
                    <label className="admin-form-label">Select Existing User (auto-fills all details)</label>
                    <select className="admin-form-select" value={form.userName} onChange={(e) => handleUserSelect(e.target.value)}>
                      <option value="">— Select a user or type below —</option>
                      {users.map(u => <option key={u.id} value={u.name}>{u.name} — {u.phone} — {u.package || 'No package'}</option>)}
                    </select>
                  </div>
                  <div className="admin-form-row">
                    <div className="admin-form-group"><label className="admin-form-label">Name *</label><input className="admin-form-input" value={form.userName} onChange={(e) => setForm(prev => ({ ...prev, userName: e.target.value }))} required /></div>
                    <div className="admin-form-group"><label className="admin-form-label">Email</label><input className="admin-form-input" type="email" value={form.userEmail} onChange={(e) => setForm(prev => ({ ...prev, userEmail: e.target.value }))} /></div>
                  </div>
                  <div className="admin-form-row">
                    <div className="admin-form-group"><label className="admin-form-label">Phone</label><input className="admin-form-input" value={form.userPhone} onChange={(e) => setForm(prev => ({ ...prev, userPhone: e.target.value }))} /></div>
                    <div className="admin-form-group"><label className="admin-form-label">Address</label><input className="admin-form-input" value={form.userAddress} onChange={(e) => setForm(prev => ({ ...prev, userAddress: e.target.value }))} /></div>
                  </div>
                </div>

                {/* Invoice Details */}
                <div style={{ background: 'rgba(129,140,248,0.05)', border: '1px solid rgba(129,140,248,0.15)', borderRadius: 8, padding: 16, marginBottom: 18 }}>
                  <h4 style={{ margin: '0 0 12px', fontSize: 14, color: '#818cf8' }}>📋 Invoice Details</h4>
                  <div className="admin-form-row">
                    <div className="admin-form-group"><label className="admin-form-label">Package</label>
                      <select className="admin-form-select" value={form.packageName} onChange={(e) => handlePackageSelect(e.target.value)}>
                        <option value="">Select Package</option>
                        {packages.map(p => <option key={p.id} value={p.name}>{p.name} — Rs.{p.monthlyPrice}</option>)}
                      </select>
                    </div>
                    <div className="admin-form-group"><label className="admin-form-label">Billing Period</label><input className="admin-form-input" type="month" value={form.billingPeriod} onChange={(e) => setForm(prev => ({ ...prev, billingPeriod: e.target.value }))} /></div>
                  </div>
                  <div className="admin-form-row">
                    <div className="admin-form-group"><label className="admin-form-label">Invoice Date</label><input className="admin-form-input" type="date" value={form.invoiceDate} onChange={(e) => setForm(prev => ({ ...prev, invoiceDate: e.target.value }))} /></div>
                    <div className="admin-form-group"><label className="admin-form-label">Due Date</label><input className="admin-form-input" type="date" value={form.dueDate} onChange={(e) => setForm(prev => ({ ...prev, dueDate: e.target.value }))} /></div>
                  </div>
                  <div className="admin-form-row">
                    <div className="admin-form-group"><label className="admin-form-label">Payment Method</label>
                      <select className="admin-form-select" value={form.paymentMethod} onChange={(e) => setForm(prev => ({ ...prev, paymentMethod: e.target.value }))}>
                        <option value="cash">Cash</option><option value="bank-transfer">Bank Transfer</option><option value="easypaisa">Easypaisa</option><option value="jazzcash">JazzCash</option>
                      </select>
                    </div>
                    <div className="admin-form-group"><label className="admin-form-label">Status</label>
                      <select className="admin-form-select" value={form.status} onChange={(e) => setForm(prev => ({ ...prev, status: e.target.value }))}>
                        <option value="unpaid">Unpaid</option><option value="paid">Paid</option><option value="overdue">Overdue</option><option value="cancelled">Cancelled</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Line Items */}
                <div style={{ background: 'rgba(252,211,77,0.05)', border: '1px solid rgba(252,211,77,0.15)', borderRadius: 8, padding: 16, marginBottom: 18 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <h4 style={{ margin: 0, fontSize: 14, color: '#fcd34d' }}>🧾 Line Items</h4>
                    <button type="button" className="admin-btn admin-btn-sm admin-btn-secondary" onClick={addItem}><FiPlus /> Add Item</button>
                  </div>
                  {form.items.map((item, i) => (
                    <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 70px 100px 100px 36px', gap: 8, marginBottom: 8, alignItems: 'end' }}>
                      <div className="admin-form-group" style={{ margin: 0 }}>
                        {i === 0 && <label className="admin-form-label">Description</label>}
                        <input className="admin-form-input" placeholder="Service description" value={item.description} onChange={(e) => updateItem(i, 'description', e.target.value)} />
                      </div>
                      <div className="admin-form-group" style={{ margin: 0 }}>
                        {i === 0 && <label className="admin-form-label">Qty</label>}
                        <input className="admin-form-input" type="number" min="1" value={item.quantity} onChange={(e) => updateItem(i, 'quantity', e.target.value)} />
                      </div>
                      <div className="admin-form-group" style={{ margin: 0 }}>
                        {i === 0 && <label className="admin-form-label">Rate (Rs.)</label>}
                        <input className="admin-form-input" type="number" min="0" value={item.rate} onChange={(e) => updateItem(i, 'rate', e.target.value)} />
                      </div>
                      <div className="admin-form-group" style={{ margin: 0 }}>
                        {i === 0 && <label className="admin-form-label">Amount</label>}
                        <input className="admin-form-input" type="number" value={item.amount} readOnly style={{ opacity: 0.7 }} />
                      </div>
                      <div style={{ paddingBottom: 2 }}>
                        {form.items.length > 1 && (
                          <button type="button" className="admin-btn-icon danger" onClick={() => removeItem(i)} style={{ width: 36, height: 38 }}><FiX /></button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Totals & Notes */}
                <div className="admin-form-row">
                  <div className="admin-form-group"><label className="admin-form-label">Tax (Rs.)</label><input className="admin-form-input" type="number" min="0" value={form.tax} onChange={(e) => setForm(prev => ({ ...prev, tax: e.target.value }))} /></div>
                  <div className="admin-form-group"><label className="admin-form-label">Discount (Rs.)</label><input className="admin-form-input" type="number" min="0" value={form.discount} onChange={(e) => setForm(prev => ({ ...prev, discount: e.target.value }))} /></div>
                </div>

                <div style={{ textAlign: 'right', fontSize: 20, fontWeight: 700, color: '#2dd4bf', marginBottom: 16 }}>
                  Total: Rs. {getTotal().toLocaleString()}
                </div>

                <div className="admin-form-group"><label className="admin-form-label">Notes (optional)</label><textarea className="admin-form-textarea" value={form.notes} onChange={(e) => setForm(prev => ({ ...prev, notes: e.target.value }))} placeholder="Payment terms, additional notes..." /></div>
              </div>

              <div className="admin-modal-footer">
                <button type="button" className="admin-btn admin-btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="admin-btn admin-btn-primary">{editingInvoice ? 'Update Invoice' : 'Create Invoice'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {showDelete && (
        <div className="admin-modal-overlay" onClick={() => setShowDelete(null)}>
          <div className="admin-modal" style={{ maxWidth: 400 }} onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header"><h3>Confirm Delete</h3><button className="admin-modal-close" onClick={() => setShowDelete(null)}><FiX /></button></div>
            <div className="admin-modal-body"><p className="admin-confirm-text">Delete invoice <strong>{showDelete.invoiceNumber}</strong> for {showDelete.userName}?</p></div>
            <div className="admin-modal-footer">
              <button className="admin-btn admin-btn-secondary" onClick={() => setShowDelete(null)}>Cancel</button>
              <button className="admin-btn admin-btn-danger" onClick={() => handleDelete(showDelete.id)}>Delete Invoice</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InvoicesPage;
