import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { studentService } from '../../services/studentService';
import { gradeService } from '../../services/gradeService';
import { feeService } from '../../services/feeService';
import StatCard from '../../components/StatCard';
import LoadingSpinner from '../../components/LoadingSpinner';
import AlertBanner from '../../components/AlertBanner';
import { 
  Award, 
  CalendarCheck, 
  CreditCard, 
  BookOpen, 
  User, 
  Clock, 
  AlertTriangle,
  ArrowRight,
  GraduationCap
} from 'lucide-react';
import { formatCurrency, formatDate, getGradeBadgeColor } from '../../utils/formatters';

const StudentDashboard = () => {
  const { user } = useAuth();
  const [student, setStudent] = useState(null);
  const [reportCard, setReportCard] = useState(null);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStudentData = async () => {
      try {
        const studentsList = await studentService.getAll();
        const found = Array.isArray(studentsList) ? studentsList[0] : null;

        if (found) {
          const [detailData, reportData, invData] = await Promise.all([
            studentService.getById(found.id),
            gradeService.getReportCard(found.student_id),
            feeService.getInvoices({ student: found.id })
          ]);
          setStudent(detailData);
          setReportCard(reportData);
          setInvoices(Array.isArray(invData) ? invData : []);
        }
      } catch (err) {
        console.warn('Student dashboard error:', err);
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
      {/* Student Welcome Banner (Deep Navy + Academic Blue visual identity) */}
      <div style={{
        background: 'linear-gradient(135deg, var(--color-primary-dark) 0%, var(--color-primary) 100%)',
        borderRadius: 'var(--radius-xl)',
        color: '#ffffff',
        padding: '30px 36px',
        marginBottom: '28px',
        boxShadow: 'var(--shadow-card)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <span style={{ 
              fontSize: '12.5px', 
              fontWeight: 700, 
              background: 'rgba(255,255,255,0.15)', 
              padding: '4px 12px', 
              borderRadius: 'var(--radius-full)', 
              textTransform: 'uppercase',
              letterSpacing: '0.5px' 
            }}>
              Student Academic Profile
            </span>
            <h1 style={{ fontSize: '28px', fontWeight: 800, marginTop: '8px' }}>
              Welcome, {student?.name || user?.full_name}!
            </h1>
            <p style={{ fontSize: '14px', color: '#CBD5E1', marginTop: '4px' }}>
              Student ID: <strong style={{ color: '#ffffff' }}>{student?.student_id || 'SMS-2024-001'}</strong> • {student?.department} • {student?.year}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <Link to="/student/report-card" className="btn btn-secondary">
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
          color="indigo"
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
            <BookOpen size={20} color="var(--color-primary)" />
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--color-primary-dark)' }}>Enrolled Academic Courses</h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {student?.courses?.map((c) => (
              <div key={c.id} style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 14px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--color-hover)',
                border: '1px solid var(--color-border)'
              }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '14px', color: 'var(--color-text-primary)' }}>{c.course_title}</div>
                  <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>{c.course_code}</div>
                </div>
                <span className="badge badge-active">{c.status}</span>
              </div>
            ))}
            {(!student?.courses || student.courses.length === 0) && (
              <div style={{ color: 'var(--color-text-muted)', fontSize: '13px', padding: '16px 0' }}>
                No active course enrollments.
              </div>
            )}
          </div>
        </div>

        {/* Examination Scores Card */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Award size={20} color="var(--color-secondary)" />
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--color-primary-dark)' }}>Recent Examination Results</h3>
            </div>
            <Link to="/student/report-card" style={{ fontSize: '12.5px', color: 'var(--color-primary)', fontWeight: 700, textDecoration: 'none' }}>
              Full Report &rarr;
            </Link>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {reportCard?.records?.slice(0, 4).map((r) => (
              <div key={r.id} style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 14px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--color-hover)',
                border: '1px solid var(--color-border)'
              }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '14px', color: 'var(--color-text-primary)' }}>{r.subject}</div>
                  <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>{r.exam_type}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 800, fontSize: '14px', color: 'var(--color-text-primary)' }}>{r.percentage}%</div>
                  <span className={`badge ${getGradeBadgeColor(r.grade)}`}>{r.grade}</span>
                </div>
              </div>
            ))}
            {(!reportCard?.records || reportCard.records.length === 0) && (
              <div style={{ color: 'var(--color-text-muted)', fontSize: '13px', padding: '16px 0' }}>
                No examination records published yet.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
