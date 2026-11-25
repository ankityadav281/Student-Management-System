import React from 'react';
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';

const AlertBanner = ({ type = 'error', message, onClose }) => {
  if (!message) return null;

  const isError = type === 'error';
  const isSuccess = type === 'success';

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '12px',
      padding: '12px 18px',
      borderRadius: 'var(--radius-md)',
      background: isError ? '#fef2f2' : (isSuccess ? '#ecfdf5' : '#eff6ff'),
      border: `1px solid ${isError ? '#fecaca' : (isSuccess ? '#a7f3d0' : '#bfdbfe')}`,
      color: isError ? '#b91c1c' : (isSuccess ? '#047857' : '#1d4ed8'),
      fontSize: '13.5px',
      fontWeight: 500,
      marginBottom: '18px'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {isError && <AlertCircle size={17} />}
        {isSuccess && <CheckCircle2 size={17} />}
        {!isError && !isSuccess && <Info size={17} />}
        <span>{message}</span>
      </div>
      {onClose && (
        <button 
          onClick={onClose}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit' }}
        >
          <X size={15} />
        </button>
      )}
    </div>
  );
};

export default AlertBanner;
