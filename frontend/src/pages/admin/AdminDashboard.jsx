import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { studentService } from '../../services/studentService';
import StatCard from '../../components/StatCard';
import LoadingSpinner from '../../components/LoadingSpinner';
import AlertBanner from '../../components/AlertBanner';
import { 
  Users, 
  CalendarCheck, 
  Award, 
  AlertTriangle, 
  Plus, 
  Download, 
  Building2, 
  BookOpen, 
  CreditCard, 
  ChevronRight,
  ExternalLink
} from 'lucide-react';

const AdminDashboard = () => {
  const { user, isAdmin } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentStudents, setRecentStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [banner, setBanner] = useState(null);

  const loadData = async () => {
    try {
      const [statsData, studentsData] = await Promise.all([
        studentService.getStats(),
        studentService.getAll()
      ]);
      setStats(statsData);
      setRecentStudents(Array.isArray(studentsData) ? studentsData.slice(0, 5) : []);
    } catch (err) {
      setBanner({ type: 'error', message: 'Failed to load dashboard data.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading) return <LoadingSpinner text="Loading Academic Dashboard..." />;

  return (
    <div>
      {banner && <AlertBanner type={banner.type} message={banner.message} onClose={() => setBanner(null)} />}

      {/* Header Banner */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px',
        marginBottom: '28px'
      }}>
        <div>
          <h1 style={{ fontSize: '26px', fontWeight: 800, color: 'var(--color-primary-dark)', letterSpacing: '-0.3px' }}>
            Academic Coordinator Dashboard
          </h1>
          <p style={{ fontSize: '13.5px', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
            Welcome back, <strong>{user?.full_name}</strong>. University administration overview.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <a 
            href={studentService.exportCSVUrl()} 
            target="_blank" 
            rel="noopener noreferrer"
            className="btn btn-secondary"
          >
            <Download size={15} />
            <span>Export CSV</span>
          </a>
          <Link to="/students" className="btn btn-primary">
            <Plus size={16} />
            <span>Manage Students</span>
          </Link>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid-4" style={{ marginBottom: '32px' }}>
        <StatCard 
          title="Total Students"
          value={stats?.total_students || 0}
          subtitle={`${stats?.active_students || 0} Active records`}
          icon={Users}
          color="primary"
        />
        <StatCard 
          title="Average Attendance"
          value={`${stats?.average_attendance || 0}%`}
          subtitle="System-wide classroom tracking"
          icon={CalendarCheck}
          color="success"
        />
        <StatCard 
          title="Class Average Marks"
          value={`${stats?.class_average_marks || 0}%`}
          subtitle="Cumulative exam performance"
          icon={Award}
          color="indigo"
        />
        <StatCard 
          title="At-Risk Alerts"
          value={stats?.at_risk_count || 0}
          subtitle="Attendance <75% or Marks <50%"
          icon={AlertTriangle}
          color="danger"
        />
      </div>

      {/* Quick Navigation Cards */}
      <div style={{ marginBottom: '36px' }}>
        <h3 style={{ fontSize: '17px', fontWeight: 700, color: 'var(--color-primary-dark)', marginBottom: '16px' }}>
          Academic Management Modules
        </h3>
        <div className="grid-3">
          <Link to="/students" className="card" style={{ textDecoration: 'none', color: 'inherit' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'var(--color-primary-light)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Users size={20} />
                </div>
                <div>
                  <h4 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--color-text-primary)' }}>Student Directory</h4>
                  <span style={{ fontSize: '12.5px', color: 'var(--color-text-secondary)' }}>Profiles, enrollments & CRUD</span>
                </div>
              </div>
              <ChevronRight size={18} color="var(--color-text-muted)" />
            </div>
          </Link>

          <Link to="/attendance" className="card" style={{ textDecoration: 'none', color: 'inherit' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'var(--color-success-bg)', color: 'var(--color-success)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <CalendarCheck size={20} />
                </div>
                <div>
                  <h4 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--color-text-primary)' }}>Attendance Tracker</h4>
                  <span style={{ fontSize: '12.5px', color: 'var(--color-text-secondary)' }}>Daily & batch classroom attendance</span>
                </div>
              </div>
              <ChevronRight size={18} color="var(--color-text-muted)" />
            </div>
          </Link>

          <Link to="/grades" className="card" style={{ textDecoration: 'none', color: 'inherit' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'rgba(81, 70, 165, 0.08)', color: 'var(--color-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Award size={20} />
                </div>
                <div>
                  <h4 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--color-text-primary)' }}>Examinations & Grades</h4>
                  <span style={{ fontSize: '12.5px', color: 'var(--color-text-secondary)' }}>GPA, exam marks & report cards</span>
                </div>
              </div>
              <ChevronRight size={18} color="var(--color-text-muted)" />
            </div>
          </Link>

          <Link to="/courses" className="card" style={{ textDecoration: 'none', color: 'inherit' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'var(--color-info-bg)', color: 'var(--color-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <BookOpen size={20} />
                </div>
                <div>
                  <h4 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--color-text-primary)' }}>Courses & Curriculum</h4>
                  <span style={{ fontSize: '12.5px', color: 'var(--color-text-secondary)' }}>Subjects, credits & enrollments</span>
                </div>
              </div>
              <ChevronRight size={18} color="var(--color-text-muted)" />
            </div>
          </Link>

          <Link to="/departments" className="card" style={{ textDecoration: 'none', color: 'inherit' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'rgba(20, 45, 78, 0.08)', color: 'var(--color-primary-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Building2 size={20} />
                </div>
                <div>
                  <h4 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--color-text-primary)' }}>Departments</h4>
                  <span style={{ fontSize: '12.5px', color: 'var(--color-text-secondary)' }}>Academic branches & heads</span>
                </div>
              </div>
              <ChevronRight size={18} color="var(--color-text-muted)" />
            </div>
          </Link>

          <Link to="/fees" className="card" style={{ textDecoration: 'none', color: 'inherit' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'var(--color-warning-bg)', color: 'var(--color-warning)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <CreditCard size={20} />
                </div>
                <div>
                  <h4 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--color-text-primary)' }}>Tuition & Fee Records</h4>
                  <span style={{ fontSize: '12.5px', color: 'var(--color-text-secondary)' }}>Invoices, payments & balances</span>
                </div>
              </div>
              <ChevronRight size={18} color="var(--color-text-muted)" />
            </div>
          </Link>
        </div>
      </div>

      {/* Recent Enrolled Students Preview */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{
          padding: '18px 24px',
          borderBottom: '1px solid var(--color-border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--color-primary-dark)' }}>Recent Student Registrations</h3>
            <span style={{ fontSize: '12.5px', color: 'var(--color-text-secondary)' }}>Latest student records in the system</span>
          </div>
          <Link to="/students" style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-primary)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span>View All Students</span>
            <ExternalLink size={14} />
          </Link>
        </div>

        <div className="table-container" style={{ border: 'none', borderRadius: 0 }}>
          <table className="custom-table">
            <thead>
              <tr>
                <th>Student ID</th>
                <th>Full Name</th>
                <th>Department</th>
                <th>Year</th>
                <th>Attendance</th>
                <th>Avg Marks</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {recentStudents.map((s) => (
                <tr key={s.id}>
                  <td style={{ fontWeight: 800, color: 'var(--color-primary)' }}>{s.student_id}</td>
                  <td style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>{s.name}</td>
                  <td>{s.department}</td>
                  <td>{s.year}</td>
                  <td>
                    <span style={{ fontWeight: 700, color: s.attendance_pct < 75 ? 'var(--color-danger)' : 'var(--color-success)' }}>
                      {s.attendance_pct}%
                    </span>
                  </td>
                  <td>
                    <span style={{ fontWeight: 700, color: 'var(--color-text-primary)' }}>{s.average_marks}%</span>
                  </td>
                  <td>
                    <span className={`badge badge-${s.status?.toLowerCase() || 'active'}`}>
                      {s.status}
                    </span>
                  </td>
                </tr>
              ))}
              {recentStudents.length === 0 && (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '32px', color: 'var(--color-text-muted)' }}>
                    No student records found. Click "Manage Students" to add or seed demo data.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
