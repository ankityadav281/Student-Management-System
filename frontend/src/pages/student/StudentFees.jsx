import React, { useState, useEffect } from 'react';
import { feeService } from '../../services/feeService';
import { studentService } from '../../services/studentService';
import { useAuth } from '../../hooks/useAuth';
import LoadingSpinner from '../../components/LoadingSpinner';
import AlertBanner from '../../components/AlertBanner';
import { CreditCard, CheckCircle2, Clock } from 'lucide-react';
import { formatCurrency, formatDate } from '../../utils/formatters';

const StudentFees = () => {
  const { user } = useAuth();
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadFees = async () => {
      try {
        const students = await studentService.getAll();
        const found = Array.isArray(students) ? students[0] : null;
        if (found) {
          const invData = await feeService.getInvoices({ student: found.id });
          setInvoices(Array.isArray(invData) ? invData : []);
        }
      } catch (err) {
        console.warn('Student fees notice:', err);
      } finally {
        setLoading(false);
      }
    };

    loadFees();
  }, [user]);

  if (loading) return <LoadingSpinner text="Loading Student Tuition & Ledger..." />;

  const totalInvoiced = invoices.reduce((acc, inv) => acc + (Number(inv.total_amount) || 0), 0);
  const totalPaid = invoices.reduce((acc, inv) => acc + (Number(inv.paid_amount) || 0), 0);
  const totalBalance = invoices.reduce((acc, inv) => acc + (Number(inv.balance_amount) || 0), 0);

  return (
    <div style={{ maxWidth: '880px', margin: '0 auto' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--color-primary-dark)' }}>Student Tuition & Fee Ledger</h1>
        <p style={{ fontSize: '13.5px', color: 'var(--color-text-secondary)' }}>Invoiced fees, settlement records, and receipts</p>
      </div>

      {/* Summary Cards */}
      <div className="grid-3" style={{ marginBottom: '28px' }}>
        <div className="card" style={{ padding: '20px' }}>
          <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)', fontWeight: 700 }}>TOTAL BILLED</span>
          <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--color-text-primary)', marginTop: '4px' }}>
            {formatCurrency(totalInvoiced)}
          </div>
        </div>

        <div className="card" style={{ padding: '20px' }}>
          <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)', fontWeight: 700 }}>TOTAL PAID</span>
          <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--color-success)', marginTop: '4px' }}>
            {formatCurrency(totalPaid)}
          </div>
        </div>

        <div className="card" style={{ padding: '20px' }}>
          <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)', fontWeight: 700 }}>OUTSTANDING BALANCE</span>
          <div style={{ fontSize: '24px', fontWeight: 800, color: totalBalance > 0 ? 'var(--color-danger)' : 'var(--color-success)', marginTop: '4px' }}>
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
                <td style={{ fontWeight: 800, color: 'var(--color-primary)' }}>{inv.invoice_no}</td>
                <td style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>{inv.title}</td>
                <td>{inv.academic_term}</td>
                <td><strong>{formatCurrency(inv.total_amount)}</strong></td>
                <td style={{ color: 'var(--color-success)', fontWeight: 700 }}>{formatCurrency(inv.paid_amount)}</td>
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
                <td colSpan={7} style={{ textAlign: 'center', padding: '36px', color: 'var(--color-text-muted)' }}>
                  No fee invoices recorded for your account.
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
