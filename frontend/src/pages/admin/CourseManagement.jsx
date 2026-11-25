import React, { useState, useEffect } from 'react';
import { courseService } from '../../services/courseService';
import { departmentService } from '../../services/departmentService';
import { teacherService } from '../../services/teacherService';
import { studentService } from '../../services/studentService';
import { useAuth } from '../../hooks/useAuth';
import Modal from '../../components/Modal';
import LoadingSpinner from '../../components/LoadingSpinner';
import AlertBanner from '../../components/AlertBanner';
import { BookOpen, Plus, Users, UserPlus, Trash2, Edit } from 'lucide-react';

const CourseManagement = () => {
  const { isAdmin, isTeacher } = useAuth();
  const [courses, setCourses] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [banner, setBanner] = useState(null);

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEnrollModalOpen, setIsEnrollModalOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [enrollStudentId, setEnrollStudentId] = useState('');

  // Course Form
  const [form, setForm] = useState({
    code: '',
    title: '',
    department: '',
    credits: 3,
    semester: 'Semester 1',
    teacher: '',
    description: ''
  });
  const [saving, setSaving] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [cData, dData, tData, sData] = await Promise.all([
        courseService.getAll(),
        departmentService.getAll(),
        teacherService.getAll(),
        studentService.getAll()
      ]);
      setCourses(Array.isArray(cData) ? cData : []);
      setDepartments(Array.isArray(dData) ? dData : []);
      setTeachers(Array.isArray(tData) ? tData : []);
      setStudents(Array.isArray(sData) ? sData : []);
    } catch (err) {
      setBanner({ type: 'error', message: 'Failed to load courses.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSaveCourse = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await courseService.create(form);
      setBanner({ type: 'success', message: 'Course created successfully.' });
      setIsAddModalOpen(false);
      setForm({ code: '', title: '', department: '', credits: 3, semester: 'Semester 1', teacher: '', description: '' });
      loadData();
    } catch (err) {
      setBanner({ type: 'error', message: 'Failed to create course.' });
    } finally {
      setSaving(false);
    }
  };

  const handleEnrollStudent = async (e) => {
    e.preventDefault();
    if (!selectedCourse || !enrollStudentId) return;
    try {
      await courseService.enrollStudent(selectedCourse.id, enrollStudentId);
      setBanner({ type: 'success', message: 'Student successfully registered for course.' });
      setIsEnrollModalOpen(false);
      setEnrollStudentId('');
      loadData();
    } catch (err) {
      setBanner({ type: 'error', message: 'Enrollment failed or student is already enrolled.' });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this course?')) return;
    try {
      await courseService.delete(id);
      setBanner({ type: 'success', message: 'Course deleted.' });
      loadData();
    } catch (err) {
      setBanner({ type: 'error', message: 'Failed to delete course.' });
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
          <h1 style={{ fontSize: '26px', fontWeight: 800, color: '#0f172a' }}>
            Course & Curriculum Management
          </h1>
          <p style={{ fontSize: '13.5px', color: 'var(--slate-500)', marginTop: '4px' }}>
            Manage course offerings, credit allocations, faculty assignments, and student enrollments
          </p>
        </div>

        {isAdmin && (
          <button onClick={() => setIsAddModalOpen(true)} className="btn btn-primary">
            <Plus size={16} />
            <span>Create New Course</span>
          </button>
        )}
      </div>

      {loading ? (
        <LoadingSpinner text="Loading courses catalog..." />
      ) : (
        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Course Code</th>
                <th>Course Title</th>
                <th>Department</th>
                <th>Credits</th>
                <th>Semester</th>
                <th>Assigned Instructor</th>
                <th>Enrolled</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {courses.map((c) => (
                <tr key={c.id}>
                  <td style={{ fontWeight: 800, color: 'var(--primary)' }}>{c.code}</td>
                  <td style={{ fontWeight: 700 }}>{c.title}</td>
                  <td>{c.department_name || 'General'}</td>
                  <td><span className="badge badge-active">{c.credits} Credits</span></td>
                  <td>{c.semester}</td>
                  <td>{c.teacher_name || <span style={{ color: 'var(--slate-400)' }}>Unassigned</span>}</td>
                  <td>
                    <span style={{ fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <Users size={14} color="var(--primary)" />
                      {c.enrolled_students_count}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '6px' }}>
                      {(isAdmin || isTeacher) && (
                        <button 
                          onClick={() => { setSelectedCourse(c); setIsEnrollModalOpen(true); }}
                          className="btn btn-secondary"
                          style={{ padding: '6px 10px', fontSize: '12px' }}
                          title="Register Student to Course"
                        >
                          <UserPlus size={14} />
                        </button>
                      )}
                      {isAdmin && (
                        <button 
                          onClick={() => handleDelete(c.id)}
                          className="btn btn-danger"
                          style={{ padding: '6px 10px', fontSize: '12px' }}
                          title="Delete Course"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {courses.length === 0 && (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '36px', color: 'var(--slate-500)' }}>
                    No courses found. Click "Create New Course" to add to catalog.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Create Course Modal */}
      <Modal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)}
        title="Create New Academic Course"
        maxWidth="600px"
      >
        <form onSubmit={handleSaveCourse}>
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Course Code *</label>
              <input 
                type="text" 
                className="form-input" 
                placeholder="e.g. CS301" 
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value })}
                required 
              />
            </div>

            <div className="form-group">
              <label className="form-label">Course Title *</label>
              <input 
                type="text" 
                className="form-input" 
                placeholder="e.g. Operating Systems" 
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required 
              />
            </div>
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Department</label>
              <select 
                className="form-select"
                value={form.department}
                onChange={(e) => setForm({ ...form, department: e.target.value })}
              >
                <option value="">-- Choose Department --</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>{d.name} ({d.code})</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Credits</label>
              <input 
                type="number" 
                min="1" 
                max="10"
                className="form-input" 
                value={form.credits}
                onChange={(e) => setForm({ ...form, credits: Number(e.target.value) })}
                required 
              />
            </div>
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Semester / Term</label>
              <input 
                type="text" 
                className="form-input" 
                placeholder="Semester 3" 
                value={form.semester}
                onChange={(e) => setForm({ ...form, semester: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Assigned Teacher</label>
              <select 
                className="form-select"
                value={form.teacher}
                onChange={(e) => setForm({ ...form, teacher: e.target.value })}
              >
                <option value="">-- Unassigned --</option>
                {teachers.map((t) => (
                  <option key={t.id} value={t.id}>{t.name} ({t.designation})</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Course Description</label>
            <textarea 
              className="form-textarea"
              rows={2}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '20px' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Creating...' : 'Create Course'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Enroll Student Modal */}
      <Modal 
        isOpen={isEnrollModalOpen} 
        onClose={() => setIsEnrollModalOpen(false)}
        title={`Register Student: ${selectedCourse?.title} (${selectedCourse?.code})`}
        maxWidth="480px"
      >
        <form onSubmit={handleEnrollStudent}>
          <div className="form-group">
            <label className="form-label">Select Student to Enroll *</label>
            <select 
              className="form-select"
              value={enrollStudentId}
              onChange={(e) => setEnrollStudentId(e.target.value)}
              required
            >
              <option value="">-- Choose Student --</option>
              {students.map((s) => (
                <option key={s.id} value={s.id}>{s.name} ({s.student_id}) - {s.department}</option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '20px' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsEnrollModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Enroll Student
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default CourseManagement;
