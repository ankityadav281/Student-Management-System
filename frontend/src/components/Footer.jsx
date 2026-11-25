import React from 'react';
import { GraduationCap, Heart, CheckCircle2 } from 'lucide-react';

const Footer = () => {
  return (
    <footer style={{
      width: '100%',
      borderTop: '1px solid rgba(226, 232, 240, 0.8)',
      background: 'rgba(255, 255, 255, 0.7)',
      padding: '24px 40px',
      marginTop: 'auto'
    }}>
      <div style={{
        maxWidth: '1360px',
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <GraduationCap size={18} color="var(--primary)" />
          <span style={{ fontSize: '13.5px', fontWeight: 600, color: 'var(--slate-600)' }}>
            Student Management System (SMS) — Django REST + React.js Architecture
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '12.5px', color: '#059669', fontWeight: 600 }}>
            <CheckCircle2 size={14} />
            <span>DRF API Connected</span>
          </div>
          <span style={{ fontSize: '13px', color: 'var(--slate-500)' }}>
            © {new Date().getFullYear()} Campus Academic Systems
          </span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
