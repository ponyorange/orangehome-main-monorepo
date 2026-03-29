import React, { useRef, useState, useCallback, useEffect, useLayoutEffect, useMemo } from 'react';
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
import {
  EDITOR_CANVAS_WIDTH,
  EDITOR_CANVAS_HEIGHT,
  EDITOR_VIEWPORT_SCALE,
} from '../../../../constants/editorCanvasArtboard';
const RULER_SIZE = 24;
const CANVAS_MARGIN = 200;
const VERTICAL_OFFSET = 50;

export const CenterCanvas: React.FC = () => {
  const { schema } = useSchemaStore();
  const { zoom, zoomIn, zoomOut, resetZoom } = useZoom();

  const selectionState = useSimpleSelection();
  const { clearSelection } = selectionState;

  const layoutLogicalW = EDITOR_CANVAS_WIDTH * zoom;
  const layoutLogicalH = EDITOR_CANVAS_HEIGHT * zoom;
  const layoutVisualW = layoutLogicalW * EDITOR_VIEWPORT_SCALE;
  const layoutVisualH = layoutLogicalH * EDITOR_VIEWPORT_SCALE;
  const canvasLayoutScale = zoom * EDITOR_VIEWPORT_SCALE;

  const { startMove } = useMove(selectionState.selectedIds, canvasLayoutScale);
  const { startResize } = useResize(canvasLayoutScale);
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

  const selectionContextValue = useMemo(
    () => ({
      ...selectionState,
      handleContextMenu,
      onMoveStart: handleMoveStart,
      onResizeStart: handleResizeStart,
      /** 与画布内层 transform: scale(EDITOR_VIEWPORT_SCALE) 配套，选中框用逻辑像素 */
      selectionRectVisualToLogical: 1 / EDITOR_VIEWPORT_SCALE,
    }),
    [selectionState, handleContextMenu, handleMoveStart, handleResizeStart],
  );

  const scrollRef = useRef<HTMLDivElement>(null);
  /** 滚动区内 flex 行：用脚本写入 minWidth，避免 max(100%, px) 在嵌套 flex 下百分比基线异常 */
  const scrollContentRef = useRef<HTMLDivElement>(null);
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
          const container = canvasWrapperRef.current;
          const lines = computeAlignLines(
            selectionState.selectedIds[0],
            schema,
            container,
            1 / EDITOR_VIEWPORT_SCALE,
          );
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
  /** 画布左缘在滚动内容中的像素位置，供横向标尺与 scrollLeft 对齐；由布局测量得到 */
  const [canvasLeftOffset, setCanvasLeftOffset] = useState(0);

  const handleScroll = useCallback(() => {
    if (scrollRef.current) {
      setScrollX(scrollRef.current.scrollLeft);
      setScrollY(scrollRef.current.scrollTop);
    }
  }, []);

  // flex + justifyContent:center 居中；内容区宽度显式设为 max(视口宽, 画布宽)，不依赖 CSS max(100%,px) 的百分比解析。
  // canvasLeftOffset：画布相对滚动容器的 offsetLeft，供 RulerX。
  useLayoutEffect(() => {
    const scrollEl = scrollRef.current;
    const contentEl = scrollContentRef.current;
    if (!scrollEl || !contentEl) return undefined;

    const apply = () => {
      const cw = scrollEl.clientWidth;
      contentEl.style.minWidth = `${Math.max(cw, layoutVisualW)}px`;
      const canvas = canvasWrapperRef.current;
      if (!canvas) return;
      const left = canvas.offsetLeft;
      setCanvasLeftOffset(left);
      // 重排后画布在文档中的水平位置会变，若保留旧的 scrollLeft，视口会切到错误片段，
      // 表现为 SelectableContainer/手机框偏在一侧；刷新后 scrollLeft=0 故看起来「只有刷新才居中」。
      const targetSl = left + layoutVisualW / 2 - cw / 2;
      const maxSl = Math.max(0, scrollEl.scrollWidth - scrollEl.clientWidth);
      scrollEl.scrollLeft = Math.min(maxSl, Math.max(0, targetSl));
      setScrollX(scrollEl.scrollLeft);
    };

    let rafId: number | null = null;
    const schedule = () => {
      if (rafId != null) return;
      rafId = requestAnimationFrame(() => {
        rafId = null;
        apply();
      });
    };

    apply();

    const ro = new ResizeObserver(() => {
      schedule();
    });
    ro.observe(scrollEl);
    window.addEventListener('resize', schedule);

    return () => {
      ro.disconnect();
      window.removeEventListener('resize', schedule);
      if (rafId != null) cancelAnimationFrame(rafId);
      contentEl.style.minWidth = '';
    };
  }, [zoom, layoutVisualW, layoutVisualH]);

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
            画布: {EDITOR_CANVAS_WIDTH}x{EDITOR_CANVAS_HEIGHT}
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
            }} />
            <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
              <RulerY
                canvasHeight={EDITOR_CANVAS_HEIGHT}
                zoom={zoom * EDITOR_VIEWPORT_SCALE}
                scrollY={scrollY - VERTICAL_OFFSET}
              />
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
              <RulerX
                canvasWidth={EDITOR_CANVAS_WIDTH}
                zoom={zoom * EDITOR_VIEWPORT_SCALE}
                scrollX={scrollX - canvasLeftOffset}
              />
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
              <div
                ref={scrollContentRef}
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'flex-start',
                  boxSizing: 'border-box',
                  paddingTop: VERTICAL_OFFSET,
                  paddingBottom: CANVAS_MARGIN,
                  minHeight: VERTICAL_OFFSET + layoutVisualH + CANVAS_MARGIN,
                }}
              >
                {/* 画布区域：外层占位为视觉尺寸，内层逻辑尺寸 + scale 保持 schema 按 750 幅面排版 */}
                <div
                  ref={canvasWrapperRef}
                  data-canvas-area="true"
                  style={{
                    position: 'relative',
                    width: layoutVisualW,
                    height: layoutVisualH,
                    flexShrink: 0,
                    filter: isDragOver ? 'drop-shadow(0 0 18px var(--theme-primary-light))' : 'none',
                  }}
                >
                  <div
                    style={{
                      position: 'absolute',
                      left: 0,
                      top: 0,
                      width: layoutLogicalW,
                      height: layoutLogicalH,
                      transform: `scale(${EDITOR_VIEWPORT_SCALE})`,
                      transformOrigin: 'top left',
                    }}
                  >
                    <div
                      style={{
                        width: layoutLogicalW,
                        height: layoutLogicalH,
                        background: 'linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(255,255,255,0.94) 100%)',
                        boxShadow: isDragOver
                          ? '0 0 0 3px var(--theme-primary-light), 0 18px 60px rgba(76, 91, 132, 0.20), inset 0 0 0 1px var(--theme-primary)'
                          : '0 22px 70px rgba(58, 72, 109, 0.16), inset 0 1px 0 rgba(255,255,255,0.82)',
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
                        }}
                      >
                        <Grid width={layoutLogicalW} height={layoutLogicalH} gridSize={20} zoom={1} />
                      </div>

                      {/* Schema 内容层 */}
                      <div style={{ position: 'relative', zIndex: 1, width: '100%', height: '100%' }}>
                        <SelectableSchemaRenderer schema={schema} />
                      </div>

                      {/* 对齐辅助线 */}
                      <AlignmentGuides
                        lines={alignLines}
                        canvasWidth={layoutLogicalW}
                        canvasHeight={layoutLogicalH}
                      />
                    </div>
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
