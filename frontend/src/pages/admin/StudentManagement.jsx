import React, { useState, useEffect } from 'react';
import { studentService } from '../../services/studentService';
import { useAuth } from '../../hooks/useAuth';
import Modal from '../../components/Modal';
import LoadingSpinner from '../../components/LoadingSpinner';
import AlertBanner from '../../components/AlertBanner';
import { 
  Users, 
  Search, 
  Plus, 
  Filter, 
  Edit, 
  Trash2, 
  Eye, 
  Download, 
  AlertTriangle,
  Award,
  CalendarCheck,
  CreditCard,
  BookOpen,
  CheckCircle2
} from 'lucide-react';
import { DEPARTMENTS, YEARS } from '../../utils/constants';
import { formatDate, formatCurrency, getGradeBadgeColor } from '../../utils/formatters';

const StudentManagement = () => {
  const { isAdmin, isTeacher } = useAuth();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [banner, setBanner] = useState(null);

  // Filters
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [currentStudent, setCurrentStudent] = useState(null);
  const [detailStudent, setDetailStudent] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // Form state
  const initialFormState = {
    student_id: '',
    name: '',
    email: '',
    phone: '',
    department: 'Computer Science',
    year: '1st Year',
    gender: 'Male',
    dob: '',
    status: 'Active',
    address: '',
  };
  const [formData, setFormData] = useState(initialFormState);
  const [submitting, setSubmitting] = useState(false);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (department !== 'All') params.department = department;
      if (statusFilter !== 'All') params.status = statusFilter;

      const data = await studentService.getAll(params);
      setStudents(Array.isArray(data) ? data : []);
    } catch (err) {
      setBanner({ type: 'error', message: 'Failed to fetch students list.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [department, statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchStudents();
  };

  const handleOpenAdd = () => {
    setFormData({
      ...initialFormState,
      student_id: `SMS-2024-${String(students.length + 1).padStart(3, '0')}`
    });
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (student) => {
    setCurrentStudent(student);
    setFormData({
      student_id: student.student_id,
      name: student.name,
      email: student.email,
      phone: student.phone || '',
      department: student.department || 'Computer Science',
      year: student.year || '1st Year',
      gender: student.gender || 'Male',
      dob: student.dob || '',
      status: student.status || 'Active',
      address: student.address || '',
    });
    setIsEditModalOpen(true);
  };

  const handleOpenDetail = async (student) => {
    setDetailLoading(true);
    setIsDetailModalOpen(true);
    try {
      const fullData = await studentService.getById(student.id);
      setDetailStudent(fullData);
    } catch (err) {
      setBanner({ type: 'error', message: 'Failed to load student details.' });
    } finally {
      setDetailLoading(false);
    }
  };

  const handleSaveStudent = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (isEditModalOpen && currentStudent) {
        await studentService.update(currentStudent.id, formData);
        setBanner({ type: 'success', message: 'Student profile updated successfully.' });
        setIsEditModalOpen(false);
      } else {
        await studentService.create(formData);
        setBanner({ type: 'success', message: 'New student enrolled successfully.' });
        setIsAddModalOpen(false);
      }
      fetchStudents();
    } catch (err) {
      setBanner({ type: 'error', message: err.response?.data?.student_id?.[0] || err.response?.data?.email?.[0] || 'Error saving student.' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete student "${name}"? All associated marks and attendance will also be deleted.`)) {
      return;
    }
    try {
      await studentService.delete(id);
      setBanner({ type: 'success', message: `Student "${name}" deleted.` });
      fetchStudents();
    } catch (err) {
      setBanner({ type: 'error', message: 'Failed to delete student.' });
    }
  };

  return (
    <div>
      {banner && <AlertBanner type={banner.type} message={banner.message} onClose={() => setBanner(null)} />}

      {/* Header & Actions */}
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
            Student Information System (SIS)
          </h1>
          <p style={{ fontSize: '13.5px', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
            Manage academic profiles, course registrations, attendance, and exam marks
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <a href={studentService.exportCSVUrl()} target="_blank" rel="noopener noreferrer" className="btn btn-secondary">
            <Download size={15} />
            <span>Export CSV</span>
          </a>
          {isAdmin && (
            <button onClick={handleOpenAdd} className="btn btn-primary">
              <Plus size={16} />
              <span>Enroll New Student</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="card" style={{ padding: '16px 20px', marginBottom: '24px' }}>
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 240px', position: 'relative' }}>
            <input 
              type="text" 
              className="form-input" 
              placeholder="Search by name, student ID, or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ paddingLeft: '38px' }}
            />
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--slate-400)' }} />
          </div>

          <div style={{ minWidth: '180px' }}>
            <select 
              className="form-select"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
            >
              <option value="All">All Departments</option>
              {DEPARTMENTS.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          <div style={{ minWidth: '140px' }}>
            <select 
              className="form-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="All">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
              <option value="Graduated">Graduated</option>
            </select>
          </div>

          <button type="submit" className="btn btn-secondary" style={{ padding: '10px 18px' }}>
            <Filter size={15} />
            <span>Apply Filters</span>
          </button>
        </form>
      </div>

      {/* Students Data Table */}
      {loading ? (
        <LoadingSpinner text="Retrieving student directory..." />
      ) : (
        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Student ID</th>
                <th>Full Name</th>
                <th>Department</th>
                <th>Year</th>
                <th>Attendance %</th>
                <th>Avg Marks %</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {students.map((s) => (
                <tr key={s.id}>
                  <td style={{ fontWeight: 800, color: 'var(--color-primary)' }}>
                    {s.student_id}
                  </td>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontWeight: 700, color: 'var(--color-text-primary)' }}>{s.name}</span>
                      <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>{s.email}</span>
                    </div>
                  </td>
                  <td>
                    <span style={{ fontSize: '13.5px', fontWeight: 500 }}>{s.department}</span>
                  </td>
                  <td>
                    <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-secondary)' }}>{s.year}</span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{
                        fontWeight: 800,
                        fontSize: '13.5px',
                        color: s.attendance_pct < 75 ? 'var(--color-danger)' : 'var(--color-success)'
                      }}>
                        {s.attendance_pct}%
                      </span>
                      {s.attendance_pct < 75 && s.total_attendance_records > 0 && (
                        <AlertTriangle size={14} color="var(--color-danger)" title="Attendance below 75% threshold" />
                      )}
                    </div>
                  </td>
                  <td>
                    <span style={{ fontWeight: 800, fontSize: '13.5px', color: 'var(--color-text-primary)' }}>
                      {s.average_marks}%
                    </span>
                  </td>
                  <td>
                    <span className={`badge badge-${s.status?.toLowerCase() || 'active'}`}>
                      {s.status}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '6px' }}>
                      <button 
                        onClick={() => handleOpenDetail(s)}
                        className="btn btn-secondary"
                        style={{ padding: '6px 10px', fontSize: '12px' }}
                        title="View Detailed Student Profile"
                      >
                        <Eye size={14} />
                      </button>
                      {isAdmin && (
                        <>
                          <button 
                            onClick={() => handleOpenEdit(s)}
                            className="btn btn-secondary"
                            style={{ padding: '6px 10px', fontSize: '12px' }}
                            title="Edit Student Info"
                          >
                            <Edit size={14} />
                          </button>
                          <button 
                            onClick={() => handleDelete(s.id, s.name)}
                            className="btn btn-danger"
                            style={{ padding: '6px 10px', fontSize: '12px' }}
                            title="Delete Student"
                          >
                            <Trash2 size={14} />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {students.length === 0 && (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '40px', color: 'var(--slate-500)' }}>
                    No students match the selected search criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Add / Edit Student Modal */}
      <Modal 
        isOpen={isAddModalOpen || isEditModalOpen} 
        onClose={() => { setIsAddModalOpen(false); setIsEditModalOpen(false); }}
        title={isEditModalOpen ? `Update Student: ${currentStudent?.name}` : "Enroll New Student"}
        maxWidth="680px"
      >
        <form onSubmit={handleSaveStudent}>
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Student ID *</label>
              <input 
                type="text" 
                className="form-input"
                value={formData.student_id}
                onChange={(e) => setFormData({ ...formData, student_id: e.target.value })}
                required 
              />
            </div>

            <div className="form-group">
              <label className="form-label">Full Name *</label>
              <input 
                type="text" 
                className="form-input"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required 
              />
            </div>
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Email Address *</label>
              <input 
                type="email" 
                className="form-input"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required 
              />
            </div>

            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <input 
                type="text" 
                className="form-input"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Department *</label>
              <select 
                className="form-select"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              >
                {DEPARTMENTS.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Academic Year *</label>
              <select 
                className="form-select"
                value={formData.year}
                onChange={(e) => setFormData({ ...formData, year: e.target.value })}
              >
                {YEARS.map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Gender</label>
              <select 
                className="form-select"
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Enrollment Status</label>
              <select 
                className="form-select"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="Graduated">Graduated</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Residential Address</label>
            <textarea 
              className="form-textarea"
              rows={2}
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '20px' }}>
            <button 
              type="button" 
              className="btn btn-secondary"
              onClick={() => { setIsAddModalOpen(false); setIsEditModalOpen(false); }}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Saving...' : (isEditModalOpen ? 'Update Profile' : 'Enroll Student')}
            </button>
          </div>
        </form>
      </Modal>

      {/* Comprehensive Student Details Modal */}
      <Modal 
        isOpen={isDetailModalOpen} 
        onClose={() => setIsDetailModalOpen(false)}
        title={detailStudent ? `${detailStudent.name} (${detailStudent.student_id})` : "Student Profile"}
        maxWidth="820px"
      >
        {detailLoading || !detailStudent ? (
          <LoadingSpinner text="Fetching full academic record..." />
        ) : (
          <div>
            {/* Top Info Banner */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'var(--color-hover)',
              padding: '16px 20px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-border)',
              marginBottom: '20px'
            }}>
              <div>
                <h4 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--color-primary-dark)' }}>{detailStudent.name}</h4>
                <div style={{ display: 'flex', gap: '16px', fontSize: '13px', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
                  <span>{detailStudent.email}</span>
                  <span>•</span>
                  <span>{detailStudent.phone || 'No phone'}</span>
                  <span>•</span>
                  <span>{detailStudent.department} ({detailStudent.year})</span>
                </div>
              </div>
              <span className={`badge badge-${detailStudent.status?.toLowerCase() || 'active'}`} style={{ padding: '6px 14px', fontSize: '13px' }}>
                {detailStudent.status}
              </span>
            </div>

            {/* Performance Overview Cards */}
            <div className="grid-3" style={{ marginBottom: '24px' }}>
              <div className="card" style={{ padding: '16px' }}>
                <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)', fontWeight: 600 }}>ATTENDANCE RATE</span>
                <div style={{ fontSize: '24px', fontWeight: 800, color: detailStudent.attendance_pct < 75 ? 'var(--color-danger)' : 'var(--color-success)', marginTop: '4px' }}>
                  {detailStudent.attendance_pct}%
                </div>
                <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                  {detailStudent.present_count} / {detailStudent.total_attendance_records} classes
                </span>
              </div>

              <div className="card" style={{ padding: '16px' }}>
                <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)', fontWeight: 600 }}>CUMULATIVE AVERAGE</span>
                <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--color-primary)', marginTop: '4px' }}>
                  {detailStudent.average_marks}%
                </div>
                <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                  Across {detailStudent.marks_count} recorded exams
                </span>
              </div>

              <div className="card" style={{ padding: '16px' }}>
                <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)', fontWeight: 600 }}>ACADEMIC STANDING</span>
                <div style={{ fontSize: '24px', fontWeight: 800, color: detailStudent.at_risk ? 'var(--color-danger)' : 'var(--color-success)', marginTop: '4px' }}>
                  {detailStudent.at_risk ? 'At Risk' : 'Good Standing'}
                </div>
                <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                  {detailStudent.at_risk ? 'Requires intervention' : 'Meets all criteria'}
                </span>
              </div>
            </div>

            {/* Examination & Marks Section */}
            <div style={{ marginBottom: '24px' }}>
              <h4 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Award size={16} color="var(--primary)" />
                <span>Recorded Marks & Examination Results</span>
              </h4>
              <div className="table-container">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Subject</th>
                      <th>Exam Type</th>
                      <th>Score</th>
                      <th>Percentage</th>
                      <th>Grade</th>
                    </tr>
                  </thead>
                  <tbody>
                    {detailStudent.marks?.map((m) => (
                      <tr key={m.id}>
                        <td style={{ fontWeight: 600 }}>{m.subject}</td>
                        <td>{m.exam_type}</td>
                        <td>{m.marks_obtained} / {m.max_marks}</td>
                        <td style={{ fontWeight: 700 }}>{m.percentage}%</td>
                        <td>
                          <span className={`badge ${getGradeBadgeColor(m.grade)}`}>
                            {m.grade}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {(!detailStudent.marks || detailStudent.marks.length === 0) && (
                      <tr>
                        <td colSpan={5} style={{ textAlign: 'center', padding: '18px', color: 'var(--slate-500)' }}>
                          No examination marks recorded yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Recent Attendance Log */}
            <div>
              <h4 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <CalendarCheck size={16} color="#059669" />
                <span>Recent Attendance Entries</span>
              </h4>
              <div className="table-container">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Status</th>
                      <th>Course</th>
                      <th>Remarks</th>
                    </tr>
                  </thead>
                  <tbody>
                    {detailStudent.attendance?.map((a) => (
                      <tr key={a.id}>
                        <td>{formatDate(a.date)}</td>
                        <td>
                          <span className={`badge badge-${a.status?.toLowerCase() || 'present'}`}>
                            {a.status}
                          </span>
                        </td>
                        <td>{a.course_title || 'General Class'}</td>
                        <td style={{ color: 'var(--slate-600)' }}>{a.remarks || '-'}</td>
                      </tr>
                    ))}
                    {(!detailStudent.attendance || detailStudent.attendance.length === 0) && (
                      <tr>
                        <td colSpan={4} style={{ textAlign: 'center', padding: '18px', color: 'var(--slate-500)' }}>
                          No attendance records available.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default StudentManagement;
