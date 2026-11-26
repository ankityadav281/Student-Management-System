import React from 'react';
import { GraduationCap, CheckCircle2 } from 'lucide-react';

const Footer = () => {
  return (
    <footer style={{
      width: '100%',
      borderTop: '1px solid var(--color-border)',
      background: 'var(--color-surface)',
      padding: '20px 36px',
      marginTop: 'auto'
    }}>
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <GraduationCap size={18} color="var(--color-primary)" />
          <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-secondary)' }}>
            Student Management System — University Academic Administration Platform
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: '6px', 
            fontSize: '12.5px', 
            color: 'var(--color-success)', 
            fontWeight: 700 
          }}>
            <CheckCircle2 size={14} />
            <span>DRF API Online</span>
          </div>
          <span style={{ fontSize: '12.5px', color: 'var(--color-text-muted)' }}>
            © {new Date().getFullYear()} Campus Academic Services
          </span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
