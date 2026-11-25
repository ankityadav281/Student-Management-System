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
  CheckCircle2, 
  ShieldCheck, 
  Database,
  BookOpen,
  CreditCard
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
    <div style={{ maxWidth: '1100px', margin: '0 auto', textAlign: 'center', paddingBottom: '60px' }}>
      {banner && <AlertBanner type={banner.type} message={banner.message} onClose={() => setBanner(null)} />}

      {/* Hero Badge */}
      <div style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        background: 'rgba(238, 242, 255, 0.9)',
        border: '1px solid #c7d2fe',
        color: '#4338ca',
        padding: '7px 18px',
        borderRadius: '9999px',
        fontSize: '13.5px',
        fontWeight: 700,
        marginBottom: '24px',
        boxShadow: '0 2px 6px rgba(79, 70, 229, 0.08)'
      }}>
        <span>⭐ Easy Project 1</span>
        <span style={{ width: '4px', height: '4px', background: '#6366f1', borderRadius: '50%' }}></span>
        <span>Student Management System</span>
        <span style={{ width: '4px', height: '4px', background: '#6366f1', borderRadius: '50%' }}></span>
        <span style={{ color: '#059669', display: 'flex', alignItems: 'center', gap: '5px' }}>
          <span style={{ width: '6px', height: '6px', background: '#10b981', borderRadius: '50%' }}></span>
          REST API Active
        </span>
      </div>

      {/* Main Title */}
      <h1 style={{
        fontSize: '44px',
        fontWeight: 800,
        color: '#0f172a',
        lineHeight: 1.22,
        letterSpacing: '-1.2px',
        marginBottom: '18px'
      }}>
        Student Management System<br />
        <span style={{
          background: 'linear-gradient(135deg, #4f46e5 0%, #2563eb 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          Manages student details, marks, and attendance.
        </span>
      </h1>

      {/* Subtitle / Overview */}
      <div style={{
        maxWidth: '720px',
        margin: '0 auto 36px auto',
        background: '#ffffff',
        padding: '20px 24px',
        borderRadius: '16px',
        border: '1px solid #e2e8f0',
        boxShadow: 'var(--shadow-subtle)',
        textAlign: 'left'
      }}>
        <p style={{ fontSize: '15px', color: '#334155', lineHeight: 1.6, fontWeight: 500 }}>
          <strong>1. Project Overview:</strong> A comprehensive full-stack Student Management System built with a decoupled React frontend and Django REST Framework backend. Centralize student enrollments, academic performance, classroom attendance tracking, and fee management with role-based access for Administrators, Teachers, and Students.
        </p>
      </div>

      {/* Call to Actions */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '14px', marginBottom: '46px', flexWrap: 'wrap' }}>
        {isAuthenticated ? (
          <>
            <Link to="/dashboard" className="btn btn-primary" style={{ padding: '12px 28px', fontSize: '15px' }}>
              <span>Open Student Directory</span>
              <ArrowRight size={16} />
            </Link>
            {(isAdmin || user?.role === 'teacher') && (
              <Link to="/students" className="btn btn-secondary" style={{ padding: '12px 24px', fontSize: '15px' }}>
                <PlusCircle size={16} />
                <span>Manage Students</span>
              </Link>
            )}
          </>
        ) : (
          <>
            <Link to="/login" className="btn btn-primary" style={{ padding: '12px 28px', fontSize: '15px' }}>
              <span>Sign In to Access Directory</span>
              <ArrowRight size={16} />
            </Link>
            <Link to="/register" className="btn btn-secondary" style={{ padding: '12px 24px', fontSize: '15px' }}>
              <span>Register Faculty Account</span>
            </Link>
          </>
        )}

        <button 
          onClick={handleSeedDemo} 
          disabled={loading}
          className="btn btn-secondary"
          style={{ padding: '12px 20px', fontSize: '14px', background: '#f8fafc' }}
        >
          <Sparkles size={16} color="var(--primary)" />
          <span>{loading ? 'Populating...' : 'Seed Sample Data'}</span>
        </button>
      </div>

      {/* Live KPI Statistics Cards */}
      <div className="grid-4" style={{ marginBottom: '60px', textAlign: 'left' }}>
        <StatCard 
          title="Total Enrolled Students" 
          value={stats.total_students} 
          subtitle={`${stats.active_students || stats.total_students} Active in Directory`}
          icon={Users}
          color="primary"
        />
        <StatCard 
          title="Class Average Attendance" 
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
          color="info"
        />
        <StatCard 
          title="Attendance Alert (<75%)" 
          value={stats.at_risk_count} 
          subtitle="Students needing attention"
          icon={AlertTriangle}
          color="danger"
        />
      </div>

      {/* Features Checklist Grid */}
      <div style={{ marginTop: '20px', textAlign: 'left' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <span style={{ fontSize: '12.5px', fontWeight: 800, color: 'var(--primary)', letterSpacing: '1px', textTransform: 'uppercase' }}>
            2. Main Features Checklist
          </span>
          <h2 style={{ fontSize: '28px', fontWeight: 800, color: '#0f172a', marginTop: '4px' }}>
            Engineered to Meet Every Requirement
          </h2>
        </div>

        <div className="grid-3" style={{ gap: '22px' }}>
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <ShieldCheck color="var(--primary)" size={24} />
              <h3 style={{ fontSize: '16px', fontWeight: 700 }}>1. Multi-Role Authentication</h3>
            </div>
            <p style={{ fontSize: '13.5px', color: 'var(--slate-600)', lineHeight: 1.6 }}>
              Role-based access control for Academic Coordinators, Teachers, and Students with token-based REST authentication and route guards.
            </p>
          </div>

          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <Users color="var(--primary)" size={24} />
              <h3 style={{ fontSize: '16px', fontWeight: 700 }}>2. Student Profile CRUD</h3>
            </div>
            <p style={{ fontSize: '13.5px', color: 'var(--slate-600)', lineHeight: 1.6 }}>
              Complete student record management: personal info, contact, academic year, department, and live performance metrics.
            </p>
          </div>

          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <CalendarCheck color="#059669" size={24} />
              <h3 style={{ fontSize: '16px', fontWeight: 700 }}>3. Attendance Management</h3>
            </div>
            <p style={{ fontSize: '13.5px', color: 'var(--slate-600)', lineHeight: 1.6 }}>
              Log daily and batch attendance with automatic percentage calculation and visual warnings for attendance below 75%.
            </p>
          </div>

          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <Award color="#0284c7" size={24} />
              <h3 style={{ fontSize: '16px', fontWeight: 700 }}>4. Grades & Report Cards</h3>
            </div>
            <p style={{ fontSize: '13.5px', color: 'var(--slate-600)', lineHeight: 1.6 }}>
              Record midterm and final exam scores, calculate GPA/CGPA, and generate downloadable official academic report cards.
            </p>
          </div>

          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <BookOpen color="#7c3aed" size={24} />
              <h3 style={{ fontSize: '16px', fontWeight: 700 }}>5. Course & Department</h3>
            </div>
            <p style={{ fontSize: '13.5px', color: 'var(--slate-600)', lineHeight: 1.6 }}>
              Organize academic departments, define courses with credits and syllabi, assign instructors, and manage course enrollments.
            </p>
          </div>

          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <CreditCard color="#d97706" size={24} />
              <h3 style={{ fontSize: '16px', fontWeight: 700 }}>6. Fee Management</h3>
            </div>
            <p style={{ fontSize: '13.5px', color: 'var(--slate-600)', lineHeight: 1.6 }}>
              Generate tuition and hostel fee invoices, record online and cash payments, and track outstanding balances per student.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
