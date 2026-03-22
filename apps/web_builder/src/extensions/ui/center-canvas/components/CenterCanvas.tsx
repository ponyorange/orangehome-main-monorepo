import React, { useRef, useState, useCallback, useEffect, useMemo } from 'react';
import { Button } from '@douyinfe/semi-ui';
import { IconMinus, IconPlus, IconRefresh } from '@douyinfe/semi-icons';
import { SelectableSchemaRenderer, SelectionContext } from '../../../../common/components/SchemaRenderer';
import { useSchemaStore } from '../../../../core/store/schemaStore';
import { useZoom, formatZoomPercent } from '../../../../extensions/canvas/hooks/useZoom';
import { Grid } from '../../../../extensions/canvas/components/Grid';
import { RulerX, RulerY } from '../../../../extensions/ruler';
import { useSimpleSelection } from '../../../../extensions/select-and-drag/hooks/useSelection';
import { useCanvasDrop } from '../hooks/useCanvasDrop';
import { useMove } from '../../../../extensions/select-and-drag/hooks/useMove';
import { useResize } from '../../../../extensions/select-and-drag/hooks/useResize';
import type { ResizeDirection } from '../../../../extensions/select-and-drag/hooks/useResize';
import { AlignmentGuides } from '../../../../extensions/select-and-drag/components/AlignmentGuides';
import {
  alignLinesEqual,
  computeAlignLines,
  type AlignLine,
} from '../../../../extensions/select-and-drag/services/AlignmentService';
import { KeyboardShortcuts } from '../../../../extensions/editing/keyboard-shortcuts';
import { ContextMenu } from '../../../../extensions/editing/context-menu';

const CANVAS_WIDTH = 375;
const CANVAS_HEIGHT = 667;
const RULER_SIZE = 24;
const CANVAS_MARGIN = 200;
const VERTICAL_OFFSET = 50;

export const CenterCanvas: React.FC = () => {
  const { schema } = useSchemaStore();
  const { zoom, zoomIn, zoomOut, resetZoom } = useZoom();

  const selectionState = useSimpleSelection();
  const { clearSelection } = selectionState;

  const { startMove } = useMove(selectionState.selectedIds);
  const { startResize } = useResize();
  const [alignLines, setAlignLines] = useState<AlignLine[]>([]);

  const [contextMenuState, setContextMenuState] = useState<{ x: number; y: number; targetId: string } | null>(null);

  const handleContextMenu = useCallback((id: string, event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    if (!selectionState.isSelected(id)) {
      selectionState.handleClick(id, event);
    }
    setContextMenuState({ x: event.clientX, y: event.clientY, targetId: id });
  }, [selectionState]);

  const closeContextMenu = useCallback(() => setContextMenuState(null), []);

  const handleMoveStart = useCallback((id: string, clientX: number, clientY: number) => {
    startMove(id, clientX, clientY);
  }, [startMove]);

  const handleResizeStart = useCallback((id: string, direction: ResizeDirection, clientX: number, clientY: number, width: number, height: number) => {
    startResize(id, direction, clientX, clientY, width, height);
  }, [startResize]);

  const selectionContextValue = useMemo(() => ({
    ...selectionState,
    handleContextMenu,
    onMoveStart: handleMoveStart,
    onResizeStart: handleResizeStart,
  }), [selectionState, handleContextMenu, handleMoveStart, handleResizeStart]);

  const scrollRef = useRef<HTMLDivElement>(null);
  const canvasWrapperRef = useRef<HTMLDivElement>(null);

  const { isDragOver, dropTargetId } = useCanvasDrop(canvasWrapperRef, zoom);

  useEffect(() => {
    if (!dropTargetId) {
      document.querySelectorAll('[data-drop-target]').forEach((el) => el.removeAttribute('data-drop-target'));
      return;
    }
    document.querySelectorAll('[data-drop-target]').forEach((el) => el.removeAttribute('data-drop-target'));
    const target = document.querySelector(`[data-schema-id="${dropTargetId}"]`);
    if (target) target.setAttribute('data-drop-target', 'true');
  }, [dropTargetId]);

  useEffect(() => {
    let rafId: number | null = null;
    const onMouseMove = () => {
      if (rafId) return;
      rafId = requestAnimationFrame(() => {
        rafId = null;
        if (selectionState.selectedIds.length === 1 && canvasWrapperRef.current) {
          const container = canvasWrapperRef.current.querySelector('[data-canvas-area="true"]')?.parentElement ?? canvasWrapperRef.current;
          const lines = computeAlignLines(selectionState.selectedIds[0], schema, container);
          setAlignLines((prev) => (alignLinesEqual(prev, lines) ? prev : lines));
        }
      });
    };
    const onMouseUp = () => setAlignLines([]);
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
    return () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [selectionState.selectedIds, schema]);

  const [scrollX, setScrollX] = useState(0);
  const [scrollY, setScrollY] = useState(0);
  const [canvasLeftOffset, setCanvasLeftOffset] = useState(CANVAS_MARGIN);

  const handleScroll = useCallback(() => {
    if (scrollRef.current) {
      setScrollX(scrollRef.current.scrollLeft);
      setScrollY(scrollRef.current.scrollTop);
    }
  }, []);

  useEffect(() => {
    const calculateOffset = () => {
      if (scrollRef.current) {
        const containerWidth = scrollRef.current.clientWidth;
        const scaledWidth = CANVAS_WIDTH * zoom;
        const offset = Math.max(CANVAS_MARGIN, (containerWidth - scaledWidth) / 2);
        setCanvasLeftOffset(offset);
      }
    };

    calculateOffset();
    window.addEventListener('resize', calculateOffset);
    return () => window.removeEventListener('resize', calculateOffset);
  }, [zoom]);

  const scaledWidth = CANVAS_WIDTH * zoom;
  const scaledHeight = CANVAS_HEIGHT * zoom;

  // 使用CSS变量获取主题色
  const primaryColor = 'var(--theme-primary)';

  // 全局点击：仅点击画布手机框外的区域（灰底滚动区等）取消选中。
  // 手机框内（data-canvas-area）不在这里清：根节点 selectable=false 不会 stopPropagation，
  // 拖放结束后的 click 也会冒泡到 document，否则会误清刚选中的节点。
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;

      if (
        target.closest('header') ||
        target.closest('[data-sidebar="true"]') ||
        target.closest('[data-right-panel="true"]') ||
        target.closest('[data-canvas-area="true"]')
      ) {
        return;
      }

      clearSelection();
    };

    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, [clearSelection]);

  return (
    <SelectionContext.Provider value={selectionContextValue}>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        overflow: 'hidden',
        background: 'linear-gradient(180deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.04) 100%)',
      }}>
        {/* 顶部工具栏 */}
        <header style={{
          height: 48,
          margin: '10px 12px 0',
          border: '1px solid var(--theme-border-soft)',
          background: 'rgba(255,255,255,0.56)',
          backdropFilter: 'blur(var(--theme-backdrop-blur))',
          borderRadius: 18,
          boxShadow: 'var(--theme-shadow-sm)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 14px',
          flexShrink: 0,
        }}>
          <span style={{ fontSize: 12, color: 'var(--theme-text-secondary)', fontWeight: 600, letterSpacing: 0.2 }}>
            画布: {CANVAS_WIDTH}x{CANVAS_HEIGHT}
          </span>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '4px 6px',
              borderRadius: 999,
              background: 'rgba(255,255,255,0.72)',
              border: '1px solid var(--theme-border-soft)',
            }}
          >
            <Button
              icon={<IconMinus />}
              size="small"
              theme="solid"
              type="tertiary"
              style={{
                color: primaryColor,
                backgroundColor: 'rgba(255,255,255,0.72)',
                borderRadius: 999,
                boxShadow: 'var(--theme-shadow-sm)',
              }}
              onClick={zoomOut}
            />
            <span style={{ fontSize: 12, color: 'var(--theme-text-primary)', fontWeight: 700, minWidth: 52, textAlign: 'center' }}>
              {formatZoomPercent(zoom)}
            </span>
            <Button
              icon={<IconPlus />}
              size="small"
              theme="solid"
              type="tertiary"
              style={{
                color: primaryColor,
                backgroundColor: 'rgba(255,255,255,0.72)',
                borderRadius: 999,
                boxShadow: 'var(--theme-shadow-sm)',
              }}
              onClick={zoomIn}
            />
            <Button
              icon={<IconRefresh />}
              size="small"
              theme="solid"
              type="tertiary"
              style={{
                color: primaryColor,
                backgroundColor: 'rgba(255,255,255,0.72)',
                borderRadius: 999,
                boxShadow: 'var(--theme-shadow-sm)',
              }}
              onClick={resetZoom}
            />
          </div>
        </header>

        {/* 主区域 */}
        <div style={{
          flex: 1,
          display: 'flex',
          overflow: 'hidden',
          position: 'relative',
        }}>
          {/* 左侧栏 */}
          <aside data-sidebar="true" style={{
            display: 'flex',
            flexDirection: 'column',
            flexShrink: 0,
            width: RULER_SIZE,
            marginTop: 10,
          }}>
            <div style={{
              height: RULER_SIZE,
              background: 'var(--theme-ruler-bg)',
              borderRight: '1px solid var(--theme-border)',
              borderBottom: '1px solid var(--theme-border)',
              flexShrink: 0,
              borderTopLeftRadius: 14,
            }} />
            <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
              <RulerY canvasHeight={CANVAS_HEIGHT} zoom={zoom} scrollY={scrollY - VERTICAL_OFFSET} />
            </div>
          </aside>

          {/* 中间画布区域 */}
          <div style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            marginTop: 10,
            marginRight: 12,
            marginBottom: 12,
          }}>
            {/* 标尺 */}
            <div style={{ flexShrink: 0, height: RULER_SIZE, overflow: 'hidden', borderTopRightRadius: 14 }}>
              <RulerX canvasWidth={CANVAS_WIDTH} zoom={zoom} scrollX={scrollX - canvasLeftOffset} />
            </div>

            {/* 画布滚动区域 - 灰色背景 */}
            <div
              ref={scrollRef}
              onScroll={handleScroll}
              style={{
                flex: 1,
                overflow: 'auto',
                background: 'radial-gradient(circle at top, rgba(255,255,255,0.38), transparent 24%), linear-gradient(180deg, rgba(235,241,251,0.96) 0%, rgba(226,234,248,0.78) 100%)',
                position: 'relative',
                borderBottomLeftRadius: 24,
                borderBottomRightRadius: 24,
                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.65)',
              }}
            >
              <div style={{
                position: 'relative',
                minWidth: `${canvasLeftOffset + scaledWidth + CANVAS_MARGIN}px`,
                minHeight: `${VERTICAL_OFFSET + scaledHeight + CANVAS_MARGIN}px`,
              }}>
                {/* 画布区域 - 标记为画布 */}
                <div
                  ref={canvasWrapperRef}
                  data-canvas-area="true"
                  style={{
                    position: 'absolute',
                    left: canvasLeftOffset,
                    top: VERTICAL_OFFSET,
                    width: scaledWidth,
                    height: scaledHeight,
                    filter: isDragOver ? 'drop-shadow(0 0 18px var(--theme-primary-light))' : 'none',
                  }}
                >
                  {/* 画布容器 */}
                  <div
                    style={{
                      width: scaledWidth,
                      height: scaledHeight,
                      background: 'linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(255,255,255,0.94) 100%)',
                      border: '1px solid var(--theme-border-soft)',
                      boxShadow: isDragOver
                        ? '0 0 0 3px var(--theme-primary-light), 0 18px 60px rgba(76, 91, 132, 0.20), inset 0 0 0 1px var(--theme-primary)'
                        : '0 22px 70px rgba(58, 72, 109, 0.16), inset 0 1px 0 rgba(255,255,255,0.82)',
                      borderRadius: 28,
                      position: 'relative',
                      overflow: 'visible',
                      transition: 'box-shadow 0.2s, filter 0.2s',
                    }}
                  >
                    {/* 网格层 */}
                    <div
                      style={{
                        position: 'absolute',
                        inset: 0,
                        zIndex: 0,
                        pointerEvents: 'none',
                        opacity: 0.42,
                        mixBlendMode: 'screen',
                        borderRadius: 28,
                      }}
                    >
                      <Grid width={scaledWidth} height={scaledHeight} gridSize={20} zoom={1} />
                    </div>

                    {/* Schema 内容层 */}
                    <div style={{ position: 'relative', zIndex: 1, width: '100%', height: '100%' }}>
                      <SelectableSchemaRenderer schema={schema} />
                    </div>

                    {/* 对齐辅助线 */}
                    <AlignmentGuides lines={alignLines} canvasWidth={scaledWidth} canvasHeight={scaledHeight} />
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
      <KeyboardShortcuts />
      {contextMenuState && (
        <ContextMenu
          x={contextMenuState.x}
          y={contextMenuState.y}
          targetId={contextMenuState.targetId}
          onClose={closeContextMenu}
        />
      )}
    </SelectionContext.Provider>
  );
};
