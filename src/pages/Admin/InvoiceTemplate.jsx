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
  // Late fee logic: Rs 150 after due date if unpaid/overdue
  let lateFee = 0;
  const now = new Date();
  let dueDateObj = invoice.dueDate;
  if (dueDateObj && dueDateObj.toDate) dueDateObj = dueDateObj.toDate();
  else if (typeof dueDateObj === 'string') dueDateObj = new Date(dueDateObj);
  if (dueDateObj && now > dueDateObj && invoice.status !== 'paid') {
    lateFee = 150;
  }
  const total = subtotal + tax - discount + lateFee;

  return (
    <div ref={ref} style={{
      fontFamily: "'Inter', 'Segoe UI', sans-serif",
      maxWidth: '820px',
      margin: '32px auto',
      padding: '0',
      background: 'linear-gradient(135deg, #f0fdfa 0%, #fff 100%)',
      color: '#1a1a2e',
      fontSize: '15px',
      lineHeight: '1.7',
      borderRadius: '18px',
      boxShadow: '0 8px 32px 0 rgba(45,212,191,0.10), 0 1.5px 8px 0 rgba(129,140,248,0.08)',
      position: 'relative',
      overflow: 'hidden',
      border: '1.5px solid #e0e7ef'
    }}>
      {/* PAID Watermark */}
      {invoice.status === 'paid' && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%) rotate(-20deg)',
          fontSize: '90px',
          fontWeight: 900,
          color: 'rgba(45,212,191,0.13)',
          letterSpacing: '10px',
          zIndex: 1,
          pointerEvents: 'none',
          userSelect: 'none',
          whiteSpace: 'nowrap',
        }}>
          PAID
        </div>
      )}
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '40px', borderBottom: '3.5px solid #2dd4bf', padding: '40px 48px 28px 48px', background: 'linear-gradient(90deg, #2dd4bf0d 0%, #818cf80d 100%)', borderTopLeftRadius: '18px', borderTopRightRadius: '18px', boxShadow: '0 2px 8px 0 rgba(45,212,191,0.04)', position: 'relative', zIndex: 2 }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: '800', margin: '0 0 4px 0', color: '#0f1729' }}>
            ⚡ NBB
          </h1>
          <p style={{ margin: '0', color: '#6b7280', fontSize: '13px' }}>Internet Service Provider</p>
          <p style={{ margin: '4px 0 0 0', color: '#6b7280', fontSize: '12px' }}>Shahkhailghari, Pakistan</p>
          <p style={{ margin: '2px 0 0 0', color: '#6b7280', fontSize: '12px' }}>📞 +92 3145205027</p>
           <p style={{ margin: '2px 0 0 0', color: '#6b7280', fontSize: '12px' }}>📞 +92 349 3759146</p>
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
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '32px', padding: '0 48px', zIndex: 2, position: 'relative' }}>
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
      <table style={{ width: 'calc(100% - 96px)', margin: '0 48px 24px 48px', borderCollapse: 'separate', borderSpacing: 0, boxShadow: '0 1px 8px 0 rgba(129,140,248,0.04)', background: '#fff', borderRadius: '12px', overflow: 'hidden', zIndex: 2, position: 'relative' }}>
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
            <tr key={i} style={{ borderBottom: '1px solid #e5e7eb', background: i % 2 === 0 ? '#f0fdfa' : '#fff' }}>
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
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '32px', padding: '0 48px', zIndex: 2, position: 'relative' }}>
        <div style={{ width: '320px', background: '#f9fafb', borderRadius: '12px', boxShadow: '0 1px 8px 0 rgba(129,140,248,0.04)', padding: '24px 28px' }}>
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
          {lateFee > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #e5e7eb', color: '#b91c1c', fontWeight: 600 }}>
              <span>Late Fee</span>
              <span>+ Rs. 150</span>
            </div>
          )}
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '14px 0', borderTop: '2px solid #0f1729', marginTop: '4px' }}>
            <span style={{ fontWeight: '700', fontSize: '18px', color: '#0f1729', letterSpacing: '1px' }}>Total</span>
            <span style={{ fontWeight: '900', fontSize: '22px', color: '#2dd4bf', letterSpacing: '1px' }}>Rs. {total.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Notes */}
      {invoice.notes && (
        <div style={{ background: '#e0f2fe', border: '1px solid #bae6fd', borderRadius: '10px', padding: '18px 28px', margin: '0 48px 24px 48px', color: '#0369a1', fontSize: '14px', zIndex: 2, position: 'relative' }}>
          <h4 style={{ margin: '0 0 6px 0', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '1px', color: '#0d9488' }}>Notes</h4>
          <p style={{ margin: '0', color: '#0369a1', fontSize: '14px' }}>{invoice.notes}</p>
        </div>
      )}

      {/* Footer */}
      <div style={{ borderTop: '2.5px solid #e5e7eb', padding: '28px 48px 24px 48px', textAlign: 'center', background: 'linear-gradient(90deg, #f0fdfa 0%, #fff 100%)', borderBottomLeftRadius: '18px', borderBottomRightRadius: '18px', fontSize: '13px', color: '#64748b', zIndex: 2, position: 'relative' }}>
        <p style={{ margin: '0', color: '#64748b', fontSize: '13px' }}>
          Thank you for choosing <span style={{ color: '#2dd4bf', fontWeight: 700 }}>NBB Internet</span>! For any queries, contact us at <span style={{ color: '#818cf8', fontWeight: 600 }}>+92 3145205027</span> or <span style={{ color: '#818cf8', fontWeight: 600 }}>+92 349 3759146</span>
        </p>
        <p style={{ margin: '6px 0 0', color: '#cbd5e1', fontSize: '12px' }}>
          This is a computer-generated invoice. No signature required.
        </p>
      </div>
    </div>
  );
});

InvoiceTemplate.displayName = 'InvoiceTemplate';

export default InvoiceTemplate;
