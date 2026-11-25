import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { studentService } from '../../services/studentService';
import { gradeService } from '../../services/gradeService';
import { feeService } from '../../services/feeService';
import StatCard from '../../components/StatCard';
import LoadingSpinner from '../../components/LoadingSpinner';
import { Award, CalendarCheck, CreditCard, BookOpen, CheckCircle2 } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

const StudentDashboard = () => {
  const { user } = useAuth();
  const [student, setStudent] = useState(null);
  const [reportCard, setReportCard] = useState(null);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStudentData = async () => {
      try {
        // Find matching student by email or default first student
        const allStudents = await studentService.getAll();
        const matched = allStudents.find(s => s.email === user?.email) || allStudents[0];
        if (matched) {
          const [details, rCard, invs] = await Promise.all([
            studentService.getById(matched.id),
            gradeService.getReportCard(matched.id),
            feeService.getInvoices({ student: matched.id })
          ]);
          setStudent(details);
          setReportCard(rCard);
          setInvoices(Array.isArray(invs) ? invs : []);
        }
      } catch (err) {
        console.warn('Student portal loading error:', err);
      } finally {
        setLoading(false);
      }
    };

    loadStudentData();
  }, [user]);

  if (loading) return <LoadingSpinner text="Loading Student Academic Dashboard..." />;

  const outstandingBalance = invoices.reduce((acc, inv) => acc + (inv.balance_amount || 0), 0);

  return (
    <div>
      {/* Student Welcome Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%)',
        borderRadius: '20px',
        color: '#ffffff',
        padding: '30px 36px',
        marginBottom: '28px',
        boxShadow: '0 12px 28px -6px rgba(79, 70, 229, 0.35)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <span style={{ fontSize: '13px', fontWeight: 700, background: 'rgba(255,255,255,0.2)', padding: '4px 12px', borderRadius: '9999px', textTransform: 'uppercase' }}>
              Student Academic Profile
            </span>
            <h1 style={{ fontSize: '30px', fontWeight: 800, marginTop: '8px' }}>
              Welcome, {student?.name || user?.full_name}!
            </h1>
            <p style={{ fontSize: '14px', color: '#e0e7ff', marginTop: '4px' }}>
              Student ID: <strong>{student?.student_id || 'SMS-2024-001'}</strong> • {student?.department} • {student?.year}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <Link to="/student/report-card" className="btn btn-secondary" style={{ background: '#ffffff', color: 'var(--primary)' }}>
              <Award size={15} />
              <span>View Report Card</span>
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid-3" style={{ marginBottom: '32px' }}>
        <StatCard 
          title="Attendance Rate"
          value={`${student?.attendance_pct || 0}%`}
          subtitle={`${student?.present_count || 0} / ${student?.total_attendance_records || 0} Sessions`}
          icon={CalendarCheck}
          color={student?.attendance_pct < 75 ? 'danger' : 'success'}
        />
        <StatCard 
          title="Cumulative CGPA"
          value={reportCard?.summary?.cgpa || '0.0'}
          subtitle={`Overall Grade: ${reportCard?.summary?.overall_grade || 'N/A'}`}
          icon={Award}
          color="info"
        />
        <StatCard 
          title="Tuition Balance"
          value={formatCurrency(outstandingBalance)}
          subtitle={outstandingBalance === 0 ? 'All fees settled' : 'Pending payment'}
          icon={CreditCard}
          color={outstandingBalance > 0 ? 'warning' : 'success'}
        />
      </div>

      {/* Enrolled Courses & Recent Exam Performance */}
      <div className="grid-2" style={{ gap: '24px' }}>
        {/* Enrolled Courses Card */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <BookOpen size={20} color="var(--primary)" />
            <h3 style={{ fontSize: '17px', fontWeight: 700 }}>Enrolled Academic Courses</h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {student?.courses?.map((c) => (
              <div key={c.id} style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 14px',
                borderRadius: '10px',
                background: '#f8fafc',
                border: '1px solid #e2e8f0'
              }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '14px', color: '#0f172a' }}>{c.course_title}</div>
                  <div style={{ fontSize: '12px', color: 'var(--slate-500)' }}>{c.course_code}</div>
                </div>
                <span className="badge badge-active">{c.status}</span>
              </div>
            ))}
            {(!student?.courses || student.courses.length === 0) && (
              <div style={{ color: 'var(--slate-500)', fontSize: '13px', padding: '16px 0' }}>
                No active course enrollments.
              </div>
            )}
          </div>
        </div>

        {/* Latest Marks Card */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <Award size={20} color="#059669" />
            <h3 style={{ fontSize: '17px', fontWeight: 700 }}>Recent Examination Marks</h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {student?.marks?.slice(0, 4).map((m) => (
              <div key={m.id} style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 14px',
                borderRadius: '10px',
                background: '#f8fafc',
                border: '1px solid #e2e8f0'
              }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '14px', color: '#0f172a' }}>{m.subject}</div>
                  <div style={{ fontSize: '12px', color: 'var(--slate-500)' }}>{m.exam_type}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 800, fontSize: '14px', color: 'var(--primary)' }}>{m.marks_obtained} / {m.max_marks}</div>
                  <span className="badge badge-active">{m.grade}</span>
                </div>
              </div>
            ))}
            {(!student?.marks || student.marks.length === 0) && (
              <div style={{ color: 'var(--slate-500)', fontSize: '13px', padding: '16px 0' }}>
                No exam marks published yet.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
