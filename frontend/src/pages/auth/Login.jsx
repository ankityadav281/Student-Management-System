import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import AlertBanner from '../../components/AlertBanner';
import { LogIn, GraduationCap, ArrowRight, ShieldCheck } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid credentials. Please verify your email and password.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleQuickLogin = (quickEmail, quickPassword) => {
    setEmail(quickEmail);
    setPassword(quickPassword);
  };

  return (
    <div style={{ maxWidth: '440px', margin: '40px auto', width: '100%' }}>
      <div className="card" style={{ padding: '36px 32px' }}>
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            background: 'var(--color-primary)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            boxShadow: 'var(--shadow-btn)',
            marginBottom: '14px'
          }}>
            <GraduationCap size={26} />
          </div>
          <h2 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--color-primary-dark)' }}>
            Sign In to Portal
          </h2>
          <p style={{ fontSize: '13.5px', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
            Academic Coordinator • Teacher • Student Access
          </p>
        </div>

        {error && <AlertBanner type="error" message={error} onClose={() => setError(null)} />}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input 
              type="email" 
              className="form-input" 
              placeholder="e.g. admin@campus.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
            />
          </div>

          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label className="form-label">Password</label>
              <span style={{ fontSize: '12px', color: 'var(--color-primary)', cursor: 'pointer', fontWeight: 600 }}>
                Default: Password@123
              </span>
            </div>
            <input 
              type="password" 
              className="form-input" 
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
            />
          </div>

          <button 
            type="submit" 
            disabled={submitting}
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '10px', padding: '12px', fontSize: '15px' }}
          >
            <span>{submitting ? 'Authenticating...' : 'Sign In'}</span>
            <ArrowRight size={16} />
          </button>
        </form>

        {/* Demo Fast Fill Buttons */}
        <div style={{
          marginTop: '28px',
          padding: '16px',
          borderRadius: 'var(--radius-md)',
          background: 'var(--color-hover)',
          border: '1px solid var(--color-border)',
          fontSize: '12.5px',
          color: 'var(--color-text-secondary)'
        }}>
          <div style={{ fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <ShieldCheck size={15} color="var(--color-primary)" />
            <span>Quick Demo Credentials:</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <button 
              type="button" 
              onClick={() => handleQuickLogin('admin@campus.edu', 'Password@123')}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '7px 10px',
                borderRadius: '6px',
                border: '1px solid var(--color-border)',
                background: 'var(--color-surface)',
                cursor: 'pointer',
                fontSize: '12px'
              }}
            >
              <span style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>Academic Coordinator:</span>
              <span style={{ color: 'var(--color-primary)', fontWeight: 600 }}>admin@campus.edu</span>
            </button>

            <button 
              type="button" 
              onClick={() => handleQuickLogin('teacher@campus.edu', 'Password@123')}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '7px 10px',
                borderRadius: '6px',
                border: '1px solid var(--color-border)',
                background: 'var(--color-surface)',
                cursor: 'pointer',
                fontSize: '12px'
              }}
            >
              <span style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>Faculty / Teacher:</span>
              <span style={{ color: 'var(--color-primary)', fontWeight: 600 }}>teacher@campus.edu</span>
            </button>

            <button 
              type="button" 
              onClick={() => handleQuickLogin('student@campus.edu', 'Password@123')}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '7px 10px',
                borderRadius: '6px',
                border: '1px solid var(--color-border)',
                background: 'var(--color-surface)',
                cursor: 'pointer',
                fontSize: '12px'
              }}
            >
              <span style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>Student Account:</span>
              <span style={{ color: 'var(--color-primary)', fontWeight: 600 }}>student@campus.edu</span>
            </button>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '13px', color: 'var(--color-text-secondary)' }}>
          Don't have an account?{' '}
          <Link to="/register" style={{ color: 'var(--color-primary)', fontWeight: 700, textDecoration: 'none' }}>
            Register here &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
