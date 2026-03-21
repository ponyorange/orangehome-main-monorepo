import React from 'react';

export const Logo: React.FC = () => {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <span style={{ fontSize: '20px' }}>🍊</span>
      <span style={{ fontSize: '16px', fontWeight: 600 }}>Orange Editor</span>
    </div>
  );
};
