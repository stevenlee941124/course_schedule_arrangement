// 檔案位置: frontend/src/components/ConflictModal.js
import React from 'react';

const ConflictModal = ({ isOpen, message, onConfirm, onCancel }) => {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
    }}>
      <div style={{
        backgroundColor: 'white', padding: '20px', borderRadius: '8px', width: '300px', textAlign: 'center'
      }}>
        <h3 style={{ color: '#e11d48', marginBottom: '10px' }}>?? Course Conflict</h3>
        <p style={{ marginBottom: '20px' }}>{message}</p>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <button onClick={onCancel} style={{ padding: '8px 16px', border: '1px solid #ccc', borderRadius: '4px', background: 'white', cursor: 'pointer' }}>Cancel</button>
          <button onClick={onConfirm} style={{ padding: '8px 16px', backgroundColor: '#e11d48', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Confirmed to Cover</button>
        </div>
      </div>
    </div>
  );
};

export default ConflictModal;