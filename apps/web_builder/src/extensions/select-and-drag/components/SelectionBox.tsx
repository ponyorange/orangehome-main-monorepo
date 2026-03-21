import React, { useCallback } from 'react';
import type { ResizeDirection } from '../hooks/useResize';

interface SelectionBoxProps {
  x: number;
  y: number;
  width: number;
  height: number;
  componentId: string;
  onResizeStart?: (direction: ResizeDirection, e: React.MouseEvent) => void;
  onMoveStart?: (e: React.MouseEvent) => void;
}

const HANDLE_SIZE = 6;

const handles: { dir: ResizeDirection; style: React.CSSProperties; cursor: string }[] = [
  { dir: 'nw', style: { top: -HANDLE_SIZE / 2, left: -HANDLE_SIZE / 2 }, cursor: 'nw-resize' },
  { dir: 'n',  style: { top: -HANDLE_SIZE / 2, left: '50%', transform: 'translateX(-50%)' }, cursor: 'n-resize' },
  { dir: 'ne', style: { top: -HANDLE_SIZE / 2, right: -HANDLE_SIZE / 2 }, cursor: 'ne-resize' },
  { dir: 'w',  style: { top: '50%', left: -HANDLE_SIZE / 2, transform: 'translateY(-50%)' }, cursor: 'w-resize' },
  { dir: 'e',  style: { top: '50%', right: -HANDLE_SIZE / 2, transform: 'translateY(-50%)' }, cursor: 'e-resize' },
  { dir: 'sw', style: { bottom: -HANDLE_SIZE / 2, left: -HANDLE_SIZE / 2 }, cursor: 'sw-resize' },
  { dir: 's',  style: { bottom: -HANDLE_SIZE / 2, left: '50%', transform: 'translateX(-50%)' }, cursor: 's-resize' },
  { dir: 'se', style: { bottom: -HANDLE_SIZE / 2, right: -HANDLE_SIZE / 2 }, cursor: 'se-resize' },
];

export const SelectionBox: React.FC<SelectionBoxProps> = ({
  x,
  y,
  width,
  height,
  componentId,
  onResizeStart,
  onMoveStart,
}) => {
  const handleResizeMouseDown = useCallback((dir: ResizeDirection, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    onResizeStart?.(dir, e);
  }, [onResizeStart]);

  const handleMoveMouseDown = useCallback((e: React.MouseEvent) => {
    if ((e.target as HTMLElement).dataset.resizeDir) return;
    onMoveStart?.(e);
  }, [onMoveStart]);

  return (
    <div
      style={{
        position: 'absolute',
        top: y - 1,
        left: x - 1,
        width: width + 2,
        height: height + 2,
        border: '1px solid var(--theme-primary)',
        borderRadius: 14,
        boxShadow: '0 0 0 4px var(--theme-primary-light), 0 12px 24px rgba(79, 124, 255, 0.12)',
        pointerEvents: 'none',
        zIndex: 1000,
      }}
      onMouseDown={handleMoveMouseDown}
    >
      {/* 左上角标签 - 组件ID */}
      <div
        style={{
          position: 'absolute',
          top: -26,
          left: 4,
          background: 'var(--theme-gradient-accent)',
          color: '#fff',
          fontSize: 11,
          fontWeight: 700,
          padding: '4px 10px',
          borderRadius: 999,
          whiteSpace: 'nowrap',
          boxShadow: 'var(--theme-shadow-sm)',
        }}
      >
        {componentId}
      </div>

      {/* 右下角标签 - 尺寸 */}
      <div
        style={{
          position: 'absolute',
          bottom: -26,
          right: 4,
          background: 'rgba(16,24,40,0.82)',
          color: '#fff',
          fontSize: 11,
          fontWeight: 700,
          padding: '4px 10px',
          borderRadius: 999,
          whiteSpace: 'nowrap',
          boxShadow: 'var(--theme-shadow-sm)',
        }}
      >
        {Math.round(width)} x {Math.round(height)}
      </div>

      {/* 8方向手柄 */}
      {handles.map(({ dir, style, cursor }) => (
        <div
          key={dir}
          data-resize-dir={dir}
          onMouseDown={(e) => handleResizeMouseDown(dir, e)}
          style={{
            position: 'absolute',
            width: HANDLE_SIZE,
            height: HANDLE_SIZE,
            background: 'linear-gradient(135deg, #ffffff 0%, rgba(255,255,255,0.78) 100%)',
            border: '1px solid var(--theme-primary)',
            borderRadius: '50%',
            cursor,
            pointerEvents: 'auto',
            zIndex: 1001,
            boxShadow: '0 0 0 2px rgba(255,255,255,0.85), 0 4px 10px rgba(79, 124, 255, 0.18)',
            ...style,
          }}
        />
      ))}
    </div>
  );
};
