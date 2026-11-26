import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { 
  GraduationCap, 
  LayoutDashboard, 
  Users, 
  Building2, 
  BookOpen, 
  CalendarCheck, 
  Award, 
  CreditCard, 
  LogOut, 
  ChevronRight,
  UserCheck,
  X
} from 'lucide-react';

const Sidebar = ({ mobileOpen, onCloseMobile }) => {
  const { user, isAdmin, isTeacher, isStudent, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const isActive = (path) => {
    if (path === '/dashboard' && location.pathname === '/dashboard') return true;
    if (path !== '/' && path !== '/dashboard' && location.pathname.startsWith(path)) return true;
    return location.pathname === path;
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  };

  const roleLabel = isAdmin 
    ? 'Academic Coordinator' 
    : (isTeacher ? 'Faculty Member' : 'Undergraduate Student');

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {mobileOpen && (
        <div 
          onClick={onCloseMobile}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(20, 45, 78, 0.6)',
            backdropFilter: 'blur(3px)',
            zIndex: 119
          }}
        />
      )}

      <aside className={`sidebar ${mobileOpen ? 'mobile-open' : ''}`}>
        {/* Brand Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingRight: '12px' }}>
          <Link to="/dashboard" className="sidebar-brand" onClick={onCloseMobile}>
            <div className="sidebar-logo">
              <GraduationCap size={22} />
            </div>
            <div>
              <div className="sidebar-title">Campus SMS</div>
              <div className="sidebar-subtitle">Academic Administration</div>
            </div>
          </Link>
          {mobileOpen && (
            <button 
              onClick={onCloseMobile}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#CBD5E1',
                cursor: 'pointer',
                padding: '6px'
              }}
            >
              <X size={20} />
            </button>
          )}
        </div>

        {/* Navigation Items */}
        <nav className="sidebar-nav">
          <div className="sidebar-section-title">Main Menu</div>
          
          <Link 
            to="/dashboard" 
            className={`sidebar-link ${isActive('/dashboard') ? 'active' : ''}`}
            onClick={onCloseMobile}
          >
            <LayoutDashboard size={18} className="sidebar-icon" />
            <span>Dashboard</span>
          </Link>

          {/* Academic Coordinator / Admin Links */}
          {isAdmin && (
            <>
              <div className="sidebar-section-title">Administration</div>
              <Link 
                to="/students" 
                className={`sidebar-link ${isActive('/students') ? 'active' : ''}`}
                onClick={onCloseMobile}
              >
                <Users size={18} className="sidebar-icon" />
                <span>Students</span>
              </Link>
              <Link 
                to="/attendance" 
                className={`sidebar-link ${isActive('/attendance') ? 'active' : ''}`}
                onClick={onCloseMobile}
              >
                <CalendarCheck size={18} className="sidebar-icon" />
                <span>Attendance</span>
              </Link>
              <Link 
                to="/grades" 
                className={`sidebar-link ${isActive('/grades') ? 'active' : ''}`}
                onClick={onCloseMobile}
              >
                <Award size={18} className="sidebar-icon" />
                <span>Grades & Exams</span>
              </Link>
              <Link 
                to="/courses" 
                className={`sidebar-link ${isActive('/courses') ? 'active' : ''}`}
                onClick={onCloseMobile}
              >
                <BookOpen size={18} className="sidebar-icon" />
                <span>Courses</span>
              </Link>
              <Link 
                to="/departments" 
                className={`sidebar-link ${isActive('/departments') ? 'active' : ''}`}
                onClick={onCloseMobile}
              >
                <Building2 size={18} className="sidebar-icon" />
                <span>Departments</span>
              </Link>
              <Link 
                to="/fees" 
                className={`sidebar-link ${isActive('/fees') ? 'active' : ''}`}
                onClick={onCloseMobile}
              >
                <CreditCard size={18} className="sidebar-icon" />
                <span>Tuition & Fees</span>
              </Link>
            </>
          )}

          {/* Faculty / Teacher Links */}
          {isTeacher && (
            <>
              <div className="sidebar-section-title">Classroom</div>
              <Link 
                to="/students" 
                className={`sidebar-link ${isActive('/students') ? 'active' : ''}`}
                onClick={onCloseMobile}
              >
                <Users size={18} className="sidebar-icon" />
                <span>Student Directory</span>
              </Link>
              <Link 
                to="/attendance" 
                className={`sidebar-link ${isActive('/attendance') ? 'active' : ''}`}
                onClick={onCloseMobile}
              >
                <CalendarCheck size={18} className="sidebar-icon" />
                <span>Daily Attendance</span>
              </Link>
              <Link 
                to="/grades" 
                className={`sidebar-link ${isActive('/grades') ? 'active' : ''}`}
                onClick={onCloseMobile}
              >
                <Award size={18} className="sidebar-icon" />
                <span>Marks & Grading</span>
              </Link>
            </>
          )}

          {/* Student Links */}
          {isStudent && (
            <>
              <div className="sidebar-section-title">Academic Portal</div>
              <Link 
                to="/student/report-card" 
                className={`sidebar-link ${isActive('/student/report-card') ? 'active' : ''}`}
                onClick={onCloseMobile}
              >
                <Award size={18} className="sidebar-icon" />
                <span>Report Card</span>
              </Link>
              <Link 
                to="/student/fees" 
                className={`sidebar-link ${isActive('/student/fees') ? 'active' : ''}`}
                onClick={onCloseMobile}
              >
                <CreditCard size={18} className="sidebar-icon" />
                <span>Fee Invoices</span>
              </Link>
            </>
          )}
        </nav>

        {/* Sidebar Footer — User Profile */}
        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
              <div className="sidebar-avatar">
                {getInitials(user?.full_name || user?.username)}
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ 
                  fontSize: '13.5px', 
                  fontWeight: 700, 
                  color: '#ffffff',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}>
                  {user?.full_name || user?.username || 'User'}
                </div>
                <div style={{ 
                  fontSize: '11px', 
                  color: '#94A3B8',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}>
                  {roleLabel}
                </div>
              </div>
            </div>
            <button 
              onClick={handleLogout}
              title="Sign Out"
              style={{
                background: 'rgba(255, 255, 255, 0.08)',
                border: 'none',
                color: '#CBD5E1',
                padding: '7px',
                borderRadius: '8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.18s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#DC4C4C';
                e.currentTarget.style.color = '#ffffff';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                e.currentTarget.style.color = '#CBD5E1';
              }}
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
