import React, { useCallback, useLayoutEffect, useState, useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';
import { useSelectionContext } from '../../../common/components/SchemaRenderer/SelectableSchemaRenderer';
import { useEditorChromeOverlay } from '../../../common/components/SchemaRenderer/EditorChromeOverlayContext';
import { SelectionBox } from './SelectionBox';
import type { ResizeDirection } from '../hooks/useResize';
import { canvasSchemaHostRegistry } from '../../../common/components/SchemaRenderer/CanvasSchemaHostRegistry';

function measureChromeRect(
  host: HTMLElement,
  overlay: HTMLElement,
  v2l: number,
): { x: number; y: number; width: number; height: number } {
  const o = overlay.getBoundingClientRect();
  const h = host.getBoundingClientRect();
  return {
    x: (h.left - o.left) * v2l,
    y: (h.top - o.top) * v2l,
    width: h.width * v2l,
    height: h.height * v2l,
  };
}

/**
 * 画布编辑器装饰：根据 HostRegistry 中的真实 DOM 测量后，用 Portal 挂到覆盖层。
 * 与 CenterCanvas 的 document 级拖动分发配合，不依赖物料根是否接收 onMouseDown。
 */
export const CanvasInteractionChrome: React.FC = () => {
  const {
    selectedIds,
    hoverId,
    isSelected,
    onResizeStart,
    selectionRectVisualToLogical = 1,
  } = useSelectionContext();
  const { overlayElement } = useEditorChromeOverlay();

  const registryVersion = useSyncExternalStore(
    canvasSchemaHostRegistry.subscribe,
    canvasSchemaHostRegistry.getSnapshot,
    canvasSchemaHostRegistry.getSnapshot,
  );

  const [, setLayoutTick] = useState(0);
  const bumpLayout = useCallback(() => setLayoutTick((n) => n + 1), []);

  useLayoutEffect(() => {
    if (!overlayElement) return undefined;
    const ro = new ResizeObserver(() => bumpLayout());
    ro.observe(overlayElement);
    const ids = new Set<string>([...selectedIds, ...(hoverId ? [hoverId] : [])]);
    ids.forEach((id) => {
      const el = canvasSchemaHostRegistry.get(id);
      if (el) ro.observe(el);
    });
    const onScroll = () => bumpLayout();
    window.addEventListener('scroll', onScroll, true);
    return () => {
      ro.disconnect();
      window.removeEventListener('scroll', onScroll, true);
    };
  }, [overlayElement, selectedIds, hoverId, registryVersion, bumpLayout]);

  const v2l = selectionRectVisualToLogical;

  const handleResizeStart = useCallback(
    (id: string, direction: ResizeDirection, e: React.MouseEvent, box: { width: number; height: number }) => {
      e.stopPropagation();
      onResizeStart?.(id, direction, e.clientX, e.clientY, box.width, box.height);
    },
    [onResizeStart],
  );

  if (!overlayElement) {
    return null;
  }

  const portals: React.ReactNode[] = [];

  const pushHover = (id: string) => {
    const host = canvasSchemaHostRegistry.get(id);
    if (!host) return;
    const box = measureChromeRect(host, overlayElement, v2l);
    if (box.width <= 0 || box.height <= 0) return;
    portals.push(
      createPortal(
        <div
          key={`hover-${id}`}
          style={{
            position: 'absolute',
            left: box.x - 1,
            top: box.y - 1,
            width: box.width + 2,
            height: box.height + 2,
            border: '1px dashed var(--theme-primary)',
            pointerEvents: 'none',
            zIndex: 950,
            boxSizing: 'border-box',
          }}
        />,
        overlayElement,
      ),
    );
  };

  const pushSelection = (id: string) => {
    const host = canvasSchemaHostRegistry.get(id);
    if (!host) return;
    const box = measureChromeRect(host, overlayElement, v2l);
    portals.push(
      createPortal(
        <SelectionBox
          key={`sel-${id}`}
          x={box.x}
          y={box.y}
          width={box.width || 100}
          height={box.height || 50}
          componentId={id}
          onResizeStart={(dir, e) => handleResizeStart(id, dir, e, { width: box.width || 100, height: box.height || 50 })}
          chromeVisualScale={v2l}
        />,
        overlayElement,
      ),
    );
  };

  if (hoverId && !isSelected(hoverId)) {
    pushHover(hoverId);
  }

  for (const id of selectedIds) {
    pushSelection(id);
  }

  return <>{portals}</>;
};
