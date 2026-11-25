import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { studentService } from '../../services/studentService';
import { feeService } from '../../services/feeService';
import LoadingSpinner from '../../components/LoadingSpinner';
import { CreditCard, CheckCircle2, Clock } from 'lucide-react';
import { formatCurrency, formatDate } from '../../utils/formatters';

const StudentFees = () => {
  const { user } = useAuth();
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadFees = async () => {
      try {
        const allStudents = await studentService.getAll();
        const matched = allStudents.find(s => s.email === user?.email) || allStudents[0];
        if (matched) {
          const invs = await feeService.getInvoices({ student: matched.id });
          setInvoices(Array.isArray(invs) ? invs : []);
        }
      } catch (err) {
        console.warn('Fee loading error:', err);
      } finally {
        setLoading(false);
      }
    };

    loadFees();
  }, [user]);

  if (loading) return <LoadingSpinner text="Retrieving student fee invoices..." />;

  const totalInvoiced = invoices.reduce((acc, inv) => acc + Number(inv.total_amount), 0);
  const totalPaid = invoices.reduce((acc, inv) => acc + Number(inv.paid_amount), 0);
  const totalBalance = Math.max(0, totalInvoiced - totalPaid);

  return (
    <div style={{ maxWidth: '840px', margin: '0 auto' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 800 }}>Student Tuition & Fee Ledger</h1>
        <p style={{ fontSize: '13.5px', color: 'var(--slate-500)' }}>Invoiced fees, settlement records, and receipts</p>
      </div>

      {/* Summary Cards */}
      <div className="grid-3" style={{ marginBottom: '28px' }}>
        <div className="card" style={{ padding: '20px' }}>
          <span style={{ fontSize: '12px', color: 'var(--slate-500)', fontWeight: 700 }}>TOTAL BILLED</span>
          <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--dark)', marginTop: '4px' }}>
            {formatCurrency(totalInvoiced)}
          </div>
        </div>

        <div className="card" style={{ padding: '20px' }}>
          <span style={{ fontSize: '12px', color: 'var(--slate-500)', fontWeight: 700 }}>TOTAL PAID</span>
          <div style={{ fontSize: '24px', fontWeight: 800, color: '#059669', marginTop: '4px' }}>
            {formatCurrency(totalPaid)}
          </div>
        </div>

        <div className="card" style={{ padding: '20px' }}>
          <span style={{ fontSize: '12px', color: 'var(--slate-500)', fontWeight: 700 }}>OUTSTANDING BALANCE</span>
          <div style={{ fontSize: '24px', fontWeight: 800, color: totalBalance > 0 ? '#dc2626' : '#059669', marginTop: '4px' }}>
            {formatCurrency(totalBalance)}
          </div>
        </div>
      </div>

      {/* Invoices List */}
      <div className="table-container">
        <table className="custom-table">
          <thead>
            <tr>
              <th>Invoice No</th>
              <th>Description</th>
              <th>Academic Term</th>
              <th>Total Amount</th>
              <th>Paid Amount</th>
              <th>Due Date</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map((inv) => (
              <tr key={inv.id}>
                <td style={{ fontWeight: 800, color: 'var(--primary)' }}>{inv.invoice_no}</td>
                <td style={{ fontWeight: 600 }}>{inv.title}</td>
                <td>{inv.academic_term}</td>
                <td><strong>{formatCurrency(inv.total_amount)}</strong></td>
                <td style={{ color: '#059669', fontWeight: 700 }}>{formatCurrency(inv.paid_amount)}</td>
                <td>{formatDate(inv.due_date)}</td>
                <td>
                  <span className={`badge badge-${inv.status?.toLowerCase() || 'pending'}`}>
                    {inv.status}
                  </span>
                </td>
              </tr>
            ))}
            {invoices.length === 0 && (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '36px', color: 'var(--slate-500)' }}>
                  No fee records found for this student account.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StudentFees;
