import React from 'react';

const ConflictModal = ({ isOpen, message, onConfirm, onCancel }) => {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)', 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: 'white', 
        padding: '24px', 
        borderRadius: '12px', 
        width: '500px', /* 修改這裡：原本是 300px，現在改寬為 500px */
        maxWidth: '90%', /* 確保手機版不會爆版 */
        textAlign: 'center',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
      }}>
        {/* 修改這裡：使用 Unicode \u26A0\uFE0F 代表警告圖示，避免變成 ?? */}
        <h3 style={{ color: '#e11d48', marginBottom: '16px', fontSize: '1.25rem', fontWeight: 'bold' }}>
          {'\u26A0\uFE0F'} Course Conflict
        </h3>
        
        <p style={{ marginBottom: '24px', color: '#4b5563', lineHeight: '1.5', whiteSpace: 'pre-line' }}>
          {message}
        </p>
        
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
          <button 
            onClick={onCancel} 
            style={{ 
              padding: '8px 16px', 
              border: '1px solid #d1d5db', 
              borderRadius: '6px', 
              background: 'white', 
              color: '#374151',
              cursor: 'pointer',
              fontWeight: '500'
            }}
          >
            Cancel
          </button>
          <button 
            onClick={onConfirm} 
            style={{ 
              padding: '8px 16px', 
              backgroundColor: '#e11d48', 
              color: 'white', 
              border: 'none', 
              borderRadius: '6px', 
              cursor: 'pointer',
              fontWeight: '500'
            }}
          >
            Confirm Overwrite
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConflictModal;