import React, { forwardRef } from 'react';

const InvoiceTemplate = forwardRef(({ invoice }, ref) => {
  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    if (typeof timestamp === 'string') return timestamp;
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-PK', { day: '2-digit', month: 'long', year: 'numeric' });
  };

  const subtotal = (invoice.items || []).reduce((sum, item) => sum + (item.amount || 0), 0);
  const tax = invoice.tax || 0;
  const discount = invoice.discount || 0;
  const total = subtotal + tax - discount;

  return (
    <div ref={ref} style={{
      fontFamily: "'Inter', 'Segoe UI', sans-serif",
      maxWidth: '800px',
      margin: '0 auto',
      padding: '40px',
      background: '#ffffff',
      color: '#1a1a2e',
      fontSize: '14px',
      lineHeight: '1.6'
    }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '40px', borderBottom: '3px solid #2dd4bf', paddingBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: '800', margin: '0 0 4px 0', color: '#0f1729' }}>
            ⚡ UBADAH
          </h1>
          <p style={{ margin: '0', color: '#6b7280', fontSize: '13px' }}>Internet Service Provider</p>
          <p style={{ margin: '4px 0 0 0', color: '#6b7280', fontSize: '12px' }}>Shahkhailghari, Pakistan</p>
          <p style={{ margin: '2px 0 0 0', color: '#6b7280', fontSize: '12px' }}>📞 +92 3145205027</p>
          <p style={{ margin: '2px 0 0 0', color: '#6b7280', fontSize: '12px' }}>📧 nbbshahkhailghari@gmail.com</p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <h2 style={{ fontSize: '32px', fontWeight: '800', margin: '0', color: '#2dd4bf', letterSpacing: '2px' }}>
            INVOICE
          </h2>
          <p style={{ margin: '8px 0 2px 0', fontSize: '13px', color: '#6b7280' }}>
            Invoice #: <strong style={{ color: '#1a1a2e' }}>{invoice.invoiceNumber || 'N/A'}</strong>
          </p>
          <p style={{ margin: '2px 0', fontSize: '13px', color: '#6b7280' }}>
            Date: <strong style={{ color: '#1a1a2e' }}>{formatDate(invoice.invoiceDate || invoice.createdAt)}</strong>
          </p>
          <p style={{ margin: '2px 0', fontSize: '13px', color: '#6b7280' }}>
            Due Date: <strong style={{ color: '#1a1a2e' }}>{formatDate(invoice.dueDate)}</strong>
          </p>
          <div style={{
            display: 'inline-block',
            marginTop: '8px',
            padding: '4px 14px',
            borderRadius: '20px',
            fontSize: '12px',
            fontWeight: '600',
            textTransform: 'uppercase',
            background: invoice.status === 'paid' ? '#d1fae5' : invoice.status === 'overdue' ? '#fee2e2' : '#fef3c7',
            color: invoice.status === 'paid' ? '#065f46' : invoice.status === 'overdue' ? '#991b1b' : '#92400e'
          }}>
            {invoice.status || 'unpaid'}
          </div>
        </div>
      </div>

      {/* Bill To */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '32px' }}>
        <div style={{ flex: 1 }}>
          <h3 style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1.5px', color: '#9ca3af', margin: '0 0 8px 0' }}>Bill To</h3>
          <p style={{ margin: '0', fontWeight: '600', fontSize: '16px', color: '#0f1729' }}>{invoice.userName || 'N/A'}</p>
          <p style={{ margin: '4px 0 0', color: '#6b7280', fontSize: '13px' }}>{invoice.userEmail || ''}</p>
          <p style={{ margin: '2px 0 0', color: '#6b7280', fontSize: '13px' }}>{invoice.userPhone || ''}</p>
          <p style={{ margin: '2px 0 0', color: '#6b7280', fontSize: '13px' }}>{invoice.userAddress || ''}</p>
        </div>
        <div style={{ flex: 1, textAlign: 'right' }}>
          <h3 style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1.5px', color: '#9ca3af', margin: '0 0 8px 0' }}>Payment Info</h3>
          <p style={{ margin: '0', color: '#6b7280', fontSize: '13px' }}>Package: <strong style={{ color: '#1a1a2e' }}>{invoice.packageName || 'N/A'}</strong></p>
          <p style={{ margin: '4px 0 0', color: '#6b7280', fontSize: '13px' }}>Billing Period: <strong style={{ color: '#1a1a2e' }}>{invoice.billingPeriod || 'N/A'}</strong></p>
          <p style={{ margin: '4px 0 0', color: '#6b7280', fontSize: '13px' }}>Method: <strong style={{ color: '#1a1a2e', textTransform: 'capitalize' }}>{invoice.paymentMethod || 'N/A'}</strong></p>
        </div>
      </div>

      {/* Items Table */}
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '24px' }}>
        <thead>
          <tr style={{ background: '#0f1729' }}>
            <th style={{ padding: '12px 16px', textAlign: 'left', color: '#e2e8f0', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '600' }}>#</th>
            <th style={{ padding: '12px 16px', textAlign: 'left', color: '#e2e8f0', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '600' }}>Description</th>
            <th style={{ padding: '12px 16px', textAlign: 'center', color: '#e2e8f0', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '600' }}>Qty</th>
            <th style={{ padding: '12px 16px', textAlign: 'right', color: '#e2e8f0', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '600' }}>Rate (Rs.)</th>
            <th style={{ padding: '12px 16px', textAlign: 'right', color: '#e2e8f0', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '600' }}>Amount (Rs.)</th>
          </tr>
        </thead>
        <tbody>
          {(invoice.items || []).map((item, i) => (
            <tr key={i} style={{ borderBottom: '1px solid #e5e7eb', background: i % 2 === 0 ? '#f9fafb' : '#ffffff' }}>
              <td style={{ padding: '12px 16px', color: '#6b7280' }}>{i + 1}</td>
              <td style={{ padding: '12px 16px', color: '#1a1a2e', fontWeight: '500' }}>{item.description}</td>
              <td style={{ padding: '12px 16px', textAlign: 'center', color: '#6b7280' }}>{item.quantity || 1}</td>
              <td style={{ padding: '12px 16px', textAlign: 'right', color: '#6b7280' }}>{(item.rate || item.amount || 0).toLocaleString()}</td>
              <td style={{ padding: '12px 16px', textAlign: 'right', color: '#1a1a2e', fontWeight: '600' }}>{(item.amount || 0).toLocaleString()}</td>
            </tr>
          ))}
          {(!invoice.items || invoice.items.length === 0) && (
            <tr>
              <td colSpan="5" style={{ padding: '24px 16px', textAlign: 'center', color: '#9ca3af' }}>No items added</td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Totals */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '32px' }}>
        <div style={{ width: '280px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #e5e7eb' }}>
            <span style={{ color: '#6b7280' }}>Subtotal</span>
            <span style={{ fontWeight: '500' }}>Rs. {subtotal.toLocaleString()}</span>
          </div>
          {tax > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #e5e7eb' }}>
              <span style={{ color: '#6b7280' }}>Tax</span>
              <span style={{ fontWeight: '500' }}>Rs. {tax.toLocaleString()}</span>
            </div>
          )}
          {discount > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #e5e7eb' }}>
              <span style={{ color: '#6b7280' }}>Discount</span>
              <span style={{ fontWeight: '500', color: '#059669' }}>- Rs. {discount.toLocaleString()}</span>
            </div>
          )}
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderTop: '2px solid #0f1729', marginTop: '4px' }}>
            <span style={{ fontWeight: '700', fontSize: '16px', color: '#0f1729' }}>Total</span>
            <span style={{ fontWeight: '800', fontSize: '18px', color: '#2dd4bf' }}>Rs. {total.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Notes */}
      {invoice.notes && (
        <div style={{ background: '#f0fdfa', border: '1px solid #99f6e4', borderRadius: '8px', padding: '16px', marginBottom: '24px' }}>
          <h4 style={{ margin: '0 0 6px 0', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px', color: '#0d9488' }}>Notes</h4>
          <p style={{ margin: '0', color: '#475569', fontSize: '13px' }}>{invoice.notes}</p>
        </div>
      )}

      {/* Footer */}
      <div style={{ borderTop: '2px solid #e5e7eb', paddingTop: '20px', textAlign: 'center' }}>
        <p style={{ margin: '0', color: '#9ca3af', fontSize: '12px' }}>
          Thank you for choosing Ubadah Internet! For any queries, contact us at +92 3145205027
        </p>
        <p style={{ margin: '6px 0 0', color: '#d1d5db', fontSize: '11px' }}>
          This is a computer-generated invoice. No signature required.
        </p>
      </div>
    </div>
  );
});

InvoiceTemplate.displayName = 'InvoiceTemplate';

export default InvoiceTemplate;
