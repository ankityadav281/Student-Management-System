import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { 
  GraduationCap, 
  LayoutDashboard, 
  Users, 
  Building2, 
  UserCheck, 
  BookOpen, 
  CalendarCheck, 
  Award, 
  CreditCard, 
  LogOut, 
  LogIn, 
  UserPlus 
} from 'lucide-react';

const Navbar = () => {
  const { user, isAuthenticated, isAdmin, isTeacher, isStudent, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header style={{
      width: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '14px 40px',
      background: 'rgba(255, 255, 255, 0.9)',
      backdropFilter: 'blur(14px)',
      WebkitBackdropFilter: 'blur(14px)',
      borderBottom: '1px solid rgba(226, 232, 240, 0.85)',
      position: 'sticky',
      top: 0,
      zIndex: 100
    }}>
      {/* Brand Logo */}
      <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none' }}>
        <div style={{
          width: '40px',
          height: '40px',
          background: 'var(--primary-gradient)',
          borderRadius: '11px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 12px rgba(79, 70, 229, 0.3)',
          color: '#ffffff'
        }}>
          <GraduationCap size={22} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.3px', lineHeight: 1.2 }}>
            Student Management System
          </span>
          <span style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', letterSpacing: '0.2px', textTransform: 'uppercase' }}>
            Academic Portal • React + Django
          </span>
        </div>
      </Link>

      {/* Navigation Pills */}
      <nav style={{
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        background: 'rgba(241, 245, 249, 0.9)',
        padding: '5px 10px',
        borderRadius: '9999px',
        border: '1px solid #e2e8f0'
      }}>
        <Link 
          to="/" 
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '7px 14px',
            borderRadius: '9999px',
            textDecoration: 'none',
            fontSize: '13.5px',
            fontWeight: 600,
            background: isActive('/') ? '#ffffff' : 'transparent',
            color: isActive('/') ? 'var(--primary)' : 'var(--slate-600)',
            boxShadow: isActive('/') ? '0 2px 6px rgba(0, 0, 0, 0.05)' : 'none',
            transition: 'all 0.2s'
          }}
        >
          Overview
        </Link>

        {isAuthenticated && (
          <>
            <Link 
              to="/dashboard" 
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '7px 14px',
                borderRadius: '9999px',
                textDecoration: 'none',
                fontSize: '13.5px',
                fontWeight: 600,
                background: isActive('/dashboard') ? '#ffffff' : 'transparent',
                color: isActive('/dashboard') ? 'var(--primary)' : 'var(--slate-600)',
                boxShadow: isActive('/dashboard') ? '0 2px 6px rgba(0, 0, 0, 0.05)' : 'none'
              }}
            >
              <LayoutDashboard size={15} />
              <span>Dashboard</span>
            </Link>

            {(isAdmin || isTeacher) && (
              <Link 
                to="/students" 
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '7px 14px',
                  borderRadius: '9999px',
                  textDecoration: 'none',
                  fontSize: '13.5px',
                  fontWeight: 600,
                  background: isActive('/students') ? '#ffffff' : 'transparent',
                  color: isActive('/students') ? 'var(--primary)' : 'var(--slate-600)',
                  boxShadow: isActive('/students') ? '0 2px 6px rgba(0, 0, 0, 0.05)' : 'none'
                }}
              >
                <Users size={15} />
                <span>Students</span>
              </Link>
            )}

            {(isAdmin || isTeacher) && (
              <Link 
                to="/attendance" 
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '7px 14px',
                  borderRadius: '9999px',
                  textDecoration: 'none',
                  fontSize: '13.5px',
                  fontWeight: 600,
                  background: isActive('/attendance') ? '#ffffff' : 'transparent',
                  color: isActive('/attendance') ? 'var(--primary)' : 'var(--slate-600)',
                  boxShadow: isActive('/attendance') ? '0 2px 6px rgba(0, 0, 0, 0.05)' : 'none'
                }}
              >
                <CalendarCheck size={15} />
                <span>Attendance</span>
              </Link>
            )}

            {(isAdmin || isTeacher) && (
              <Link 
                to="/grades" 
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '7px 14px',
                  borderRadius: '9999px',
                  textDecoration: 'none',
                  fontSize: '13.5px',
                  fontWeight: 600,
                  background: isActive('/grades') ? '#ffffff' : 'transparent',
                  color: isActive('/grades') ? 'var(--primary)' : 'var(--slate-600)',
                  boxShadow: isActive('/grades') ? '0 2px 6px rgba(0, 0, 0, 0.05)' : 'none'
                }}
              >
                <Award size={15} />
                <span>Grades</span>
              </Link>
            )}

            {isAdmin && (
              <>
                <Link 
                  to="/courses" 
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '7px 14px',
                    borderRadius: '9999px',
                    textDecoration: 'none',
                    fontSize: '13.5px',
                    fontWeight: 600,
                    background: isActive('/courses') ? '#ffffff' : 'transparent',
                    color: isActive('/courses') ? 'var(--primary)' : 'var(--slate-600)',
                    boxShadow: isActive('/courses') ? '0 2px 6px rgba(0, 0, 0, 0.05)' : 'none'
                  }}
                >
                  <BookOpen size={15} />
                  <span>Courses</span>
                </Link>

                <Link 
                  to="/fees" 
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '7px 14px',
                    borderRadius: '9999px',
                    textDecoration: 'none',
                    fontSize: '13.5px',
                    fontWeight: 600,
                    background: isActive('/fees') ? '#ffffff' : 'transparent',
                    color: isActive('/fees') ? 'var(--primary)' : 'var(--slate-600)',
                    boxShadow: isActive('/fees') ? '0 2px 6px rgba(0, 0, 0, 0.05)' : 'none'
                  }}
                >
                  <CreditCard size={15} />
                  <span>Fees</span>
                </Link>
              </>
            )}

            {isStudent && (
              <>
                <Link 
                  to="/student/report-card" 
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '7px 14px',
                    borderRadius: '9999px',
                    textDecoration: 'none',
                    fontSize: '13.5px',
                    fontWeight: 600,
                    background: isActive('/student/report-card') ? '#ffffff' : 'transparent',
                    color: isActive('/student/report-card') ? 'var(--primary)' : 'var(--slate-600)'
                  }}
                >
                  <Award size={15} />
                  <span>Report Card</span>
                </Link>
                <Link 
                  to="/student/fees" 
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '7px 14px',
                    borderRadius: '9999px',
                    textDecoration: 'none',
                    fontSize: '13.5px',
                    fontWeight: 600,
                    background: isActive('/student/fees') ? '#ffffff' : 'transparent',
                    color: isActive('/student/fees') ? 'var(--primary)' : 'var(--slate-600)'
                  }}
                >
                  <CreditCard size={15} />
                  <span>Tuition & Fees</span>
                </Link>
              </>
            )}
          </>
        )}
      </nav>

      {/* Auth Actions / User Pill */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {isAuthenticated ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 14px',
              borderRadius: '9999px',
              background: '#f1f5f9',
              border: '1px solid #e2e8f0',
              fontSize: '13px',
              fontWeight: 600
            }}>
              <span style={{ color: 'var(--slate-800)' }}>{user?.full_name || user?.username}</span>
              <span style={{
                fontSize: '11px',
                padding: '2px 8px',
                borderRadius: '6px',
                background: isAdmin ? '#eef2ff' : (isTeacher ? '#ecfdf5' : '#fef3c7'),
                color: isAdmin ? '#4338ca' : (isTeacher ? '#047857' : '#92400e'),
                fontWeight: 700
              }}>
                {isAdmin ? 'Academic Coordinator' : (isTeacher ? 'Teacher' : 'Student')}
              </span>
            </div>
            <button 
              onClick={handleLogout}
              className="btn btn-secondary"
              style={{ padding: '7px 14px', fontSize: '13px' }}
              title="Sign Out"
            >
              <LogOut size={14} />
              <span>Logout</span>
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Link to="/login" className="btn btn-secondary" style={{ padding: '8px 18px' }}>
              <LogIn size={15} />
              <span>Sign In</span>
            </Link>
            <Link to="/register" className="btn btn-primary" style={{ padding: '8px 18px' }}>
              <UserPlus size={15} />
              <span>Register</span>
            </Link>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
