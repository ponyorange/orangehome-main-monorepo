import React from 'react';
import { SlotRenderer } from '../../../../core/slots/SlotRenderer';

export const Header: React.FC = () => {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '1fr auto 1fr',
      alignItems: 'center',
      height: '100%',
      padding: '0 16px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <SlotRenderer slotName="header:left" />
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
        <SlotRenderer slotName="header:center" />
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'flex-end' }}>
        <SlotRenderer slotName="header:right" />
      </div>
    </div>
  );
};
