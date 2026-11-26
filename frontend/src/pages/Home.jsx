import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { studentService } from '../services/studentService';
import StatCard from '../components/StatCard';
import AlertBanner from '../components/AlertBanner';
import { 
  Users, 
  CalendarCheck, 
  Award, 
  AlertTriangle, 
  ArrowRight, 
  PlusCircle, 
  Sparkles, 
  ShieldCheck, 
  BookOpen,
  CreditCard,
  Building2,
  GraduationCap
} from 'lucide-react';

const Home = () => {
  const { isAuthenticated, user, isAdmin } = useAuth();
  const [stats, setStats] = useState({
    total_students: 0,
    average_attendance: 0,
    class_average_marks: 0,
    at_risk_count: 0,
    active_students: 0,
    top_department: 'Computer Science'
  });
  const [loading, setLoading] = useState(true);
  const [banner, setBanner] = useState(null);

  const fetchStats = async () => {
    try {
      const data = await studentService.getStats();
      setStats(data);
    } catch (err) {
      console.warn('Stats fetch notice:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleSeedDemo = async () => {
    setLoading(true);
    try {
      const res = await studentService.seedDemo();
      setBanner({ type: 'success', message: res.message || 'Demo data loaded successfully!' });
      await fetchStats();
    } catch (err) {
      setBanner({ type: 'error', message: 'Failed to seed demo data: ' + (err.response?.data?.error || err.message) });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '1180px', margin: '0 auto', textAlign: 'center', paddingBottom: '60px' }}>
      {banner && <AlertBanner type={banner.type} message={banner.message} onClose={() => setBanner(null)} />}

      {/* Hero Badge */}
      <div style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        background: 'var(--color-primary-light)',
        border: '1px solid rgba(36, 87, 166, 0.25)',
        color: 'var(--color-primary)',
        padding: '6px 18px',
        borderRadius: 'var(--radius-full)',
        fontSize: '13px',
        fontWeight: 700,
        marginBottom: '22px'
      }}>
        <GraduationCap size={15} />
        <span>University Administration Platform</span>
        <span style={{ width: '4px', height: '4px', background: 'var(--color-primary)', borderRadius: '50%' }}></span>
        <span>Student Management System</span>
        <span style={{ width: '4px', height: '4px', background: 'var(--color-primary)', borderRadius: '50%' }}></span>
        <span style={{ color: 'var(--color-success)', display: 'flex', alignItems: 'center', gap: '5px' }}>
          <span style={{ width: '6px', height: '6px', background: 'var(--color-success)', borderRadius: '50%' }}></span>
          DRF Service Online
        </span>
      </div>

      {/* Main Title */}
      <h1 style={{
        fontSize: '42px',
        fontWeight: 800,
        color: 'var(--color-primary-dark)',
        lineHeight: 1.2,
        letterSpacing: '-1px',
        marginBottom: '16px'
      }}>
        Student Management System<br />
        <span style={{ color: 'var(--color-primary)' }}>
          Academic Administration, Marks & Attendance Portal
        </span>
      </h1>

      {/* Subtitle / Overview */}
      <div style={{
        maxWidth: '760px',
        margin: '0 auto 36px auto',
        background: 'var(--color-surface)',
        padding: '20px 26px',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--color-border)',
        boxShadow: 'var(--shadow-subtle)',
        textAlign: 'left'
      }}>
        <p style={{ fontSize: '14.5px', color: 'var(--color-text-secondary)', lineHeight: 1.6, fontWeight: 500 }}>
          <strong style={{ color: 'var(--color-text-primary)' }}>Enterprise Academic Suite:</strong> A decoupled full-stack university management platform designed with React and Django REST Framework. Streamlines student registrations, classroom attendance tracking, examination grading, course enrollments, and tuition fee billing with strict role-based access for Administrators, Faculty, and Students.
        </p>
      </div>

      {/* Call to Actions */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '14px', marginBottom: '48px', flexWrap: 'wrap' }}>
        {isAuthenticated ? (
          <>
            <Link to="/dashboard" className="btn btn-primary" style={{ padding: '11px 26px', fontSize: '14.5px' }}>
              <span>Enter Management Portal</span>
              <ArrowRight size={16} />
            </Link>
            {(isAdmin || user?.role === 'teacher') && (
              <Link to="/students" className="btn btn-secondary" style={{ padding: '11px 22px', fontSize: '14.5px' }}>
                <PlusCircle size={16} />
                <span>Student Directory</span>
              </Link>
            )}
          </>
        ) : (
          <>
            <Link to="/login" className="btn btn-primary" style={{ padding: '11px 26px', fontSize: '14.5px' }}>
              <span>Sign In to Access Portal</span>
              <ArrowRight size={16} />
            </Link>
            <Link to="/register" className="btn btn-secondary" style={{ padding: '11px 22px', fontSize: '14.5px' }}>
              <span>Register Faculty Account</span>
            </Link>
          </>
        )}

        <button 
          onClick={handleSeedDemo} 
          disabled={loading}
          className="btn btn-secondary"
          style={{ padding: '11px 20px', fontSize: '14px' }}
        >
          <Sparkles size={16} color="var(--color-primary)" />
          <span>{loading ? 'Populating...' : 'Seed Sample Database'}</span>
        </button>
      </div>

      {/* Live KPI Statistics Cards (Section 6) */}
      <div className="grid-4" style={{ marginBottom: '56px', textAlign: 'left' }}>
        <StatCard 
          title="Total Students" 
          value={stats.total_students} 
          subtitle={`${stats.active_students || stats.total_students} Active in Directory`}
          icon={Users}
          color="primary"
        />
        <StatCard 
          title="Average Attendance" 
          value={`${stats.average_attendance}%`} 
          subtitle="Tracked across all courses"
          icon={CalendarCheck}
          color="success"
        />
        <StatCard 
          title="Class Average Marks" 
          value={`${stats.class_average_marks}%`} 
          subtitle="Cumulative exam performance"
          icon={Award}
          color="indigo"
        />
        <StatCard 
          title="Attendance Risk (<75%)" 
          value={stats.at_risk_count} 
          subtitle="Students needing review"
          icon={AlertTriangle}
          color="danger"
        />
      </div>

      {/* Features Checklist Grid */}
      <div style={{ marginTop: '20px', textAlign: 'left' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <span style={{ fontSize: '12px', fontWeight: 800, color: 'var(--color-primary)', letterSpacing: '1px', textTransform: 'uppercase' }}>
            Academic Platform Capabilities
          </span>
          <h2 style={{ fontSize: '26px', fontWeight: 800, color: 'var(--color-primary-dark)', marginTop: '4px' }}>
            Enterprise Features for University Administration
          </h2>
        </div>

        <div className="grid-3" style={{ gap: '22px' }}>
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <ShieldCheck color="var(--color-primary)" size={22} />
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--color-text-primary)' }}>1. Multi-Role Authentication</h3>
            </div>
            <p style={{ fontSize: '13.5px', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
              Role-based access control for Academic Coordinators, Faculty, and Students with token-based REST authentication and route guards.
            </p>
          </div>

          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <Users color="var(--color-primary)" size={22} />
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--color-text-primary)' }}>2. Student Profile CRUD</h3>
            </div>
            <p style={{ fontSize: '13.5px', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
              Complete student record management: personal info, contact, academic year, department, and live performance metrics.
            </p>
          </div>

          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <CalendarCheck color="var(--color-success)" size={22} />
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--color-text-primary)' }}>3. Attendance Management</h3>
            </div>
            <p style={{ fontSize: '13.5px', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
              Log daily and batch attendance with automatic percentage calculation and visual warnings for attendance below 75%.
            </p>
          </div>

          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <Award color="var(--color-secondary)" size={22} />
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--color-text-primary)' }}>4. Grades & Report Cards</h3>
            </div>
            <p style={{ fontSize: '13.5px', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
              Record midterm and final exam scores, calculate GPA/CGPA, and generate downloadable official academic report cards.
            </p>
          </div>

          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <BookOpen color="var(--color-accent)" size={22} />
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--color-text-primary)' }}>5. Course & Department</h3>
            </div>
            <p style={{ fontSize: '13.5px', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
              Organize academic departments, define courses with credits and syllabi, assign instructors, and manage course enrollments.
            </p>
          </div>

          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <CreditCard color="var(--color-warning)" size={22} />
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--color-text-primary)' }}>6. Fee Management</h3>
            </div>
            <p style={{ fontSize: '13.5px', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
              Generate tuition and hostel fee invoices, record online and cash payments, and track outstanding balances per student.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
