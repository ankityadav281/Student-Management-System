import React, { useState, useEffect } from 'react';
import { feeService } from '../../services/feeService';
import { studentService } from '../../services/studentService';
import { useAuth } from '../../hooks/useAuth';
import StatCard from '../../components/StatCard';
import Modal from '../../components/Modal';
import LoadingSpinner from '../../components/LoadingSpinner';
import AlertBanner from '../../components/AlertBanner';
import { 
  CreditCard, 
  Plus, 
  Search, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Calendar,
  DollarSign
} from 'lucide-react';
import { formatCurrency, formatDate } from '../../utils/formatters';

const FeeManagement = () => {
  const { isAdmin } = useAuth();
  const [invoices, setInvoices] = useState([]);
  const [summary, setSummary] = useState(null);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [banner, setBanner] = useState(null);

  // Filters
  const [statusFilter, setStatusFilter] = useState('All');
  const [search, setSearch] = useState('');

  // Generate Invoice Modal
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [invoiceForm, setInvoiceForm] = useState({
    student: '',
    invoice_no: '',
    title: '',
    academic_term: 'Fall 2026',
    total_amount: '',
    due_date: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
  });

  // Record Payment Modal
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [paymentForm, setPaymentForm] = useState({
    amount: '',
    payment_method: 'Net Banking',
    transaction_id: '',
    payment_date: new Date().toISOString().split('T')[0],
    notes: '',
  });

  const [saving, setSaving] = useState(false);

  const loadData = async () => {
    try {
      const params = {};
      if (statusFilter !== 'All') params.status = statusFilter;
      if (search) params.search = search;

      const [invData, sumData, stuData] = await Promise.all([
        feeService.getInvoices(params),
        feeService.getSummary(),
        studentService.getAll()
      ]);
      setInvoices(Array.isArray(invData) ? invData : []);
      setSummary(sumData);
      setStudents(Array.isArray(stuData) ? stuData : []);
    } catch (err) {
      setBanner({ type: 'error', message: 'Failed to retrieve fee records.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [statusFilter]);

  const handleOpenAddInvoice = () => {
    const invNo = `INV-2026-${String(invoices.length + 101).padStart(4, '0')}`;
    setInvoiceForm({
      ...invoiceForm,
      invoice_no: invNo
    });
    setIsInvoiceModalOpen(true);
  };

  const handleSaveInvoice = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await feeService.createInvoice(invoiceForm);
      setBanner({ type: 'success', message: 'Fee invoice issued successfully.' });
      setIsInvoiceModalOpen(false);
      loadData();
    } catch (err) {
      setBanner({ type: 'error', message: 'Failed to issue fee invoice.' });
    } finally {
      setSaving(false);
    }
  };

  const handleOpenPayment = (invoice) => {
    setSelectedInvoice(invoice);
    setPaymentForm({
      amount: invoice.balance_amount,
      payment_method: 'Net Banking',
      transaction_id: `TXN-${Math.floor(100000 + Math.random() * 900000)}`,
      payment_date: new Date().toISOString().split('T')[0],
      notes: '',
    });
    setIsPaymentModalOpen(true);
  };

  const handleSavePayment = async (e) => {
    e.preventDefault();
    if (!selectedInvoice) return;
    setSaving(true);
    try {
      await feeService.recordPayment({
        invoice: selectedInvoice.id,
        ...paymentForm
      });
      setBanner({ type: 'success', message: 'Payment recorded and invoice updated.' });
      setIsPaymentModalOpen(false);
      loadData();
    } catch (err) {
      setBanner({ type: 'error', message: 'Failed to record payment.' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      {banner && <AlertBanner type={banner.type} message={banner.message} onClose={() => setBanner(null)} />}

      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px',
        marginBottom: '24px'
      }}>
        <div>
          <h1 style={{ fontSize: '26px', fontWeight: 800, color: 'var(--color-primary-dark)' }}>
            Tuition & Fee Records Management
          </h1>
          <p style={{ fontSize: '13.5px', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
            Issue fee invoices, monitor outstanding balances, and track payment histories
          </p>
        </div>

        {isAdmin && (
          <button onClick={handleOpenAddInvoice} className="btn btn-primary">
            <Plus size={16} />
            <span>Generate Fee Invoice</span>
          </button>
        )}
      </div>

      {/* Financial Overview Stats */}
      <div className="grid-4" style={{ marginBottom: '28px' }}>
        <StatCard 
          title="Total Invoiced"
          value={formatCurrency(summary?.total_invoiced || 0)}
          subtitle={`${summary?.total_invoices || 0} Total invoices`}
          icon={CreditCard}
          color="primary"
        />
        <StatCard 
          title="Total Collected"
          value={formatCurrency(summary?.total_collected || 0)}
          subtitle={`${summary?.collection_rate || 0}% collection rate`}
          icon={CheckCircle2}
          color="success"
        />
        <StatCard 
          title="Outstanding Balance"
          value={formatCurrency(summary?.total_outstanding || 0)}
          subtitle="Pending collection"
          icon={Clock}
          color="warning"
        />
        <StatCard 
          title="Overdue Invoices"
          value={summary?.status_breakdown?.Overdue || 0}
          subtitle="Past due date"
          icon={AlertCircle}
          color="danger"
        />
      </div>

      {/* Search & Filters */}
      <div className="card" style={{ padding: '16px 20px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
          <div style={{ minWidth: '180px' }}>
            <select 
              className="form-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="All">All Invoice Statuses</option>
              <option value="Paid">Paid</option>
              <option value="Partial">Partial</option>
              <option value="Pending">Pending</option>
              <option value="Overdue">Overdue</option>
            </select>
          </div>

          <div style={{ flex: '1 1 240px', position: 'relative' }}>
            <input 
              type="text"
              className="form-input"
              placeholder="Search by invoice number or student..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ paddingLeft: '38px' }}
            />
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
          </div>

          <button onClick={loadData} className="btn btn-secondary">
            Filter
          </button>
        </div>
      </div>

      {/* Invoices Table */}
      {loading ? (
        <LoadingSpinner text="Retrieving fee invoices..." />
      ) : (
        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Invoice No</th>
                <th>Student</th>
                <th>Title / Description</th>
                <th>Billed Amount</th>
                <th>Paid Amount</th>
                <th>Balance Due</th>
                <th>Due Date</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((inv) => (
                <tr key={inv.id}>
                  <td style={{ fontWeight: 800, color: 'var(--color-primary)' }}>{inv.invoice_no}</td>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontWeight: 700, color: 'var(--color-text-primary)' }}>{inv.student_name}</span>
                      <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>{inv.student_id_code}</span>
                    </div>
                  </td>
                  <td style={{ fontWeight: 600 }}>{inv.title}</td>
                  <td><strong>{formatCurrency(inv.total_amount)}</strong></td>
                  <td style={{ color: 'var(--color-success)', fontWeight: 700 }}>{formatCurrency(inv.paid_amount)}</td>
                  <td style={{ color: inv.balance_amount > 0 ? 'var(--color-danger)' : 'var(--color-success)', fontWeight: 700 }}>
                    {formatCurrency(inv.balance_amount)}
                  </td>
                  <td>{formatDate(inv.due_date)}</td>
                  <td>
                    <span className={`badge badge-${inv.status?.toLowerCase() || 'pending'}`}>
                      {inv.status}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    {inv.status !== 'Paid' && isAdmin && (
                      <button 
                        onClick={() => handleOpenPayment(inv)}
                        className="btn btn-secondary"
                        style={{ padding: '6px 12px', fontSize: '12px', color: 'var(--color-success)' }}
                      >
                        Record Payment
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {invoices.length === 0 && (
                <tr>
                  <td colSpan={9} style={{ textAlign: 'center', padding: '36px', color: 'var(--color-text-muted)' }}>
                    No fee invoices generated yet. Click "Generate Fee Invoice" to issue student fee billing.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Generate Invoice Modal */}
      <Modal 
        isOpen={isInvoiceModalOpen} 
        onClose={() => setIsInvoiceModalOpen(false)}
        title="Generate Student Fee Invoice"
        maxWidth="540px"
      >
        <form onSubmit={handleSaveInvoice}>
          <div className="form-group">
            <label className="form-label">Student *</label>
            <select 
              className="form-select"
              value={invoiceForm.student}
              onChange={(e) => setInvoiceForm({ ...invoiceForm, student: e.target.value })}
              required
            >
              <option value="">-- Choose Student --</option>
              {students.map((s) => (
                <option key={s.id} value={s.id}>{s.name} ({s.student_id}) - {s.department}</option>
              ))}
            </select>
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Invoice Number *</label>
              <input 
                type="text" 
                className="form-input" 
                value={invoiceForm.invoice_no}
                onChange={(e) => setInvoiceForm({ ...invoiceForm, invoice_no: e.target.value })}
                required 
              />
            </div>

            <div className="form-group">
              <label className="form-label">Total Amount (INR) *</label>
              <input 
                type="number" 
                min="100" 
                className="form-input" 
                placeholder="e.g. 45000"
                value={invoiceForm.total_amount}
                onChange={(e) => setInvoiceForm({ ...invoiceForm, total_amount: e.target.value })}
                required 
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Invoice Title *</label>
            <input 
              type="text" 
              className="form-input" 
              placeholder="e.g. Semester 5 Tuition Fee"
              value={invoiceForm.title}
              onChange={(e) => setInvoiceForm({ ...invoiceForm, title: e.target.value })}
              required 
            />
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Academic Term</label>
              <input 
                type="text" 
                className="form-input" 
                value={invoiceForm.academic_term}
                onChange={(e) => setInvoiceForm({ ...invoiceForm, academic_term: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Due Date *</label>
              <input 
                type="date" 
                className="form-input" 
                value={invoiceForm.due_date}
                onChange={(e) => setInvoiceForm({ ...invoiceForm, due_date: e.target.value })}
                required 
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '20px' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsInvoiceModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Generating...' : 'Issue Invoice'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Record Payment Modal */}
      <Modal 
        isOpen={isPaymentModalOpen} 
        onClose={() => setIsPaymentModalOpen(false)}
        title={`Record Payment for ${selectedInvoice?.invoice_no}`}
        maxWidth="500px"
      >
        <form onSubmit={handleSavePayment}>
          <div style={{ background: 'var(--color-hover)', padding: '14px', borderRadius: 'var(--radius-md)', marginBottom: '16px', fontSize: '13px' }}>
            <div>Student: <strong>{selectedInvoice?.student_name}</strong></div>
            <div>Invoice Title: <strong>{selectedInvoice?.title}</strong></div>
            <div>Total Fee: <strong>{formatCurrency(selectedInvoice?.total_amount)}</strong></div>
            <div>Outstanding: <strong style={{ color: 'var(--color-danger)' }}>{formatCurrency(selectedInvoice?.balance_amount)}</strong></div>
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Payment Amount *</label>
              <input 
                type="number" 
                step="0.01"
                min="1"
                max={selectedInvoice?.balance_amount || selectedInvoice?.total_amount}
                className="form-input" 
                value={paymentForm.amount}
                onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                required 
              />
            </div>

            <div className="form-group">
              <label className="form-label">Payment Method *</label>
              <select 
                className="form-select"
                value={paymentForm.payment_method}
                onChange={(e) => setPaymentForm({ ...paymentForm, payment_method: e.target.value })}
              >
                <option value="Net Banking">Net Banking</option>
                <option value="UPI">UPI</option>
                <option value="Card">Credit / Debit Card</option>
                <option value="Cash">Cash</option>
                <option value="Cheque">Cheque</option>
              </select>
            </div>
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Transaction ID / Ref</label>
              <input 
                type="text" 
                className="form-input" 
                placeholder="TXN-982341"
                value={paymentForm.transaction_id}
                onChange={(e) => setPaymentForm({ ...paymentForm, transaction_id: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Payment Date</label>
              <input 
                type="date" 
                className="form-input" 
                value={paymentForm.payment_date}
                onChange={(e) => setPaymentForm({ ...paymentForm, payment_date: e.target.value })}
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '20px' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsPaymentModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Recording...' : 'Confirm Payment'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default FeeManagement;
