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
    <div
      style={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
        background: 'var(--theme-gradient-page)',
        color: 'var(--theme-text-primary)',
        padding: 14,
        gap: 14,
        boxSizing: 'border-box',
      }}
    >
      {/* Header */}
      <header
        style={{
          background: 'var(--theme-gradient-panel)',
          border: '1px solid var(--theme-border-soft)',
          boxShadow: 'var(--theme-shadow-md)',
          backdropFilter: 'blur(var(--theme-backdrop-blur))',
          height: '64px',
          flexShrink: 0,
          borderRadius: 24,
          overflow: 'hidden',
        }}
      >
        <SlotRenderer
          slotName="header"
          style={{ height: '100%', alignItems: 'center' }}
        />
      </header>

      {/* Main Content */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden', gap: 14, minHeight: 0 }}>
        {/* Left Panel - 竖向Tab设计 */}
        <aside
          style={{
            width: '280px',
            background: 'var(--theme-gradient-panel)',
            border: '1px solid var(--theme-border-soft)',
            boxShadow: 'var(--theme-shadow-md)',
            backdropFilter: 'blur(var(--theme-backdrop-blur))',
            flexShrink: 0,
            display: 'flex',
            flexDirection: 'column',
            borderRadius: 28,
            overflow: 'hidden',
          }}
        >
          <SlotRenderer
            slotName="left-panel"
            style={{ height: '100%' }}
          />
        </aside>

        {/* Center Canvas */}
        <main style={{
          background: 'linear-gradient(180deg, rgba(255,255,255,0.28) 0%, rgba(255,255,255,0.12) 100%)',
          border: '1px solid var(--theme-border-soft)',
          boxShadow: 'var(--theme-shadow-lg)',
          backdropFilter: 'blur(calc(var(--theme-backdrop-blur) * 0.65))',
          position: 'relative',
          overflow: 'hidden',
          flex: 1,
          borderRadius: 32,
        }}>
          <SlotRenderer slotName="center" style={{ height: '100%' }} />
        </main>

        {/* Right Panel */}
        <aside
          style={{
            width: '300px',
            background: 'var(--theme-gradient-panel)',
            border: '1px solid var(--theme-border-soft)',
            boxShadow: 'var(--theme-shadow-md)',
            backdropFilter: 'blur(var(--theme-backdrop-blur))',
            flexShrink: 0,
            display: 'flex',
            flexDirection: 'column',
            borderRadius: 28,
            overflow: 'hidden',
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
