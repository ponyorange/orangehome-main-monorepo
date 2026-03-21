import React from 'react';

interface LayerPanelProps {
  count: number;
  children: React.ReactNode;
}

export const LayerPanel: React.FC<LayerPanelProps> = ({ count, children }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px',
          borderBottom: '1px solid #e0e0e0',
        }}
      >
        <div style={{ fontSize: 13, fontWeight: 600, color: '#333' }}>图层</div>
        <div style={{ fontSize: 11, color: '#999' }}>{count} 项</div>
      </div>

      <div style={{ flex: 1, overflow: 'auto', padding: '8px' }}>{children}</div>
    </div>
  );
};
