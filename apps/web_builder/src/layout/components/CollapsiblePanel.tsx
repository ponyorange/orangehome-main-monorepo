/**
 * CollapsiblePanel - 可折叠面板组件
 * 用于 LeftPanel 和 RightPanel 的展开/折叠
 */

import React, { useState } from 'react';

export interface CollapsiblePanelProps {
  /** 面板位置 */
  position: 'left' | 'right';
  /** 默认宽度 */
  defaultWidth?: number;
  /** 最小宽度 */
  minWidth?: number;
  /** 是否默认折叠 */
  defaultCollapsed?: boolean;
  /** 面板标题 */
  title?: string;
  /** 内容 */
  children: React.ReactNode;
  /** 自定义类名 */
  className?: string;
}

export function CollapsiblePanel({
  position,
  defaultWidth = 240,
  minWidth = 48,
  defaultCollapsed = false,
  title,
  children,
  className,
}: CollapsiblePanelProps) {
  const [collapsed, setCollapsed] = useState(defaultCollapsed);
  const [width, setWidth] = useState(defaultWidth);
  const [isResizing, setIsResizing] = useState(false);

  const toggleCollapse = () => setCollapsed(!collapsed);

  const handleResizeStart = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);

    const startX = e.clientX;
    const startWidth = width;

    const handleMove = (moveEvent: MouseEvent) => {
      const delta = position === 'left'
        ? moveEvent.clientX - startX
        : startX - moveEvent.clientX;
      const newWidth = Math.max(minWidth, Math.min(400, startWidth + delta));
      setWidth(newWidth);
    };

    const handleUp = () => {
      setIsResizing(false);
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleUp);
    };

    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleUp);
  };

  const isLeft = position === 'left';
  // 使用字符代替箭头图标
  const ChevronIcon = () => (
    <span style={{ fontSize: 14, fontWeight: 'bold' }}>
      {collapsed
        ? (isLeft ? '›' : '‹')
        : (isLeft ? '‹' : '›')}
    </span>
  );

  return (
    <div
      className={`collapsible-panel ${position} ${collapsed ? 'collapsed' : ''} ${className || ''}`}
      style={{
        width: collapsed ? minWidth : width,
        minWidth: collapsed ? minWidth : undefined,
        flexShrink: 0,
        display: 'flex',
        flexDirection: 'column',
        background: '#fff',
        borderRight: isLeft ? '1px solid var(--semi-color-border, #eee)' : undefined,
        borderLeft: !isLeft ? '1px solid var(--semi-color-border, #eee)' : undefined,
        transition: isResizing ? undefined : 'width 0.2s ease',
        position: 'relative',
      }}
    >
      {/* 标题栏 */}
      <div
        className="collapsible-panel-header"
        style={{
          height: 40,
          display: 'flex',
          alignItems: 'center',
          justifyContent: isLeft ? 'flex-end' : 'flex-start',
          padding: '0 8px',
          borderBottom: '1px solid var(--semi-color-border, #eee)',
        }}
      >
        {!collapsed && title && (
          <span style={{ fontSize: 14, fontWeight: 500, marginRight: 'auto', marginLeft: 8 }}>
            {title}
          </span>
        )}
        <button
          onClick={toggleCollapse}
          style={{
            width: 28,
            height: 28,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: 'none',
            background: 'transparent',
            cursor: 'pointer',
            borderRadius: 4,
          }}
          title={collapsed ? '展开' : '折叠'}
        >
          <ChevronIcon />
        </button>
      </div>

      {/* 内容区 */}
      <div
        className="collapsible-panel-content"
        style={{
          flex: 1,
          overflow: 'auto',
          display: collapsed ? 'none' : 'block',
        }}
      >
        {children}
      </div>

      {/* 拖拽调整宽度 */}
      {!collapsed && (
        <div
          className="collapsible-panel-resizer"
          onMouseDown={handleResizeStart}
          style={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            width: 4,
            cursor: 'col-resize',
            [isLeft ? 'right' : 'left']: -2,
            zIndex: 10,
          }}
        />
      )}
    </div>
  );
}
