import React, { useState, useEffect } from 'react';
import { attendanceService } from '../../services/attendanceService';
import { studentService } from '../../services/studentService';
import { useAuth } from '../../hooks/useAuth';
import Modal from '../../components/Modal';
import LoadingSpinner from '../../components/LoadingSpinner';
import AlertBanner from '../../components/AlertBanner';
import { 
  CalendarCheck, 
  Plus, 
  Users, 
  Check, 
  X, 
  Clock, 
  Save, 
  Calendar,
  Filter,
  CheckCircle2
} from 'lucide-react';
import { ATTENDANCE_STATUS } from '../../utils/constants';
import { formatDate } from '../../utils/formatters';

const AttendanceManagement = () => {
  const { isAdmin, isTeacher } = useAuth();
  const [attendanceList, setAttendanceList] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [banner, setBanner] = useState(null);

  // Filter
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedStatus, setSelectedStatus] = useState('All');

  // Batch Attendance Mode
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
  const [batchDate, setBatchDate] = useState(new Date().toISOString().split('T')[0]);
  const [batchRecords, setBatchRecords] = useState({});
  const [batchSaving, setBatchSaving] = useState(false);

  // Single Record Modal
  const [isSingleModalOpen, setIsSingleModalOpen] = useState(false);
  const [singleForm, setSingleForm] = useState({
    student: '',
    date: new Date().toISOString().split('T')[0],
    status: 'Present',
    remarks: ''
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const params = {};
      if (selectedDate) params.date = selectedDate;
      if (selectedStatus !== 'All') params.status = selectedStatus;

      const [attData, stuData] = await Promise.all([
        attendanceService.getAll(params),
        studentService.getAll()
      ]);
      setAttendanceList(Array.isArray(attData) ? attData : []);
      setStudents(Array.isArray(stuData) ? stuData : []);
    } catch (err) {
      setBanner({ type: 'error', message: 'Failed to load attendance records.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedDate, selectedStatus]);

  const handleOpenBatch = () => {
    const initialMap = {};
    students.forEach((s) => {
      initialMap[s.id] = { status: 'Present', remarks: '' };
    });
    setBatchRecords(initialMap);
    setIsBatchModalOpen(true);
  };

  const handleBatchStatusChange = (studentId, status) => {
    setBatchRecords((prev) => ({
      ...prev,
      [studentId]: { ...prev[studentId], status }
    }));
  };

  const handleBatchRemarksChange = (studentId, remarks) => {
    setBatchRecords((prev) => ({
      ...prev,
      [studentId]: { ...prev[studentId], remarks }
    }));
  };

  const handleMarkAll = (status) => {
    const updated = {};
    students.forEach((s) => {
      updated[s.id] = { ...batchRecords[s.id], status };
    });
    setBatchRecords(updated);
  };

  const handleSaveBatch = async (e) => {
    e.preventDefault();
    setBatchSaving(true);
    try {
      const payload = Object.entries(batchRecords).map(([studentId, data]) => ({
        student_id: studentId,
        status: data.status,
        remarks: data.remarks
      }));

      const res = await attendanceService.recordBatch(batchDate, payload);
      setBanner({ type: 'success', message: res.message || 'Batch attendance successfully logged.' });
      setIsBatchModalOpen(false);
      loadData();
    } catch (err) {
      setBanner({ type: 'error', message: 'Failed to save batch attendance.' });
    } finally {
      setBatchSaving(false);
    }
  };

  const handleSaveSingle = async (e) => {
    e.preventDefault();
    try {
      await attendanceService.create(singleForm);
      setBanner({ type: 'success', message: 'Attendance record saved.' });
      setIsSingleModalOpen(false);
      loadData();
    } catch (err) {
      setBanner({ type: 'error', message: 'Failed to record attendance.' });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this attendance entry?')) return;
    try {
      await attendanceService.delete(id);
      setBanner({ type: 'success', message: 'Entry removed.' });
      loadData();
    } catch (err) {
      setBanner({ type: 'error', message: 'Failed to delete entry.' });
    }
  };

  return (
    <div>
      {banner && <AlertBanner type={banner.type} message={banner.message} onClose={() => setBanner(null)} />}

      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px',
        marginBottom: '24px'
      }}>
        <div>
          <h1 style={{ fontSize: '26px', fontWeight: 800, color: '#0f172a' }}>
            Classroom Attendance Management
          </h1>
          <p style={{ fontSize: '13.5px', color: 'var(--slate-500)', marginTop: '4px' }}>
            Daily attendance logging, batch submission, and compliance tracking
          </p>
        </div>

        {(isAdmin || isTeacher) && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button onClick={handleOpenBatch} className="btn btn-primary">
              <CalendarCheck size={16} />
              <span>Record Batch Attendance</span>
            </button>
            <button onClick={() => setIsSingleModalOpen(true)} className="btn btn-secondary">
              <Plus size={16} />
              <span>Single Entry</span>
            </button>
          </div>
        )}
      </div>

      {/* Filters Bar */}
      <div className="card" style={{ padding: '16px 20px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Calendar size={16} color="var(--slate-400)" />
            <input 
              type="date"
              className="form-input"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              style={{ width: '180px' }}
            />
          </div>

          <div style={{ minWidth: '160px' }}>
            <select 
              className="form-select"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              <option value="All">All Statuses</option>
              {ATTENDANCE_STATUS.map((st) => (
                <option key={st} value={st}>{st}</option>
              ))}
            </select>
          </div>

          <button onClick={loadData} className="btn btn-secondary" style={{ padding: '9px 18px' }}>
            <Filter size={14} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Attendance Log Table */}
      {loading ? (
        <LoadingSpinner text="Retrieving attendance entries..." />
      ) : (
        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Student ID</th>
                <th>Student Name</th>
                <th>Department</th>
                <th>Status</th>
                <th>Remarks</th>
                <th style={{ textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {attendanceList.map((a) => (
                <tr key={a.id}>
                  <td style={{ fontWeight: 600 }}>{formatDate(a.date)}</td>
                  <td style={{ fontWeight: 800, color: 'var(--primary)' }}>{a.student_id_code}</td>
                  <td style={{ fontWeight: 700 }}>{a.student_name}</td>
                  <td>{a.department}</td>
                  <td>
                    <span className={`badge badge-${a.status?.toLowerCase() || 'present'}`}>
                      {a.status}
                    </span>
                  </td>
                  <td style={{ color: 'var(--slate-600)' }}>{a.remarks || '-'}</td>
                  <td style={{ textAlign: 'right' }}>
                    {(isAdmin || isTeacher) && (
                      <button 
                        onClick={() => handleDelete(a.id)}
                        className="btn btn-secondary"
                        style={{ padding: '6px 10px', fontSize: '12px', color: '#dc2626' }}
                      >
                        Delete
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {attendanceList.length === 0 && (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '36px', color: 'var(--slate-500)' }}>
                    No attendance records found for {selectedDate}. Click "Record Batch Attendance" to submit entries.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Batch Attendance Modal */}
      <Modal 
        isOpen={isBatchModalOpen} 
        onClose={() => setIsBatchModalOpen(false)}
        title="Classroom Batch Attendance Recording"
        maxWidth="800px"
      >
        <form onSubmit={handleSaveBatch}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: '#f8fafc',
            padding: '14px 18px',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            marginBottom: '18px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontWeight: 700, fontSize: '14px' }}>Session Date:</span>
              <input 
                type="date"
                className="form-input"
                value={batchDate}
                onChange={(e) => setBatchDate(e.target.value)}
                style={{ width: '160px' }}
                required
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '12.5px', color: 'var(--slate-500)', fontWeight: 600 }}>Mark All:</span>
              <button 
                type="button" 
                onClick={() => handleMarkAll('Present')}
                className="btn btn-secondary"
                style={{ padding: '4px 12px', fontSize: '12px', color: '#059669' }}
              >
                Present
              </button>
              <button 
                type="button" 
                onClick={() => handleMarkAll('Absent')}
                className="btn btn-secondary"
                style={{ padding: '4px 12px', fontSize: '12px', color: '#dc2626' }}
              >
                Absent
              </button>
            </div>
          </div>

          <div style={{ maxHeight: '420px', overflowY: 'auto', marginBottom: '20px' }}>
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Department</th>
                  <th>Attendance Status</th>
                  <th>Remarks</th>
                </tr>
              </thead>
              <tbody>
                {students.map((s) => {
                  const currentStatus = batchRecords[s.id]?.status || 'Present';
                  return (
                    <tr key={s.id}>
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span style={{ fontWeight: 700 }}>{s.name}</span>
                          <span style={{ fontSize: '12px', color: 'var(--primary)', fontWeight: 600 }}>{s.student_id}</span>
                        </div>
                      </td>
                      <td>
                        <span style={{ fontSize: '12.5px' }}>{s.department}</span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          {['Present', 'Absent', 'Late'].map((st) => (
                            <button
                              key={st}
                              type="button"
                              onClick={() => handleBatchStatusChange(s.id, st)}
                              style={{
                                padding: '5px 12px',
                                borderRadius: '6px',
                                border: '1px solid',
                                fontSize: '12px',
                                fontWeight: 700,
                                cursor: 'pointer',
                                borderColor: currentStatus === st ? 'transparent' : 'var(--slate-200)',
                                background: currentStatus === st ? (st === 'Present' ? '#10b981' : (st === 'Absent' ? '#ef4444' : '#f59e0b')) : '#ffffff',
                                color: currentStatus === st ? '#ffffff' : 'var(--slate-700)',
                                transition: 'all 0.15s'
                              }}
                            >
                              {st}
                            </button>
                          ))}
                        </div>
                      </td>
                      <td>
                        <input 
                          type="text"
                          className="form-input"
                          placeholder="Note..."
                          value={batchRecords[s.id]?.remarks || ''}
                          onChange={(e) => handleBatchRemarksChange(s.id, e.target.value)}
                          style={{ padding: '6px 10px', fontSize: '13px' }}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
            <button 
              type="button" 
              className="btn btn-secondary" 
              onClick={() => setIsBatchModalOpen(false)}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={batchSaving}>
              <Save size={15} />
              <span>{batchSaving ? 'Saving Records...' : 'Save All Attendance'}</span>
            </button>
          </div>
        </form>
      </Modal>

      {/* Single Record Modal */}
      <Modal 
        isOpen={isSingleModalOpen} 
        onClose={() => setIsSingleModalOpen(false)}
        title="Record Single Attendance Entry"
        maxWidth="480px"
      >
        <form onSubmit={handleSaveSingle}>
          <div className="form-group">
            <label className="form-label">Select Student *</label>
            <select 
              className="form-select"
              value={singleForm.student}
              onChange={(e) => setSingleForm({ ...singleForm, student: e.target.value })}
              required
            >
              <option value="">-- Choose Student --</option>
              {students.map((s) => (
                <option key={s.id} value={s.id}>{s.name} ({s.student_id})</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Date *</label>
            <input 
              type="date"
              className="form-input"
              value={singleForm.date}
              onChange={(e) => setSingleForm({ ...singleForm, date: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Status *</label>
            <select 
              className="form-select"
              value={singleForm.status}
              onChange={(e) => setSingleForm({ ...singleForm, status: e.target.value })}
            >
              {ATTENDANCE_STATUS.map((st) => (
                <option key={st} value={st}>{st}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Remarks</label>
            <input 
              type="text"
              className="form-input"
              placeholder="e.g. Approved medical leave"
              value={singleForm.remarks}
              onChange={(e) => setSingleForm({ ...singleForm, remarks: e.target.value })}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '20px' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsSingleModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Save Entry
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AttendanceManagement;
