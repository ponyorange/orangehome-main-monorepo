/**
 * LayoutShell - 编辑器主布局壳
 * 5 区域布局：header、leftPanel、center、rightPanel、float
 */

import React from 'react';
import { SlotRenderer } from './SlotRenderer';
import { CollapsiblePanel } from './components/CollapsiblePanel';

export interface LayoutShellProps {
  /** 自定义类名 */
  className?: string;
}

export function LayoutShell({ className }: LayoutShellProps) {
  return (
    <div
      className={`layout-shell ${className || ''}`}
      style={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        background: '#f5f5f5',
      }}
    >
      {/* Header */}
      <header
        className="layout-header"
        style={{
          height: 48,
          background: '#fff',
          borderBottom: '1px solid var(--semi-color-border, #eee)',
          display: 'flex',
          alignItems: 'center',
          padding: '0 16px',
          zIndex: 100,
        }}
      >
        <SlotRenderer
          type="header"
          emptyPlaceholder={
            <div style={{ color: '#999', fontSize: 14 }}>Orange Editor</div>
          }
          vertical={false}
        />
      </header>

      {/* 主内容区 */}
      <div
        className="layout-body"
        style={{
          flex: 1,
          display: 'flex',
          overflow: 'hidden',
        }}
      >
        {/* LeftPanel */}
        <CollapsiblePanel position="left" title="左侧面板">
          <SlotRenderer
            type="leftPanel"
            emptyPlaceholder={
              <div style={{ padding: 16, color: '#999', fontSize: 12 }}>
                暂无左侧面板内容
              </div>
            }
          />
        </CollapsiblePanel>

        {/* Center */}
        <main
          className="layout-center"
          style={{
            flex: 1,
            overflow: 'auto',
            background: '#f5f5f5',
            position: 'relative',
          }}
        >
          <SlotRenderer
            type="center"
            emptyPlaceholder={
              <div
                style={{
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#999',
                }}
              >
                请注册画布插槽
              </div>
            }
          />
        </main>

        {/* RightPanel */}
        <CollapsiblePanel position="right" title="右侧面板">
          <SlotRenderer
            type="rightPanel"
            emptyPlaceholder={
              <div style={{ padding: 16, color: '#999', fontSize: 12 }}>
                暂无右侧面板内容
              </div>
            }
          />
        </CollapsiblePanel>
      </div>

      {/* Float 层 */}
      <div
        className="layout-float"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          pointerEvents: 'none',
          zIndex: 1000,
        }}
      >
        <SlotRenderer type="float" />
      </div>
    </div>
  );
}
