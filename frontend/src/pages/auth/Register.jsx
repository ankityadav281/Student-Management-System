import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import AlertBanner from '../../components/AlertBanner';
import { UserPlus, GraduationCap, ArrowRight } from 'lucide-react';

const Register = () => {
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    password: '',
    role: 'teacher',
    phone: '',
  });
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await register(formData);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.email?.[0] || 'Registration failed. Please check your information.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: '480px', margin: '40px auto', width: '100%' }}>
      <div className="card" style={{ padding: '36px 32px' }}>
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '14px',
            background: 'var(--primary-gradient)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            boxShadow: 'var(--shadow-btn)',
            marginBottom: '14px'
          }}>
            <GraduationCap size={26} />
          </div>
          <h2 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--dark)' }}>
            Register New Account
          </h2>
          <p style={{ fontSize: '13.5px', color: 'var(--slate-500)', marginTop: '4px' }}>
            Create an academic administrator, teacher, or student profile
          </p>
        </div>

        {error && <AlertBanner type="error" message={error} onClose={() => setError(null)} />}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Full Name *</label>
            <input 
              type="text" 
              name="full_name"
              className="form-input" 
              placeholder="Prof. Jane Doe"
              value={formData.full_name}
              onChange={handleChange}
              required 
            />
          </div>

          <div className="form-group">
            <label className="form-label">Email Address *</label>
            <input 
              type="email" 
              name="email"
              className="form-input" 
              placeholder="jane.doe@campus.edu"
              value={formData.email}
              onChange={handleChange}
              required 
            />
          </div>

          <div className="form-group">
            <label className="form-label">Account Role *</label>
            <select 
              name="role" 
              className="form-select"
              value={formData.role}
              onChange={handleChange}
            >
              <option value="admin">Academic Coordinator / Admin</option>
              <option value="teacher">Teacher / Faculty</option>
              <option value="student">Student</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Phone Number</label>
            <input 
              type="text" 
              name="phone"
              className="form-input" 
              placeholder="+91 98765 43210"
              value={formData.phone}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password *</label>
            <input 
              type="password" 
              name="password"
              className="form-input" 
              placeholder="Minimum 6 characters"
              value={formData.password}
              onChange={handleChange}
              required 
              minLength={6}
            />
          </div>

          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ width: '100%', marginTop: '12px', height: '44px' }}
            disabled={submitting}
          >
            <span>{submitting ? 'Registering...' : 'Create Account'}</span>
            <ArrowRight size={16} />
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '13px', color: 'var(--slate-500)' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 700, textDecoration: 'none' }}>
            Sign In &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
