import React, { useState, useEffect, useRef } from 'react';
import { getUsers, addUser, updateUser, deleteUser, bulkImportUsers, addInvoice, getPackages } from '../../firebase/firebaseService';
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiX, FiUsers, FiUpload, FiDownload, FiCheckCircle, FiAlertTriangle, FiFile, FiFileText, FiPrinter } from 'react-icons/fi';
import InvoiceTemplate from './InvoiceTemplate';
import html2pdf from 'html2pdf.js';
import * as XLSX from 'xlsx';

const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [showDelete, setShowDelete] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', phone: '', address: '', package: '', status: 'active' });

  // Import states
  const [showImport, setShowImport] = useState(false);
  const [importFile, setImportFile] = useState(null);
  const [importPreview, setImportPreview] = useState([]);
  const [importMapping, setImportMapping] = useState({});
  const [importHeaders, setImportHeaders] = useState([]);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState(null);
  const fileInputRef = useRef(null);

  // Invoice states
  const [packages, setPackages] = useState([]);
  const [invoicePreview, setInvoicePreview] = useState(null);
  const [generatingInvoice, setGeneratingInvoice] = useState(null);
  const invoiceRef = useRef(null);

  useEffect(() => { loadUsers(); loadPackages(); }, []);

  const loadPackages = async () => {
    try { const pkgs = await getPackages(); setPackages(pkgs); } catch (err) { console.error(err); }
  };

  const loadUsers = async () => {
    try {
      const data = await getUsers();
      setUsers(data);
    } catch (err) {
      console.error('Error loading users:', err);
    }
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingUser) {
        await updateUser(editingUser.id, form);
      } else {
        await addUser(form);
      }
      setShowModal(false);
      setEditingUser(null);
      setForm({ name: '', email: '', phone: '', address: '', package: '', status: 'active' });
      loadUsers();
    } catch (err) {
      console.error('Error saving user:', err);
    }
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setForm({ name: user.name, email: user.email, phone: user.phone, address: user.address || '', package: user.package || '', status: user.status || 'active' });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    try {
      await deleteUser(id);
      setShowDelete(null);
      loadUsers();
    } catch (err) {
      console.error('Error deleting user:', err);
    }
  };

  const openAddModal = () => {
    setEditingUser(null);
    setForm({ name: '', email: '', phone: '', address: '', package: '', status: 'active' });
    setShowModal(true);
  };

  // ============ IMPORT FUNCTIONS ============
  const requiredFields = ['name', 'email', 'phone', 'address', 'package', 'status'];

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const validTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
      'text/csv',
      '.xlsx', '.xls', '.csv'
    ];

    const ext = file.name.split('.').pop().toLowerCase();
    if (!['xlsx', 'xls', 'csv'].includes(ext)) {
      alert('Please upload a .xlsx, .xls, or .csv file');
      return;
    }

    setImportFile(file);
    setImportResult(null);

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = new Uint8Array(evt.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(sheet, { defval: '' });

        if (jsonData.length === 0) {
          alert('The file appears to be empty');
          return;
        }

        const headers = Object.keys(jsonData[0]);
        setImportHeaders(headers);
        setImportPreview(jsonData.slice(0, 5)); // Preview first 5 rows

        // Auto-map columns
        const autoMap = {};
        requiredFields.forEach(field => {
          const match = headers.find(h =>
            h.toLowerCase().replace(/[_\s-]/g, '').includes(field.toLowerCase().replace(/[_\s-]/g, ''))
          );
          if (match) autoMap[field] = match;
        });

        // Try common column name patterns
        if (!autoMap.name) {
          const nameCol = headers.find(h => /^(full\s?name|customer\s?name|user\s?name|subscriber|name)/i.test(h));
          if (nameCol) autoMap.name = nameCol;
        }
        if (!autoMap.phone) {
          const phoneCol = headers.find(h => /^(phone|mobile|cell|contact|number|tel)/i.test(h));
          if (phoneCol) autoMap.phone = phoneCol;
        }
        if (!autoMap.email) {
          const emailCol = headers.find(h => /^(email|e-mail|mail)/i.test(h));
          if (emailCol) autoMap.email = emailCol;
        }
        if (!autoMap.address) {
          const addrCol = headers.find(h => /^(address|location|area|city)/i.test(h));
          if (addrCol) autoMap.address = addrCol;
        }
        if (!autoMap.package) {
          const pkgCol = headers.find(h => /^(package|plan|bundle|service|subscription)/i.test(h));
          if (pkgCol) autoMap.package = pkgCol;
        }
        if (!autoMap.status) {
          const statusCol = headers.find(h => /^(status|state|active)/i.test(h));
          if (statusCol) autoMap.status = statusCol;
        }

        setImportMapping(autoMap);
      } catch (err) {
        console.error('Error reading file:', err);
        alert('Error reading file. Please make sure it is a valid Excel or CSV file.');
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleImport = async () => {
    if (!importMapping.name && !importMapping.phone) {
      alert('Please map at least the "Name" or "Phone" column');
      return;
    }

    setImporting(true);
    try {
      const file = importFile;
      const reader = new FileReader();

      const result = await new Promise((resolve, reject) => {
        reader.onload = async (evt) => {
          try {
            const data = new Uint8Array(evt.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            const sheetName = workbook.SheetNames[0];
            const sheet = workbook.Sheets[sheetName];
            const jsonData = XLSX.utils.sheet_to_json(sheet, { defval: '' });

            // Map columns to our fields
            const mappedUsers = jsonData.map(row => ({
              name: String(row[importMapping.name] || 'Unknown').trim(),
              email: String(row[importMapping.email] || '').trim(),
              phone: String(row[importMapping.phone] || '').trim(),
              address: String(row[importMapping.address] || '').trim(),
              package: String(row[importMapping.package] || '').trim(),
              status: String(row[importMapping.status] || 'active').trim().toLowerCase()
            })).filter(u => u.name !== 'Unknown' || u.phone);

            // Normalize status
            mappedUsers.forEach(u => {
              if (!['active', 'inactive'].includes(u.status)) {
                u.status = u.status.includes('inact') || u.status.includes('disable') || u.status === '0' ? 'inactive' : 'active';
              }
            });

            const importRes = await bulkImportUsers(mappedUsers);
            resolve(importRes);
          } catch (err) {
            reject(err);
          }
        };
        reader.onerror = reject;
        reader.readAsArrayBuffer(file);
      });

      setImportResult(result);
      if (result.imported > 0) {
        loadUsers(); // Refresh the user list
      }
    } catch (err) {
      console.error('Import error:', err);
      setImportResult({ imported: 0, skipped: 0, errors: [{ user: 'System', error: err.message }], total: 0 });
    }
    setImporting(false);
  };

  const resetImport = () => {
    setImportFile(null);
    setImportPreview([]);
    setImportMapping({});
    setImportHeaders([]);
    setImportResult(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const downloadTemplate = () => {
    const template = [
      { Name: 'John Doe', Email: 'john@example.com', Phone: '03001234567', Address: 'House 1, Street 5', Package: 'Basic - Polo 10MB', Status: 'active' },
      { Name: 'Jane Smith', Email: 'jane@example.com', Phone: '03121234567', Address: 'House 12, Main Road', Package: 'Standard - Super 8MB', Status: 'active' },
    ];
    const ws = XLSX.utils.json_to_sheet(template);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Users');
    XLSX.writeFile(wb, 'users_import_template.xlsx');
  };

  // ============ INVOICE GENERATION ============
  const generateInvoice = async (user) => {
    setGeneratingInvoice(user.id);
    try {
      const userPkg = packages.find(p => p.name === user.package);
      const today = new Date();
      const dueDate = new Date(today);
      dueDate.setDate(dueDate.getDate() + 15);

      const invoiceData = {
        userName: user.name,
        userEmail: user.email || '',
        userPhone: user.phone || '',
        userAddress: user.address || '',
        packageName: user.package || '',
        billingPeriod: `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`,
        invoiceDate: today.toISOString().split('T')[0],
        dueDate: dueDate.toISOString().split('T')[0],
        paymentMethod: 'cash',
        status: 'unpaid',
        tax: 0,
        discount: 0,
        notes: '',
        items: userPkg
          ? [{ description: `Monthly Internet - ${userPkg.name} (${userPkg.speed})`, quantity: 1, rate: userPkg.monthlyPrice, amount: userPkg.monthlyPrice }]
          : [{ description: `Monthly Internet Service - ${user.package || 'Standard'}`, quantity: 1, rate: 0, amount: 0 }],
        total: userPkg ? userPkg.monthlyPrice : 0
      };

      const result = await addInvoice(invoiceData);
      const createdInvoice = { ...invoiceData, invoiceNumber: result.invoiceNumber, id: result.id };
      setInvoicePreview(createdInvoice);
    } catch (err) {
      console.error('Error generating invoice:', err);
      alert('Error generating invoice. Please try again.');
    }
    setGeneratingInvoice(null);
  };

  const downloadInvoicePDF = (invoice) => {
    setTimeout(() => {
      if (!invoiceRef.current) return;
      html2pdf().set({
        margin: 0.3,
        filename: `Invoice-${invoice.invoiceNumber || 'draft'}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
      }).from(invoiceRef.current).save();
    }, 300);
  };

  const printUserInvoice = (invoice) => {
    setTimeout(() => {
      const content = invoiceRef.current;
      if (!content) return;
      const printWindow = window.open('', '_blank');
      printWindow.document.write(`
        <html>
          <head>
            <title>Invoice ${invoice.invoiceNumber}</title>
            <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
            <style>body { margin: 0; padding: 20px; font-family: 'Inter', sans-serif; } @media print { body { padding: 0; } }</style>
          </head>
          <body>${content.innerHTML}</body>
        </html>
      `);
      printWindow.document.close();
      printWindow.onload = () => { printWindow.print(); printWindow.close(); };
    }, 300);
  };

  const filtered = users.filter(u => {
    const matchSearch = u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase()) ||
      u.phone?.includes(search);
    const matchFilter = filter === 'all' || u.status === filter;
    return matchSearch && matchFilter;
  });

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-PK', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  if (loading) {
    return <div className="admin-loading" style={{ minHeight: '400px' }}><div className="admin-spinner"></div><p>Loading users...</p></div>;
  }

  return (
    <div>
      <div className="admin-page-header">
        <h1>Users Management</h1>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="admin-btn admin-btn-secondary" onClick={() => { resetImport(); setShowImport(true); }}>
            <FiUpload /> Import Users
          </button>
          <button className="admin-btn admin-btn-primary" onClick={openAddModal}>
            <FiPlus /> Add User
          </button>
        </div>
      </div>

      <div className="admin-card">
        <div className="admin-card-header">
          <div className="admin-toolbar">
            <div className="admin-search-input">
              <FiSearch />
              <input type="text" placeholder="Search users..." value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <select className="admin-filter-select" value={filter} onChange={(e) => setFilter(e.target.value)}>
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="admin-empty">
            <FiUsers />
            <h3>No users found</h3>
            <p>{search ? 'Try adjusting your search' : 'Add your first user to get started'}</p>
          </div>
        ) : (
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Package</th>
                  <th>Status</th>
                  <th>Joined</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((user) => (
                  <tr key={user.id}>
                    <td><strong>{user.name}</strong></td>
                    <td>{user.email}</td>
                    <td>{user.phone}</td>
                    <td>{user.package || '—'}</td>
                    <td><span className={`admin-badge ${user.status}`}>{user.status}</span></td>
                    <td>{formatDate(user.createdAt)}</td>
                    <td>
                      <div className="admin-actions">
                        <button
                          className="admin-btn-icon"
                          onClick={() => generateInvoice(user)}
                          title="Generate Invoice"
                          disabled={generatingInvoice === user.id}
                          style={{ color: '#2dd4bf' }}
                        >
                          {generatingInvoice === user.id
                            ? <span className="admin-spinner" style={{ width: 14, height: 14, borderWidth: 2 }}></span>
                            : <FiFileText />
                          }
                        </button>
                        <button className="admin-btn-icon" onClick={() => handleEdit(user)} title="Edit"><FiEdit2 /></button>
                        <button className="admin-btn-icon danger" onClick={() => setShowDelete(user)} title="Delete"><FiTrash2 /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="admin-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3>{editingUser ? 'Edit User' : 'Add New User'}</h3>
              <button className="admin-modal-close" onClick={() => setShowModal(false)}><FiX /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="admin-modal-body">
                <div className="admin-form-row">
                  <div className="admin-form-group">
                    <label className="admin-form-label">Full Name *</label>
                    <input className="admin-form-input" type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                  </div>
                  <div className="admin-form-group">
                    <label className="admin-form-label">Email *</label>
                    <input className="admin-form-input" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
                  </div>
                </div>
                <div className="admin-form-row">
                  <div className="admin-form-group">
                    <label className="admin-form-label">Phone *</label>
                    <input className="admin-form-input" type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required />
                  </div>
                  <div className="admin-form-group">
                    <label className="admin-form-label">Package</label>
                    <select className="admin-form-select" value={form.package} onChange={(e) => setForm({ ...form, package: e.target.value })}>
                      <option value="">Select Package</option>
                      <option value="Basic - Polo 10MB">Basic - Polo 10MB</option>
                      <option value="Standard - Super 6MB">Standard - Super 6MB</option>
                      <option value="Standard - Super 8MB">Standard - Super 8MB</option>
                      <option value="Premium - Super 10MB">Premium - Super 10MB</option>
                      <option value="Premium - Super 12MB">Premium - Super 12MB</option>
                    </select>
                  </div>
                </div>
                <div className="admin-form-group">
                  <label className="admin-form-label">Address</label>
                  <input className="admin-form-input" type="text" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
                </div>
                <div className="admin-form-group">
                  <label className="admin-form-label">Status</label>
                  <select className="admin-form-select" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
              <div className="admin-modal-footer">
                <button type="button" className="admin-btn admin-btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="admin-btn admin-btn-primary">{editingUser ? 'Update User' : 'Add User'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {showDelete && (
        <div className="admin-modal-overlay" onClick={() => setShowDelete(null)}>
          <div className="admin-modal" style={{ maxWidth: 400 }} onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3>Confirm Delete</h3>
              <button className="admin-modal-close" onClick={() => setShowDelete(null)}><FiX /></button>
            </div>
            <div className="admin-modal-body">
              <p className="admin-confirm-text">Are you sure you want to delete <strong>{showDelete.name}</strong>? This action cannot be undone.</p>
            </div>
            <div className="admin-modal-footer">
              <button className="admin-btn admin-btn-secondary" onClick={() => setShowDelete(null)}>Cancel</button>
              <button className="admin-btn admin-btn-danger" onClick={() => handleDelete(showDelete.id)}>Delete User</button>
            </div>
          </div>
        </div>
      )}

      {/* Import Users Modal */}
      {showImport && (
        <div className="admin-modal-overlay" onClick={() => setShowImport(false)}>
          <div className="admin-modal import-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 700 }}>
            <div className="admin-modal-header">
              <h3><FiUpload /> Import Users from Excel / CSV</h3>
              <button className="admin-modal-close" onClick={() => setShowImport(false)}><FiX /></button>
            </div>
            <div className="admin-modal-body">

              {/* Step 1: Upload File */}
              {!importFile && !importResult && (
                <div className="import-upload-zone">
                  <div
                    className="import-dropzone"
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      const file = e.dataTransfer.files[0];
                      if (file) {
                        const fakeEvent = { target: { files: [file] } };
                        handleFileSelect(fakeEvent);
                      }
                    }}
                  >
                    <FiUpload style={{ fontSize: 40, color: '#2dd4bf', marginBottom: 12 }} />
                    <h4>Drop your Excel or CSV file here</h4>
                    <p>or click to browse</p>
                    <p className="import-formats">Supports: .xlsx, .xls, .csv</p>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".xlsx,.xls,.csv"
                    onChange={handleFileSelect}
                    style={{ display: 'none' }}
                  />
                  <div className="import-template-row">
                    <span>Don't have a file yet?</span>
                    <button className="admin-btn admin-btn-secondary" onClick={downloadTemplate} style={{ fontSize: 12, padding: '6px 14px' }}>
                      <FiDownload /> Download Template
                    </button>
                  </div>
                  <div className="import-instructions">
                    <h4>📋 How to import from NBB Partner Portal:</h4>
                    <ol>
                      <li>Login to <strong>partner.nationalbroadband.pk</strong></li>
                      <li>Go to <strong>Users</strong> or <strong>Customers</strong> section</li>
                      <li>Click <strong>Export</strong> or <strong>Download Excel</strong></li>
                      <li>Upload the downloaded file here</li>
                    </ol>
                  </div>
                </div>
              )}

              {/* Step 2: Map Columns */}
              {importFile && !importResult && (
                <div className="import-mapping-zone">
                  <div className="import-file-info">
                    <FiFile style={{ color: '#2dd4bf' }} />
                    <span><strong>{importFile.name}</strong> — {importPreview.length > 0 ? 'Preview loaded' : 'Reading...'}</span>
                    <button className="admin-btn-icon" onClick={resetImport} title="Remove file"><FiX /></button>
                  </div>

                  {importHeaders.length > 0 && (
                    <>
                      <h4 style={{ marginTop: 16, marginBottom: 10, fontSize: 14, color: '#e2e8f0' }}>
                        Map your columns to user fields:
                      </h4>
                      <div className="import-mapping-grid">
                        {requiredFields.map(field => (
                          <div key={field} className="import-mapping-row">
                            <label className="import-field-label">
                              {field.charAt(0).toUpperCase() + field.slice(1)}
                              {(field === 'name' || field === 'phone') && <span className="import-required">*</span>}
                            </label>
                            <select
                              className="admin-form-select"
                              value={importMapping[field] || ''}
                              onChange={(e) => setImportMapping({ ...importMapping, [field]: e.target.value })}
                            >
                              <option value="">— Skip —</option>
                              {importHeaders.map(h => (
                                <option key={h} value={h}>{h}</option>
                              ))}
                            </select>
                          </div>
                        ))}
                      </div>

                      {/* Preview Table */}
                      {importPreview.length > 0 && (
                        <div style={{ marginTop: 16 }}>
                          <h4 style={{ fontSize: 13, color: '#94a3b8', marginBottom: 8 }}>
                            Preview (first {importPreview.length} rows):
                          </h4>
                          <div className="admin-table-wrapper" style={{ maxHeight: 200 }}>
                            <table className="admin-table" style={{ fontSize: 12 }}>
                              <thead>
                                <tr>
                                  {importHeaders.slice(0, 6).map(h => (
                                    <th key={h}>{h}</th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody>
                                {importPreview.map((row, i) => (
                                  <tr key={i}>
                                    {importHeaders.slice(0, 6).map(h => (
                                      <td key={h}>{String(row[h] || '').substring(0, 30)}</td>
                                    ))}
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}

              {/* Step 3: Import Result */}
              {importResult && (
                <div className="import-result-zone">
                  <div className={`import-result-card ${importResult.imported > 0 ? 'success' : 'warning'}`}>
                    {importResult.imported > 0 ? (
                      <FiCheckCircle style={{ fontSize: 48, color: '#2dd4bf' }} />
                    ) : (
                      <FiAlertTriangle style={{ fontSize: 48, color: '#fbbf24' }} />
                    )}
                    <h3>{importResult.imported > 0 ? 'Import Successful!' : 'Import Complete'}</h3>
                    <div className="import-result-stats">
                      <div className="import-stat">
                        <span className="import-stat-value success">{importResult.imported}</span>
                        <span className="import-stat-label">Imported</span>
                      </div>
                      <div className="import-stat">
                        <span className="import-stat-value warning">{importResult.skipped}</span>
                        <span className="import-stat-label">Skipped (duplicates)</span>
                      </div>
                      <div className="import-stat">
                        <span className="import-stat-value error">{importResult.errors.length}</span>
                        <span className="import-stat-label">Errors</span>
                      </div>
                    </div>
                    {importResult.errors.length > 0 && (
                      <div className="import-errors">
                        <h4>Errors:</h4>
                        {importResult.errors.slice(0, 5).map((err, i) => (
                          <p key={i}>• {err.user}: {err.error}</p>
                        ))}
                      </div>
                    )}
                    <p style={{ color: '#94a3b8', fontSize: 13, marginTop: 12 }}>
                      Dashboard stats have been updated automatically.
                    </p>
                  </div>
                </div>
              )}

            </div>
            <div className="admin-modal-footer">
              {!importResult ? (
                <>
                  <button className="admin-btn admin-btn-secondary" onClick={() => setShowImport(false)}>Cancel</button>
                  {importFile && (
                    <button
                      className="admin-btn admin-btn-primary"
                      onClick={handleImport}
                      disabled={importing}
                    >
                      {importing ? (
                        <><span className="admin-spinner" style={{ width: 16, height: 16, borderWidth: 2 }}></span> Importing...</>
                      ) : (
                        <><FiUpload /> Import Users</>
                      )}
                    </button>
                  )}
                </>
              ) : (
                <button className="admin-btn admin-btn-primary" onClick={() => { setShowImport(false); resetImport(); }}>
                  Done
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Hidden Invoice Template for PDF/Print */}
      <div style={{ position: 'absolute', left: '-9999px', top: 0 }}>
        {invoicePreview && <InvoiceTemplate ref={invoiceRef} invoice={invoicePreview} />}
      </div>

      {/* Invoice Preview Modal */}
      {invoicePreview && (
        <div className="admin-modal-overlay" onClick={() => setInvoicePreview(null)}>
          <div className="admin-modal" style={{ maxWidth: 860, maxHeight: '90vh', overflow: 'auto' }} onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3>🧾 Invoice Generated — {invoicePreview.invoiceNumber}</h3>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <button className="admin-btn admin-btn-sm admin-btn-secondary" onClick={() => downloadInvoicePDF(invoicePreview)}><FiDownload /> PDF</button>
                <button className="admin-btn admin-btn-sm admin-btn-primary" onClick={() => printUserInvoice(invoicePreview)}><FiPrinter /> Print</button>
                <button className="admin-modal-close" onClick={() => setInvoicePreview(null)}><FiX /></button>
              </div>
            </div>
            <div style={{ padding: 24, background: '#f8fafc', borderRadius: '0 0 12px 12px' }}>
              <InvoiceTemplate invoice={invoicePreview} />
            </div>
            <div className="admin-modal-footer" style={{ justifyContent: 'space-between' }}>
              <span style={{ fontSize: 13, color: '#94a3b8' }}>✅ Invoice saved to Firebase. Also visible in Invoices page.</span>
              <button className="admin-btn admin-btn-primary" onClick={() => setInvoicePreview(null)}>Done</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersPage;
