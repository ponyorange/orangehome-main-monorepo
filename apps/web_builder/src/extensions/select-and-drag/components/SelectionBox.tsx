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
        pointerEvents: 'none',
        zIndex: 1000,
      }}
      onMouseDown={handleMoveMouseDown}
    >
      {/* 左上角标签 - 组件ID */}
      <div
        style={{
          position: 'absolute',
          top: -22,
          left: -1,
          background: 'var(--theme-primary)',
          color: '#fff',
          fontSize: 11,
          padding: '2px 6px',
          borderRadius: '2px 2px 2px 0',
          whiteSpace: 'nowrap',
        }}
      >
        {componentId}
      </div>

      {/* 右下角标签 - 尺寸 */}
      <div
        style={{
          position: 'absolute',
          bottom: -22,
          right: -1,
          background: 'var(--theme-primary)',
          color: '#fff',
          fontSize: 11,
          padding: '2px 6px',
          borderRadius: '2px 0 2px 2px',
          whiteSpace: 'nowrap',
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
            background: '#fff',
            border: '1px solid var(--theme-primary)',
            borderRadius: '50%',
            cursor,
            pointerEvents: 'auto',
            zIndex: 1001,
            ...style,
          }}
        />
      ))}
    </div>
  );
};
