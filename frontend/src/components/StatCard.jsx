import React from 'react';

const StatCard = ({ title, value, subtitle, icon: Icon, badge, color = 'primary' }) => {
  const getTheme = () => {
    switch (color) {
      case 'indigo':
      case 'secondary':
        return { 
          bg: 'rgba(81, 70, 165, 0.08)', 
          text: '#5146A5', 
          border: 'rgba(81, 70, 165, 0.2)' 
        };
      case 'success':
        return { 
          bg: 'var(--color-success-bg)', 
          text: 'var(--color-success)', 
          border: 'rgba(22, 163, 106, 0.25)' 
        };
      case 'warning':
        return { 
          bg: 'var(--color-warning-bg)', 
          text: 'var(--color-warning)', 
          border: 'rgba(229, 163, 35, 0.25)' 
        };
      case 'danger':
        return { 
          bg: 'var(--color-danger-bg)', 
          text: 'var(--color-danger)', 
          border: 'rgba(220, 76, 76, 0.25)' 
        };
      case 'info':
        return { 
          bg: 'var(--color-info-bg)', 
          text: 'var(--color-accent)', 
          border: 'rgba(57, 120, 212, 0.25)' 
        };
      default: // primary (Academic Blue)
        return { 
          bg: 'var(--color-primary-light)', 
          text: 'var(--color-primary)', 
          border: 'rgba(36, 87, 166, 0.25)' 
        };
    }
  };

  const theme = getTheme();

  return (
    <div 
      className="card" 
      style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '14px', 
        position: 'relative',
        transition: 'all 0.2s ease',
        cursor: 'default'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.borderColor = 'var(--color-border-strong)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.borderColor = 'var(--color-border)';
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ 
          fontSize: '12px', 
          fontWeight: 700, 
          color: 'var(--color-text-secondary)', 
          textTransform: 'uppercase', 
          letterSpacing: '0.5px' 
        }}>
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
            <Icon size={19} />
          </div>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
        <span style={{ 
          fontSize: '30px', 
          fontWeight: 800, 
          color: 'var(--color-text-primary)', 
          letterSpacing: '-0.5px' 
        }}>
          {value}
        </span>
        {badge && (
          <span style={{
            fontSize: '11px',
            fontWeight: 700,
            padding: '2px 8px',
            borderRadius: '6px',
            background: theme.bg,
            color: theme.text,
            border: `1px solid ${theme.border}`
          }}>
            {badge}
          </span>
        )}
      </div>

      {subtitle && (
        <div style={{ 
          fontSize: '12.5px', 
          color: 'var(--color-text-muted)', 
          display: 'flex', 
          alignItems: 'center', 
          gap: '6px',
          paddingTop: '2px',
          borderTop: '1px solid #F1F5F9'
        }}>
          <span>{subtitle}</span>
        </div>
      )}
    </div>
  );
};

export default StatCard;
