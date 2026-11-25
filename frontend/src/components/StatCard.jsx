import React from 'react';

const StatCard = ({ title, value, subtitle, icon: Icon, badge, color = 'primary' }) => {
  const getTheme = () => {
    switch (color) {
      case 'success':
        return { bg: '#ecfdf5', text: '#059669', border: '#a7f3d0' };
      case 'warning':
        return { bg: '#fffbeb', text: '#d97706', border: '#fde68a' };
      case 'danger':
        return { bg: '#fef2f2', text: '#dc2626', border: '#fecaca' };
      case 'info':
        return { bg: '#f0f9ff', text: '#0284c7', border: '#bae6fd' };
      default:
        return { bg: '#eef2ff', text: '#4f46e5', border: '#c7d2fe' };
    }
  };

  const theme = getTheme();

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '14px', position: 'relative' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--slate-500)', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
          {title}
        </span>
        {Icon && (
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: '10px',
            background: theme.bg,
            color: theme.text,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: `1px solid ${theme.border}`
          }}>
            <Icon size={18} />
          </div>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
        <span style={{ fontSize: '32px', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.5px' }}>
          {value}
        </span>
        {badge && (
          <span style={{
            fontSize: '11px',
            fontWeight: 700,
            padding: '2px 8px',
            borderRadius: '6px',
            background: theme.bg,
            color: theme.text
          }}>
            {badge}
          </span>
        )}
      </div>

      {subtitle && (
        <span style={{ fontSize: '12.5px', color: 'var(--slate-500)', fontWeight: 500 }}>
          {subtitle}
        </span>
      )}
    </div>
  );
};

export default StatCard;
