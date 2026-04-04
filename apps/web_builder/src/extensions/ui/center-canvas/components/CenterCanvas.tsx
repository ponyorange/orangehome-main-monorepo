import React, { useRef, useState, useCallback, useEffect, useLayoutEffect, useMemo } from 'react';
import { Button } from '@douyinfe/semi-ui';
import { IconMinus, IconPlus, IconRefresh } from '@douyinfe/semi-icons';
import { SelectableSchemaRenderer, SelectionContext } from '../../../../common/components/SchemaRenderer';
import { EditorChromeOverlayMount } from '../../../../common/components/SchemaRenderer/EditorChromeOverlayContext';
import { CanvasInteractionChrome } from '../../../../extensions/select-and-drag/components/CanvasInteractionChrome';
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
import { resolveHitSchemaTarget } from '../utils/resolveHitSchemaTarget';
const RULER_SIZE = 24;
const CANVAS_MARGIN = 200;

export const CenterCanvas: React.FC = () => {
  const { schema } = useSchemaStore();
  const schemaRef = useRef(schema);
  schemaRef.current = schema;
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

  const selectionRef = useRef(selectionState);
  selectionRef.current = selectionState;

  /** 与 document mousemove 节流共用，避免重复 handleMouseEnter */
  const lastPointerHoverIdRef = useRef<string | null>(null);

  /**
   * 画布区 hover 虚线：捕获阶段 mousemove + rAF，命中规则与 mousedown 一致（resolveHitSchemaTarget）。
   * 不依赖物料是否转发 onMouseEnter。
   */
  useEffect(() => {
    let rafId: number | null = null;
    let pending: MouseEvent | null = null;

    const flush = () => {
      rafId = null;
      const e = pending;
      pending = null;
      if (!e) return;
      const hit = resolveHitSchemaTarget(e.target, schemaRef.current);
      const nextId = hit.kind === 'node' ? hit.id : null;
      if (nextId === lastPointerHoverIdRef.current) return;
      lastPointerHoverIdRef.current = nextId;
      if (nextId) selectionRef.current.handleMouseEnter(nextId);
      else selectionRef.current.handleMouseLeave();
    };

    const onMove = (e: MouseEvent) => {
      pending = e;
      if (rafId == null) {
        rafId = requestAnimationFrame(flush);
      }
    };

    document.addEventListener('mousemove', onMove, true);
    return () => {
      document.removeEventListener('mousemove', onMove, true);
      if (rafId != null) cancelAnimationFrame(rafId);
    };
  }, []);

  /**
   * 画布区选中：document 捕获阶段根据「从内到外」第一个落在 schema 树上的 DOM id 触发选择。
   * 与拖动分发一致，不依赖物料是否把 onClick 转发到根 DOM（Button 会转发，Image/容器类常不会）。
   * 须注册在拖动监听之前，以便未选中时先由本逻辑写入 store，拖动侧仍读上一帧 selectionRef 从而不误开拖。
   */
  useEffect(() => {
    const onDocMouseDownSelect = (e: MouseEvent) => {
      if (e.button !== 0) return;
      const hit = resolveHitSchemaTarget(e.target, schemaRef.current);
      if (hit.kind === 'root') {
        selectionRef.current.clearSelection();
        return;
      }
      if (hit.kind === 'node') {
        selectionRef.current.handleClick(
          hit.id,
          e as unknown as React.MouseEvent<Element, MouseEvent>,
        );
      }
    };
    document.addEventListener('mousedown', onDocMouseDownSelect, true);
    return () => document.removeEventListener('mousedown', onDocMouseDownSelect, true);
  }, []);

  /** 画布区组件拖动：document 捕获阶段分发，不依赖物料根是否接收 onMouseDown */
  useEffect(() => {
    const onDocMouseDown = (e: MouseEvent) => {
      if (e.button !== 0) return;
      const hit = resolveHitSchemaTarget(e.target, schemaRef.current);
      if (hit.kind !== 'node') return;
      if (selectionRef.current.isSelected(hit.id)) {
        startMove(hit.id, e.clientX, e.clientY);
      }
    };
    document.addEventListener('mousedown', onDocMouseDown, true);
    return () => document.removeEventListener('mousedown', onDocMouseDown, true);
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
  const rulerContainerRef = useRef<HTMLDivElement>(null);

  const { isDragOver, dropTargetId } = useCanvasDrop(canvasWrapperRef, zoom);

  useEffect(() => {
    if (!dropTargetId) {
      document.querySelectorAll('[data-drop-target]').forEach((el) => el.removeAttribute('data-drop-target'));
      return;
    }
    document.querySelectorAll('[data-drop-target]').forEach((el) => el.removeAttribute('data-drop-target'));
    const root = canvasWrapperRef.current;
    if (!root) return;
    let target: Element | null = null;
    try {
      target = root.querySelector(`[id="${CSS.escape(dropTargetId)}"]`);
    } catch {
      target = null;
    }
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

  const handleScroll = useCallback(() => {
    if (scrollRef.current) {
      const newScrollLeft = scrollRef.current.scrollLeft;
      setScrollX(newScrollLeft);
      setScrollY(scrollRef.current.scrollTop);

      // 同步标尺容器的水平滚动
      if (rulerContainerRef.current) {
        rulerContainerRef.current.scrollLeft = newScrollLeft;
      }
    }
  }, []);

  // 画布居中逻辑：使用 margin auto 实现真正的居中，无论内容是否溢出
  useLayoutEffect(() => {
    const scrollEl = scrollRef.current;
    const contentEl = scrollContentRef.current;
    if (!scrollEl || !contentEl) return undefined;

    const apply = () => {
      // 更新滚动状态供标尺使用
      setScrollX(scrollEl.scrollLeft);
      setScrollY(scrollEl.scrollTop);
    };

    // 初始应用
    apply();

    // 监听滚动事件
    const handleScroll = () => {
      setScrollX(scrollEl.scrollLeft);
      setScrollY(scrollEl.scrollTop);
    };
    scrollEl.addEventListener('scroll', handleScroll);

    // 监听画布位置变化（ResizeObserver 观察内容区大小变化）
    const ro = new ResizeObserver(() => {
      apply();
    });
    ro.observe(contentEl);
    ro.observe(scrollEl);

    return () => {
      ro.disconnect();
      scrollEl.removeEventListener('scroll', handleScroll);
    };
  }, [zoom, layoutVisualW, layoutVisualH]);

  // 单独的 effect：窗口大小变化时强制重新居中画布
  useLayoutEffect(() => {
    const scrollEl = scrollRef.current;
    if (!scrollEl) return;

    const centerCanvas = () => {
      const canvas = canvasWrapperRef.current;
      if (!canvas) return;

      const cw = scrollEl.clientWidth;
      const ch = scrollEl.clientHeight;

      // 计算目标 scrollLeft/Top：让画布在滚动容器的可视区域中居中
      const targetScrollLeft = canvas.offsetLeft + layoutVisualW / 2 - cw / 2;
      const targetScrollTop = canvas.offsetTop + layoutVisualH / 2 - ch / 2;

      // 限制在有效滚动范围内
      const maxScrollLeft = Math.max(0, scrollEl.scrollWidth - scrollEl.clientWidth);
      const maxScrollTop = Math.max(0, scrollEl.scrollHeight - scrollEl.clientHeight);

      scrollEl.scrollLeft = Math.min(maxScrollLeft, Math.max(0, targetScrollLeft));
      scrollEl.scrollTop = Math.min(maxScrollTop, Math.max(0, targetScrollTop));
    };

    // 窗口大小变化时重新居中
    const handleResize = () => {
      // 使用 RAF 确保布局已完成
      requestAnimationFrame(centerCanvas);
    };

    // 初始居中
    centerCanvas();

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
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
      {/* 全局样式：拖拽目标容器高亮 */}
      <style>{`
        [data-drop-target="true"] {
          outline: 2px solid #1890ff !important;
          outline-offset: -2px;
          background-color: rgba(24, 144, 255, 0.08) !important;
          transition: outline 0.15s ease, background-color 0.15s ease;
        }
      `}</style>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        overflow: 'hidden',
        background: 'linear-gradient(180deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.04) 100%)',
      }}>
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
          }}>
            <div style={{
              height: RULER_SIZE,
              // background: 'var(--theme-ruler-bg)',
              // borderRight: '1px solid var(--theme-border)',
              // borderBottom: '1px solid var(--theme-border)',
              flexShrink: 0,
            }} />
            <div style={{ flex: 1, overflow: 'hidden', position: 'relative', marginTop: 20 }}>
              <RulerY
                canvasHeight={EDITOR_CANVAS_HEIGHT}
                zoom={zoom * EDITOR_VIEWPORT_SCALE}
                scrollY={scrollY}
              />
            </div>
          </aside>

          {/* 中间画布区域 */}
          <div style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            marginRight: 12,
            marginBottom: 12,
          }}>
            {/* 标尺 - 与下方滚动区域同步水平滚动 */}
            <div
              ref={rulerContainerRef}
              style={{
                flexShrink: 0,
                height: RULER_SIZE,
                overflowX: 'auto',
                overflowY: 'hidden',
                borderTopRightRadius: 14,
                position: 'relative',
                scrollbarWidth: 'none', // Firefox
                msOverflowStyle: 'none', // IE/Edge
              }}
            >
              {/* 隐藏滚动条样式 */}
              <style>{`
                div[ref="${rulerContainerRef}"]::-webkit-scrollbar {
                  display: none;
                }
              `}</style>
              {/* 标尺内部容器，与滚动内容宽度和结构一致 */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  boxSizing: 'border-box',
                  paddingLeft: CANVAS_MARGIN,
                  paddingRight: CANVAS_MARGIN,
                  minWidth: layoutVisualW + CANVAS_MARGIN * 2,
                  height: '100%',
                }}
              >
                <div style={{ width: layoutVisualW, marginLeft: 'auto', marginRight: 'auto', marginTop: 0, marginBottom: 0, height: '100%' }}>
                  <RulerX
                    canvasWidth={EDITOR_CANVAS_WIDTH}
                    zoom={zoom * EDITOR_VIEWPORT_SCALE}
                    scrollX={scrollX}
                  />
                </div>
              </div>
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
                  flexDirection: 'column',
                  boxSizing: 'border-box',
                  paddingTop: 0,
                  paddingBottom: CANVAS_MARGIN,
                  minWidth: layoutVisualW + CANVAS_MARGIN * 2,
                  minHeight: layoutVisualH + CANVAS_MARGIN,
                }}
              >
                {/* 画布区域：使用 margin auto 实现真正的居中，无论窗口大小 */}
                <div
                  ref={canvasWrapperRef}
                  data-canvas-area="true"
                  style={{
                    position: 'relative',
                    width: layoutVisualW,
                    height: layoutVisualH,
                    marginLeft: 'auto',
                    marginRight: 'auto',
                    marginTop: 20,
                    marginBottom: 0,
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

                      {/* Schema 内容层 + 编辑器装饰 Portal 挂载层 */}
                      <EditorChromeOverlayMount>
                        <SelectableSchemaRenderer schema={schema} />
                        <CanvasInteractionChrome />
                      </EditorChromeOverlayMount>

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

            {/* 悬浮缩放控制条 - 右下角 */}
            <div
              style={{
                position: 'absolute',
                bottom: 20,
                right: 20,
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '6px 10px',
                borderRadius: 999,
                background: 'rgba(255,255,255,0.88)',
                border: '1px solid var(--theme-border-soft)',
                boxShadow: 'var(--theme-shadow-sm)',
                zIndex: 100,
                backdropFilter: 'blur(8px)',
              }}
            >
              <Button
                icon={<IconMinus />}
                size="small"
                theme="solid"
                type="tertiary"
                style={{
                  color: 'var(--theme-primary)',
                  backgroundColor: 'rgba(255,255,255,0.72)',
                  borderRadius: 999,
                  boxShadow: 'var(--theme-shadow-sm)',
                }}
                onClick={zoomOut}
              />
              <span style={{ fontSize: 12, color: 'var(--theme-text-primary)', fontWeight: 700, minWidth: 48, textAlign: 'center' }}>
                {formatZoomPercent(zoom)}
              </span>
              <Button
                icon={<IconPlus />}
                size="small"
                theme="solid"
                type="tertiary"
                style={{
                  color: 'var(--theme-primary)',
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
                  color: 'var(--theme-primary)',
                  backgroundColor: 'rgba(255,255,255,0.72)',
                  borderRadius: 999,
                  boxShadow: 'var(--theme-shadow-sm)',
                }}
                onClick={resetZoom}
              />
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
