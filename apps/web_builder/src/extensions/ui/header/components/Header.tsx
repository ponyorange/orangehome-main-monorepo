import React from 'react';
import { SlotRenderer } from '../../../../core/slots/SlotRenderer';

export const Header: React.FC = () => {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '1fr auto 1fr',
      alignItems: 'center',
      height: '100%',
      padding: '0 18px',
      background: 'linear-gradient(135deg, rgba(255,255,255,0.72) 0%, rgba(255,255,255,0.42) 100%)',
      boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.65)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <SlotRenderer slotName="header:left" />
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          justifyContent: 'center',
          padding: '6px 12px',
          borderRadius: 999,
          background: 'rgba(255,255,255,0.56)',
          border: '1px solid var(--theme-border-soft)',
          boxShadow: 'var(--theme-shadow-sm)',
        }}
      >
        <SlotRenderer slotName="header:center" />
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', justifyContent: 'flex-end' }}>
        <SlotRenderer slotName="header:right" />
      </div>
    </div>
  );
};
