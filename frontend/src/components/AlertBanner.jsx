import React from 'react';
import { AlertCircle, CheckCircle2, Info, AlertTriangle, X } from 'lucide-react';

const AlertBanner = ({ type = 'error', message, onClose }) => {
  if (!message) return null;

  const getConfig = () => {
    switch (type) {
      case 'success':
        return {
          bg: 'var(--color-success-bg)',
          border: 'rgba(22, 163, 106, 0.25)',
          color: 'var(--color-success)',
          Icon: CheckCircle2
        };
      case 'warning':
        return {
          bg: 'var(--color-warning-bg)',
          border: 'rgba(229, 163, 35, 0.3)',
          color: 'var(--color-warning)',
          Icon: AlertTriangle
        };
      case 'info':
        return {
          bg: 'var(--color-info-bg)',
          border: 'rgba(57, 120, 212, 0.25)',
          color: 'var(--color-accent)',
          Icon: Info
        };
      default: // error / danger
        return {
          bg: 'var(--color-danger-bg)',
          border: 'rgba(220, 76, 76, 0.25)',
          color: 'var(--color-danger)',
          Icon: AlertCircle
        };
    }
  };

  const { bg, border, color, Icon } = getConfig();

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '12px',
      padding: '12px 18px',
      borderRadius: 'var(--radius-md)',
      background: bg,
      border: `1px solid ${border}`,
      color: color,
      fontSize: '13.5px',
      fontWeight: 600,
      marginBottom: '20px'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Icon size={18} />
        <span>{message}</span>
      </div>
      {onClose && (
        <button 
          onClick={onClose}
          style={{ 
            background: 'none', 
            border: 'none', 
            cursor: 'pointer', 
            color: 'inherit',
            display: 'flex',
            alignItems: 'center',
            padding: '4px'
          }}
        >
          <X size={15} />
        </button>
      )}
    </div>
  );
};

export default AlertBanner;
