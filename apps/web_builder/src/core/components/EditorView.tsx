import React from 'react';
import { SlotRenderer } from '../slots/SlotRenderer';
import { usePreviewStore } from '../store/previewStore';
import { Preview } from './Preview';

export const EditorView: React.FC = () => {
  const isPreviewMode = usePreviewStore((state) => state.isPreviewMode);

  if (isPreviewMode) {
    return <Preview />;
  }

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      {/* Header */}
      <header style={{
        background: '#fff',
        borderBottom: '1px solid #e0e0e0',
        height: '56px',
        flexShrink: 0,
      }}>
        <SlotRenderer
          slotName="header"
          style={{ height: '100%', alignItems: 'center' }}
        />
      </header>

      {/* Main Content */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Left Panel - 竖向Tab设计 */}
        <aside
          style={{
            width: '280px',
            background: '#fff',
            borderRight: '1px solid #e0e0e0',
            flexShrink: 0,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <SlotRenderer
            slotName="left-panel"
            style={{ height: '100%' }}
          />
        </aside>

        {/* Center Canvas */}
        <main style={{
          background: '#f5f5f5',
          position: 'relative',
          overflow: 'hidden',
          flex: 1,
        }}>
          <SlotRenderer slotName="center" style={{ height: '100%' }} />
        </main>

        {/* Right Panel */}
        <aside
          style={{
            width: '300px',
            background: '#fff',
            borderLeft: '1px solid #e0e0e0',
            flexShrink: 0,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <SlotRenderer
            slotName="right-panel"
            style={{ height: '100%', flexDirection: 'column' }}
          />
        </aside>
      </div>
    </div>
  );
};
