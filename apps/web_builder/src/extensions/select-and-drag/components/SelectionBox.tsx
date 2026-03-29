import React, { useCallback, useMemo } from 'react';
import type { ResizeDirection } from '../hooks/useResize';

interface SelectionBoxProps {
  x: number;
  y: number;
  width: number;
  height: number;
  componentId: string;
  onResizeStart?: (direction: ResizeDirection, e: React.MouseEvent) => void;
  onMoveStart?: (e: React.MouseEvent) => void;
  /**
   * 画布祖先有 transform scale(s) 时传 `1/s`（如 selectionRectVisualToLogical）。
   * 加粗主边框 / 外圈 spread / 手柄尺寸与描边；角标字号与内边距按 cs 放大以便屏幕可读。
   * **不对选中矩形做 transform**，内沿仍对齐组件 w×h。
   */
  chromeVisualScale?: number;
}

const HANDLE_BASE = 6;

export const SelectionBox: React.FC<SelectionBoxProps> = ({
  x,
  y,
  width,
  height,
  componentId,
  onResizeStart,
  onMoveStart,
  chromeVisualScale = 1,
}) => {
  const cs = chromeVisualScale > 0 ? chromeVisualScale : 1;
  /** 逻辑 CSS 边框宽度：经祖先 scale 后在屏幕上约 1px（只加粗线，不放大选中矩形） */
  const bw = cs;
  /** 经画布 scale 后在屏幕上约 HANDLE_BASE 像素的可点区域 */
  const handleSize = Math.round(HANDLE_BASE * cs);
  const hh = handleSize / 2;

  const handles = useMemo(
    (): { dir: ResizeDirection; style: React.CSSProperties; cursor: string }[] => [
      { dir: 'nw', style: { top: -hh, left: -hh }, cursor: 'nw-resize' },
      { dir: 'n', style: { top: -hh, left: '50%', transform: 'translateX(-50%)' }, cursor: 'n-resize' },
      { dir: 'ne', style: { top: -hh, right: -hh }, cursor: 'ne-resize' },
      { dir: 'w', style: { top: '50%', left: -hh, transform: 'translateY(-50%)' }, cursor: 'w-resize' },
      { dir: 'e', style: { top: '50%', right: -hh, transform: 'translateY(-50%)' }, cursor: 'e-resize' },
      { dir: 'sw', style: { bottom: -hh, left: -hh }, cursor: 'sw-resize' },
      { dir: 's', style: { bottom: -hh, left: '50%', transform: 'translateX(-50%)' }, cursor: 's-resize' },
      { dir: 'se', style: { bottom: -hh, right: -hh }, cursor: 'se-resize' },
    ],
    [hh],
  );

  const handleResizeMouseDown = useCallback((dir: ResizeDirection, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    onResizeStart?.(dir, e);
  }, [onResizeStart]);

  const handleMoveMouseDown = useCallback((e: React.MouseEvent) => {
    if ((e.target as HTMLElement).dataset.resizeDir) return;
    onMoveStart?.(e);
  }, [onMoveStart]);

  /** 角标仅在画布缩放时放大逻辑 px，经祖先 scale 后在屏幕上接近 11px / 原 padding */
  const labelFontSize = Math.round(11 * cs);
  const labelPadV = Math.round(4 * cs);
  const labelPadH = Math.round(10 * cs);
  const labelOffset = Math.round(26 * cs);
  const labelInset = Math.round(4 * cs);

  const labelChromeStyle: React.CSSProperties = {
    fontSize: labelFontSize,
    fontWeight: 700,
    padding: `${labelPadV}px ${labelPadH}px`,
    borderRadius: 999,
    whiteSpace: 'nowrap',
    boxShadow: 'var(--theme-shadow-sm)',
  };

  return (
    <div
      style={{
        position: 'absolute',
        top: y - bw,
        left: x - bw,
        width: width + 2 * bw,
        height: height + 2 * bw,
        border: `${bw}px solid var(--theme-primary)`,
        borderRadius: 14,
        boxShadow: `0 0 0 ${4 * cs}px var(--theme-primary-light), 0 12px 24px rgba(79, 124, 255, 0.12)`,
        pointerEvents: 'none',
        zIndex: 1000,
        boxSizing: 'border-box',
      }}
      onMouseDown={handleMoveMouseDown}
    >
      <div
        style={{
          position: 'absolute',
          top: -labelOffset,
          left: labelInset,
          background: 'var(--theme-gradient-accent)',
          color: '#fff',
          ...labelChromeStyle,
        }}
      >
        {componentId}
      </div>

      <div
        style={{
          position: 'absolute',
          bottom: -labelOffset,
          right: labelInset,
          background: 'rgba(16,24,40,0.82)',
          color: '#fff',
          ...labelChromeStyle,
        }}
      >
        {Math.round(width)} x {Math.round(height)}
      </div>

      {handles.map(({ dir, style, cursor }) => (
        <div
          key={dir}
          data-resize-dir={dir}
          onMouseDown={(e) => handleResizeMouseDown(dir, e)}
          style={{
            position: 'absolute',
            width: handleSize,
            height: handleSize,
            background: 'linear-gradient(135deg, #ffffff 0%, rgba(255,255,255,0.78) 100%)',
            border: `${bw}px solid var(--theme-primary)`,
            borderRadius: '50%',
            cursor,
            pointerEvents: 'auto',
            zIndex: 1001,
            boxShadow: `0 0 0 ${2 * cs}px rgba(255,255,255,0.85), 0 ${4 * cs}px ${10 * cs}px rgba(79, 124, 255, 0.18)`,
            ...style,
          }}
        />
      ))}
    </div>
  );
};
