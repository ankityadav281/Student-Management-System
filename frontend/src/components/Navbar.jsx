import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { 
  GraduationCap, 
  Search, 
  Bell, 
  Menu, 
  LogOut, 
  User, 
  LogIn, 
  UserPlus,
  ShieldCheck
} from 'lucide-react';

const Navbar = ({ onToggleSidebar }) => {
  const { user, isAuthenticated, isAdmin, isTeacher, isStudent, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  // Unauthenticated Public Top Navigation
  if (!isAuthenticated) {
    return (
      <header style={{
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '14px 40px',
        background: 'var(--color-surface)',
        borderBottom: '1px solid var(--color-border)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        boxShadow: 'var(--shadow-subtle)'
      }}>
        {/* Brand Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none' }}>
          <div style={{
            width: '40px',
            height: '40px',
            background: 'var(--color-primary)',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(36, 87, 166, 0.3)',
            color: '#ffffff'
          }}>
            <GraduationCap size={22} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '18px', fontWeight: 800, color: 'var(--color-text-primary)', letterSpacing: '-0.3px', lineHeight: 1.2 }}>
              Student Management System
            </span>
            <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-text-secondary)', letterSpacing: '0.4px', textTransform: 'uppercase' }}>
              Academic Portal
            </span>
          </div>
        </Link>

        {/* Public Navigation Links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Link to="/login" className="btn btn-secondary">
            <LogIn size={15} />
            <span>Sign In</span>
          </Link>
          <Link to="/register" className="btn btn-primary">
            <UserPlus size={15} />
            <span>Register Faculty</span>
          </Link>
        </div>
      </header>
    );
  }

  // Authenticated Top Navigation Bar (Section 5)
  return (
    <header className="top-navbar">
      {/* Left: Mobile Toggle & Page Title or Quick Search */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <button 
          onClick={onToggleSidebar}
          className="nav-icon-btn"
          title="Toggle Navigation Menu"
          style={{ display: 'flex' }}
        >
          <Menu size={18} />
        </button>

        {/* Search Field */}
        <div className="top-navbar-search">
          <Search size={16} color="var(--color-text-muted)" />
          <input 
            type="text" 
            placeholder="Search students, courses, IDs..." 
            aria-label="System Search"
          />
        </div>
      </div>

      {/* Right: Notifications & User Profile Pill */}
      <div className="top-navbar-actions">
        {/* Academic Role Pill */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '4px 12px',
          borderRadius: 'var(--radius-full)',
          background: isAdmin ? 'var(--color-primary-light)' : (isTeacher ? 'var(--color-success-bg)' : 'var(--color-warning-bg)'),
          color: isAdmin ? 'var(--color-primary)' : (isTeacher ? 'var(--color-success)' : 'var(--color-warning)'),
          fontSize: '12px',
          fontWeight: 700,
          border: `1px solid ${isAdmin ? 'rgba(36, 87, 166, 0.2)' : (isTeacher ? 'rgba(22, 163, 106, 0.2)' : 'rgba(229, 163, 35, 0.25)')}`
        }}>
          <ShieldCheck size={14} />
          <span>{isAdmin ? 'Academic Coordinator' : (isTeacher ? 'Faculty' : 'Student')}</span>
        </div>

        {/* Notifications Icon */}
        <button className="nav-icon-btn" title="System Notifications">
          <Bell size={17} />
          <span className="nav-badge" />
        </button>

        {/* User Profile Pill */}
        <div className="user-profile-pill">
          <div style={{
            width: '28px',
            height: '28px',
            borderRadius: '50%',
            background: 'var(--color-primary)',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '12px',
            fontWeight: 700
          }}>
            <User size={15} />
          </div>
          <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-primary)' }}>
            {user?.full_name?.split(' ')[0] || user?.username || 'User'}
          </span>
        </div>

        {/* Logout Button */}
        <button 
          onClick={handleLogout}
          className="btn btn-ghost btn-sm"
          title="Sign Out"
          style={{ color: 'var(--color-text-secondary)', padding: '6px 10px' }}
        >
          <LogOut size={16} />
          <span>Exit</span>
        </button>
      </div>
    </header>
  );
};

export default Navbar;
