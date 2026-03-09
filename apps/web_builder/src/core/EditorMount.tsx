import React, { useRef, useEffect, useMemo, useCallback } from 'react';
import { useStore } from 'zustand';
import { EditorStoreProvider, useEditorStore } from './EditorStoreContext';
import { CanvasService } from '../extensions/canvas';
import { SchemaService } from '../extensions/schema';
import { SelectAndDragService } from '../extensions/select-and-drag';
import { SchemaRenderer } from '../common/components/SchemaRenderer';
import { ComponentPanel } from '../components/ComponentPanel';
import { OrangeDrag } from '../common/base/OrangeDrag';
import { DEMO_STATIC_COMPONENTS } from '../demo/staticComponents';
import type { ISchema } from '../types/base';
import type { Container } from 'inversify';
import type { IStoreService } from '../extensions/store';

interface EditorMountProps {
  container: Container;
  storeService: IStoreService;
}

/** 画布内容：Schema 渲染或空状态 + 选中/悬停 + 拖放 */
const EMPTY_UNIQUE_ID_2_MODULE: Record<string, string> = {};

function createAddNodeFromType(type: string, name: string, id: string): ISchema {
  return {
    id,
    name: name || type,
    type,
    props: {},
  };
}

function CanvasContent({
  container,
  staticComponents,
  addDrag,
}: {
  container: Container;
  staticComponents: Record<string, React.ComponentType<Record<string, unknown>>>;
  addDrag: OrangeDrag | null;
}) {
  const store = useEditorStore();
  const schema = useStore(store, (s) => s.schema);
  const uniqueId2Module = useStore(
    store,
    (s) => s.config?.uniqueId2Module ?? EMPTY_UNIQUE_ID_2_MODULE
  );
  const selectedNodeId = useStore(store, (s) => s.selectedNodeId);
  const hoveredNodeId = useStore(store, (s) => s.editor?.hoveredNodeId ?? null);
  const canvasRef = useRef<HTMLDivElement>(null);

  const selectAndDrag = useMemo(() => {
    try {
      return container.get(SelectAndDragService);
    } catch {
      return null;
    }
  }, [container]);

  const schemaService = useMemo(() => {
    try {
      return container.get(SchemaService);
    } catch {
      return null;
    }
  }, [container]);

  useEffect(() => {
    const canvasService = container.get<{
      setCanvasElement: (el: HTMLDivElement | null) => void;
    }>(CanvasService);
    canvasService.setCanvasElement(canvasRef.current);
    return () => {
      canvasService.setCanvasElement(null);
    };
  }, [container]);

  useEffect(() => {
    if (!addDrag || !canvasRef.current || !schemaService) return;
    const el = canvasRef.current;
    addDrag.setDropTarget((x, y) => {
      if (!el) return null;
      const rect = el.getBoundingClientRect();
      if (x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom) {
        return { element: el, rect };
      }
      return null;
    });
    const onEnd = (
      _state: { data: unknown },
      dropTarget: { element: HTMLElement; rect: DOMRect } | null
    ) => {
      if (!dropTarget || !schemaService || !schema) return;
      const data = _state.data as { type: string; name: string } | undefined;
      if (!data?.type) return;
      const rootId = schema.id;
      const id = `node_${data.type}_${Date.now()}`;
      const node = createAddNodeFromType(data.type, data.name || data.type, id);
      schemaService.addNode(rootId, node);
    };
    addDrag.onDragEnd(onEnd);
    return () => {
      addDrag.setDropTarget(null);
    };
  }, [addDrag, schemaService, schema]);

  const onSelectNode = (id: string | null) => {
    selectAndDrag?.emitSelect(id);
    if (id) console.log('[Select] 选中组件 ID:', id);
  };
  const onHoverNode = (id: string | null) => selectAndDrag?.emitHover(id);

  const moveDrag = useMemo(() => {
    return new OrangeDrag({
      distanceThreshold: 4,
      createMirror() {
        const mirror = document.createElement('div');
        mirror.style.cssText = `
          position: fixed;
          width: 60px;
          height: 24px;
          background: rgba(255,107,0,0.7);
          color: #fff;
          font-size: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 4px;
          pointer-events: none;
          z-index: 10000;
        `;
        mirror.textContent = '移动中';
        return mirror;
      },
    });
  }, []);
  useEffect(() => {
    if (!schemaService || !moveDrag) return;
    moveDrag.onDragEnd((state, _dropTarget) => {
      const data = state.data as { nodeId: string } | undefined;
      if (!data?.nodeId) return;
      const dx = state.currentX - state.startX;
      const dy = state.currentY - state.startY;
      const node = schemaService.getNode(data.nodeId);
      if (!node) return;
      const prevStyle = (node.props?.style as Record<string, unknown>) || {};
      const left = (Number((prevStyle.left as number) ?? 0) || 0) + dx;
      const top = (Number((prevStyle.top as number) ?? 0) || 0) + dy;
      schemaService.updateNode(data.nodeId, {
        style: { ...prevStyle, position: 'absolute', left, top },
      });
    });
  }, [schemaService, moveDrag]);

  const onStartMove = useCallback(
    (nodeId: string, el: HTMLElement, clientX: number, clientY: number) => {
      moveDrag.mousedown(el, clientX, clientY, { nodeId });
    },
    [moveDrag]
  );

  const isEmpty = !schema;

  return (
    <div
      ref={canvasRef}
      className="orange-editor-canvas"
      data-canvas="placeholder"
    >
      {isEmpty ? (
        <div className="orange-editor-canvas-empty">
          拖动组件到此处
        </div>
      ) : (
        <div className="orange-editor-canvas-content">
          <SchemaRenderer
            schema={schema}
            uniqueId2Module={uniqueId2Module}
            staticComponents={staticComponents}
            selectedNodeId={selectedNodeId}
            hoveredNodeId={hoveredNodeId}
            onSelectNode={onSelectNode}
            onHoverNode={onHoverNode}
            onStartMove={onStartMove}
          />
        </div>
      )}
    </div>
  );
}

export function EditorMount({ container, storeService }: EditorMountProps) {
  const store = storeService.getStore();

  const addDrag = useMemo(
    () =>
      new OrangeDrag({
        distanceThreshold: 4,
        createMirror(el) {
          const rect = el.getBoundingClientRect();
          const mirror = document.createElement('div');
          mirror.className = 'orange-drag-mirror';
          mirror.textContent = (el.getAttribute('data-drag-label') as string) || '';
          mirror.style.cssText = `
            position: fixed;
            left: ${rect.left}px;
            top: ${rect.top}px;
            min-width: 60px;
            padding: 6px 12px;
            background: #ff6b00;
            color: #fff;
            border-radius: 4px;
            pointer-events: none;
            z-index: 10000;
            font-size: 12px;
            box-shadow: 0 2px 8px rgba(255,107,0,0.4);
          `;
          return mirror;
        },
      }),
    []
  );

  return (
    <EditorStoreProvider store={store}>
      <div className="orange-editor-container" data-editor="orange">
        <div className="orange-editor-main">
          <aside className="orange-editor-sidebar">
            <ComponentPanel addDrag={addDrag} />
          </aside>
          <CanvasContent
            container={container}
            staticComponents={DEMO_STATIC_COMPONENTS}
            addDrag={addDrag}
          />
        </div>
      </div>
    </EditorStoreProvider>
  );
}
