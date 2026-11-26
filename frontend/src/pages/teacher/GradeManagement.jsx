import React, { useState, useEffect } from 'react';
import { gradeService } from '../../services/gradeService';
import { studentService } from '../../services/studentService';
import { useAuth } from '../../hooks/useAuth';
import Modal from '../../components/Modal';
import LoadingSpinner from '../../components/LoadingSpinner';
import AlertBanner from '../../components/AlertBanner';
import { 
  Award, 
  Plus, 
  FileText, 
  Search, 
  Trash2, 
  CheckCircle2, 
  Printer,
  BookOpen
} from 'lucide-react';
import { EXAM_TYPES } from '../../utils/constants';
import { formatDate, getGradeBadgeColor } from '../../utils/formatters';

const GradeManagement = () => {
  const { isAdmin, isTeacher } = useAuth();
  const [grades, setGrades] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [banner, setBanner] = useState(null);

  // Filter
  const [selectedExamType, setSelectedExamType] = useState('All');
  const [search, setSearch] = useState('');

  // Add Marks Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [form, setForm] = useState({
    student: '',
    subject: '',
    exam_type: 'Midterm Exam',
    marks_obtained: '',
    max_marks: 100,
    exam_date: new Date().toISOString().split('T')[0],
    remarks: ''
  });
  const [saving, setSaving] = useState(false);

  // Report Card Modal
  const [isReportCardOpen, setIsReportCardOpen] = useState(false);
  const [reportCardData, setReportCardData] = useState(null);
  const [reportCardLoading, setReportCardLoading] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const params = {};
      if (selectedExamType !== 'All') params.exam_type = selectedExamType;
      if (search) params.search = search;

      const [gradesData, studentsData] = await Promise.all([
        gradeService.getAll(params),
        studentService.getAll()
      ]);
      setGrades(Array.isArray(gradesData) ? gradesData : []);
      setStudents(Array.isArray(studentsData) ? studentsData : []);
    } catch (err) {
      setBanner({ type: 'error', message: 'Failed to load grades.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedExamType]);

  const handleSaveGrade = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await gradeService.create(form);
      setBanner({ type: 'success', message: 'Grade record created successfully.' });
      setIsAddModalOpen(false);
      setForm({
        student: '',
        subject: '',
        exam_type: 'Midterm Exam',
        marks_obtained: '',
        max_marks: 100,
        exam_date: new Date().toISOString().split('T')[0],
        remarks: ''
      });
      loadData();
    } catch (err) {
      setBanner({ type: 'error', message: 'Failed to record marks.' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this grade record?')) return;
    try {
      await gradeService.delete(id);
      setBanner({ type: 'success', message: 'Record deleted.' });
      loadData();
    } catch (err) {
      setBanner({ type: 'error', message: 'Failed to delete grade.' });
    }
  };

  const handleViewReportCard = async (studentId) => {
    setReportCardLoading(true);
    setIsReportCardOpen(true);
    try {
      const data = await gradeService.getReportCard(studentId);
      setReportCardData(data);
    } catch (err) {
      setBanner({ type: 'error', message: 'Failed to generate student report card.' });
    } finally {
      setReportCardLoading(false);
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
          <h1 style={{ fontSize: '26px', fontWeight: 800, color: 'var(--color-primary-dark)' }}>
            Academic Examination & Grade Records
          </h1>
          <p style={{ fontSize: '13.5px', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
            Record test scores, calculate GPA/CGPA, and issue verified academic report cards
          </p>
        </div>

        {(isAdmin || isTeacher) && (
          <button onClick={() => setIsAddModalOpen(true)} className="btn btn-primary">
            <Plus size={16} />
            <span>Enter Examination Marks</span>
          </button>
        )}
      </div>

      {/* Filter Bar */}
      <div className="card" style={{ padding: '16px 20px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
          <div style={{ minWidth: '180px' }}>
            <select 
              className="form-select"
              value={selectedExamType}
              onChange={(e) => setSelectedExamType(e.target.value)}
            >
              <option value="All">All Exam Types</option>
              {EXAM_TYPES.map((et) => (
                <option key={et} value={et}>{et}</option>
              ))}
            </select>
          </div>

          <div style={{ flex: '1 1 200px', position: 'relative' }}>
            <input 
              type="text"
              className="form-input"
              placeholder="Search by student or subject..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ paddingLeft: '36px' }}
            />
            <Search size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--slate-400)' }} />
          </div>

          <button onClick={loadData} className="btn btn-secondary">
            Filter
          </button>
        </div>
      </div>

      {/* Grades Table */}
      {loading ? (
        <LoadingSpinner text="Loading grade records..." />
      ) : (
        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Student ID</th>
                <th>Student Name</th>
                <th>Subject</th>
                <th>Exam Type</th>
                <th>Score</th>
                <th>Percentage</th>
                <th>Grade</th>
                <th>GPA</th>
                <th>Exam Date</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {grades.map((g) => (
                <tr key={g.id}>
                  <td style={{ fontWeight: 800, color: 'var(--primary)' }}>{g.student_id_code}</td>
                  <td style={{ fontWeight: 700 }}>{g.student_name}</td>
                  <td style={{ fontWeight: 600 }}>{g.subject}</td>
                  <td>{g.exam_type}</td>
                  <td>{g.marks_obtained} / {g.max_marks}</td>
                  <td style={{ fontWeight: 800 }}>{g.percentage}%</td>
                  <td>
                    <span className={`badge ${getGradeBadgeColor(g.grade)}`}>
                      {g.grade}
                    </span>
                  </td>
                  <td style={{ fontWeight: 700 }}>{g.gpa.toFixed(1)}</td>
                  <td>{formatDate(g.exam_date)}</td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '6px' }}>
                      <button 
                        onClick={() => handleViewReportCard(g.student)}
                        className="btn btn-secondary"
                        style={{ padding: '6px 10px', fontSize: '12px' }}
                        title="View Full Report Card"
                      >
                        <FileText size={14} />
                      </button>
                      {(isAdmin || isTeacher) && (
                        <button 
                          onClick={() => handleDelete(g.id)}
                          className="btn btn-danger"
                          style={{ padding: '6px 10px', fontSize: '12px' }}
                          title="Delete Record"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {grades.length === 0 && (
                <tr>
                  <td colSpan={10} style={{ textAlign: 'center', padding: '36px', color: 'var(--slate-500)' }}>
                    No marks recorded. Click "Enter Examination Marks" to add exam results.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Marks Modal */}
      <Modal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)}
        title="Record Examination Score"
        maxWidth="540px"
      >
        <form onSubmit={handleSaveGrade}>
          <div className="form-group">
            <label className="form-label">Select Student *</label>
            <select 
              className="form-select"
              value={form.student}
              onChange={(e) => setForm({ ...form, student: e.target.value })}
              required
            >
              <option value="">-- Choose Student --</option>
              {students.map((s) => (
                <option key={s.id} value={s.id}>{s.name} ({s.student_id}) - {s.department}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Subject / Course Name *</label>
            <input 
              type="text"
              className="form-input"
              placeholder="e.g. Data Structures & Algorithms"
              value={form.subject}
              onChange={(e) => setForm({ ...form, subject: e.target.value })}
              required
            />
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Exam Type *</label>
              <select 
                className="form-select"
                value={form.exam_type}
                onChange={(e) => setForm({ ...form, exam_type: e.target.value })}
              >
                {EXAM_TYPES.map((et) => (
                  <option key={et} value={et}>{et}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Exam Date</label>
              <input 
                type="date"
                className="form-input"
                value={form.exam_date}
                onChange={(e) => setForm({ ...form, exam_date: e.target.value })}
              />
            </div>
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Marks Obtained *</label>
              <input 
                type="number"
                step="0.5"
                min="0"
                className="form-input"
                placeholder="e.g. 88"
                value={form.marks_obtained}
                onChange={(e) => setForm({ ...form, marks_obtained: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Maximum Marks *</label>
              <input 
                type="number"
                min="1"
                className="form-input"
                value={form.max_marks}
                onChange={(e) => setForm({ ...form, max_marks: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Remarks / Evaluator Feedback</label>
            <textarea 
              className="form-textarea"
              rows={2}
              placeholder="e.g. Strong conceptual grasp and clean code"
              value={form.remarks}
              onChange={(e) => setForm({ ...form, remarks: e.target.value })}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '20px' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Recording...' : 'Save Grade Record'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Report Card Modal */}
      <Modal 
        isOpen={isReportCardOpen} 
        onClose={() => setIsReportCardOpen(false)}
        title="Student Academic Report Card"
        maxWidth="740px"
      >
        {reportCardLoading || !reportCardData ? (
          <LoadingSpinner text="Compiling GPA and performance records..." />
        ) : (
          <div>
            {/* Header Strip */}
            <div style={{
              background: 'linear-gradient(135deg, var(--color-primary-dark) 0%, var(--color-primary) 100%)',
              color: '#ffffff',
              padding: '24px',
              borderRadius: 'var(--radius-lg)',
              marginBottom: '20px',
              boxShadow: 'var(--shadow-card)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h3 style={{ fontSize: '20px', fontWeight: 800 }}>{reportCardData.student.name}</h3>
                  <div style={{ fontSize: '13px', color: '#CBD5E1', marginTop: '4px' }}>
                    Student ID: <span style={{ color: '#ffffff', fontWeight: 700 }}>{reportCardData.student.student_id}</span> • {reportCardData.student.department} • {reportCardData.student.year}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '11px', color: '#CBD5E1', textTransform: 'uppercase', fontWeight: 700 }}>CUMULATIVE CGPA</div>
                  <div style={{ fontSize: '32px', fontWeight: 900, color: 'var(--color-primary-light)' }}>
                    {reportCardData.summary?.cgpa || '0.0'}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '24px', marginTop: '18px', paddingTop: '14px', borderTop: '1px solid rgba(255,255,255,0.15)', fontSize: '13px' }}>
                <div>Overall Percentage: <strong>{reportCardData.summary?.cumulative_percentage}%</strong></div>
                <div>Overall Grade: <strong>{reportCardData.summary?.overall_grade}</strong></div>
                <div>Status: <strong style={{ color: reportCardData.summary?.result_status === 'PASS' ? '#86EFAC' : '#FCA5A5' }}>{reportCardData.summary?.result_status}</strong></div>
                <div>Attendance: <strong>{reportCardData.summary?.attendance_pct}%</strong></div>
              </div>
            </div>

            {/* Courses / Exam Scores Breakdown */}
            <div className="table-container" style={{ marginBottom: '20px' }}>
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Subject</th>
                    <th>Exam Type</th>
                    <th>Marks</th>
                    <th>Percentage</th>
                    <th>Grade</th>
                    <th>Grade Point</th>
                  </tr>
                </thead>
                <tbody>
                  {reportCardData.records?.map((r) => (
                    <tr key={r.id}>
                      <td style={{ fontWeight: 700 }}>{r.subject}</td>
                      <td>{r.exam_type}</td>
                      <td>{r.marks_obtained} / {r.max_marks}</td>
                      <td style={{ fontWeight: 700 }}>{r.percentage}%</td>
                      <td>
                        <span className={`badge ${getGradeBadgeColor(r.grade)}`}>
                          {r.grade}
                        </span>
                      </td>
                      <td style={{ fontWeight: 700 }}>{r.gpa.toFixed(1)}</td>
                    </tr>
                  ))}
                  {(!reportCardData.records || reportCardData.records.length === 0) && (
                    <tr>
                      <td colSpan={6} style={{ textAlign: 'center', padding: '24px', color: 'var(--slate-500)' }}>
                        No examination records found for this student.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button 
                onClick={() => window.print()}
                className="btn btn-secondary"
              >
                <Printer size={15} />
                <span>Print Official Card</span>
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default GradeManagement;
