import React from 'react';
import { SlotRenderer } from '../../../../core/slots/SlotRenderer';

export const RightPanel: React.FC = () => {
  return (
    <div data-right-panel="true" style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
    }}>
      {/* 顶部区域 */}
      <div style={{
        padding: '12px',
        borderBottom: '1px solid #e0e0e0',
      }}>
        <SlotRenderer slotName="right-panel:top" />
      </div>

      {/* 主内容区 */}
      <div style={{
        flex: 1,
        overflow: 'auto',
        padding: '12px',
      }}>
        <SlotRenderer slotName="right-panel:content" direction="vertical" />
      </div>

      {/* 底部区域 */}
      <div style={{
        padding: '12px',
        borderTop: '1px solid #e0e0e0',
      }}>
        <SlotRenderer slotName="right-panel:bottom" />
      </div>
    </div>
  );
};
