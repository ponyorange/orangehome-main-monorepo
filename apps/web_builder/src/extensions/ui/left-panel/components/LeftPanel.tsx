import React from 'react';
import { SlotRenderer } from '../../../../core/slots/SlotRenderer';
import { useLeftPanelStore } from '../store';
import { ComponentPanel } from '../../../features/component-tab/components/ComponentPanel';
import { LayerTree } from '../../../features/layer-tab/components/LayerTree';

export const LeftPanel: React.FC = () => {
  const { collapsed, activeTab } = useLeftPanelStore();

  if (collapsed) {
    return (
      <div
        style={{
          width: '48px',
          height: '100%',
          borderRight: '1px solid #e0e0e0',
          background: '#fff',
        }}
      >
        {/* 只显示 Tabs */}
        <SlotRenderer
          slotName="left-panel:tabs"
          direction="vertical"
          style={{ height: '100%' }}
        />
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', height: '100%' }}>
      {/* 左侧竖向 Tabs - 48px 宽 */}
      <div
        style={{
          width: '48px',
          height: '100%',
          borderRight: '1px solid #e0e0e0',
          background: '#fff',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <SlotRenderer
          slotName="left-panel:tabs"
          direction="vertical"
        />
      </div>

      {/* 右侧内容区 - 根据 activeTab 显示 */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* 顶部区域 */}
        <div style={{ padding: '12px', borderBottom: '1px solid #e0e0e0' }}>
          <SlotRenderer slotName="left-panel:top" />
        </div>

        {/* 主内容区 - 直接根据 activeTab 渲染对应组件，只有一个内容存在 */}
        <div style={{ flex: 1, overflow: 'hidden' }}>
          {activeTab === 'component' ? <ComponentPanel /> : null}
          {activeTab === 'layer' ? <LayerTree /> : null}
        </div>

        {/* 底部区域 */}
        <div style={{ padding: '12px', borderTop: '1px solid #e0e0e0' }}>
          <SlotRenderer slotName="left-panel:bottom" />
        </div>
      </div>
    </div>
  );
};
