/**
 * H5Canvas - H5 画布插槽（Center 区域）
 * 模拟手机页面样式，支持拖拽添加组件
 */

import React, { useRef, useEffect, useMemo } from 'react';
import { useStore } from 'zustand';
import { useEditorStore } from '../../../core/EditorStoreContext';
import { useRegisterSlot } from '../../LayoutContext';
import { SchemaRenderer } from '../../../common/components/SchemaRenderer';
import { DEMO_STATIC_COMPONENTS } from '../../../demo/staticComponents';
import { OrangeDrag } from '../../../common/base/OrangeDrag';
import type { ISchema } from '../../../types/base';

function createAddNodeFromType(type: string, name: string, id: string): ISchema {
  return {
    id,
    name: name || type,
    type,
    props: {},
  };
}

export interface H5CanvasProps {
  /** 外部传入的添加用 OrangeDrag */
  addDrag: OrangeDrag | null;
}

function H5CanvasContent({ addDrag }: H5CanvasProps) {
  const store = useEditorStore();
  const schema = useStore(store, (s) => s.schema);
  const uniqueId2Module = useStore(store, (s) => s.config?.uniqueId2Module ?? {});
  const selectedNodeId = useStore(store, (s) => s.selectedNodeId);
  const hoveredNodeId = useStore(store, (s) => s.editor?.hoveredNodeId ?? null);
  const canvasRef = useRef<HTMLDivElement>(null);

  // 选中/悬停处理
  const handleSelectNode = (id: string | null) => {
    store.setState({ selectedNodeId: id });
    if (id) console.log('[H5Canvas] 选中组件 ID:', id);
  };
  const handleHoverNode = (id: string | null) => {
    store.setState((s) => ({
      editor: { ...s.editor, hoveredNodeId: id },
    }));
  };

  // 拖拽添加到画布
  useEffect(() => {
    if (!addDrag || !canvasRef.current || !schema) return;
    const el = canvasRef.current;

    addDrag.setDropTarget((x, y) => {
      const rect = el.getBoundingClientRect();
      if (x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom) {
        return { element: el, rect };
      }
      return null;
    });

    addDrag.onDragEnd((state, dropTarget) => {
      if (!dropTarget || !schema) return;
      const data = state.data as { type: string; name: string } | undefined;
      if (!data?.type) return;

      const rootId = schema.id;
      const id = `node_${data.type}_${Date.now()}`;
      const node = createAddNodeFromType(data.type, data.name || data.type, id);

      // 更新 schema（通过 store 的 schema，实际应由 SchemaService 处理）
      const newSchema = { ...schema };
      const addToNode = (n: ISchema): ISchema => {
        if (n.id === rootId) {
          return {
            ...n,
            children: [...(n.children || []), node],
          };
        }
        if (n.children) {
          return {
            ...n,
            children: n.children.map(addToNode),
          };
        }
        return n;
      };
      store.setState({ schema: addToNode(newSchema) });
      console.log('[H5Canvas] 添加组件:', data.type, id);
    });

    return () => {
      addDrag.setDropTarget(null);
    };
  }, [addDrag, schema, store]);

  // 移动拖拽（用于选中节点）
  const moveDrag = useMemo(
    () =>
      new OrangeDrag({
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
            alignItems: center;
            justifyContent: center;
            border-radius: 4px;
            pointer-events: none;
            z-index: 10000;
          `;
          mirror.textContent = '移动中';
          return mirror;
        },
      }),
    []
  );

  useEffect(() => {
    if (!schema) return;
    moveDrag.onDragEnd((state) => {
      const data = state.data as { nodeId: string } | undefined;
      if (!data?.nodeId) return;
      const dx = state.currentX - state.startX;
      const dy = state.currentY - state.startY;

      const updateNodePosition = (n: ISchema): ISchema => {
        if (n.id === data.nodeId) {
          const prevStyle = (n.props?.style as Record<string, unknown>) || {};
          const left = (Number(prevStyle.left) || 0) + dx;
          const top = (Number(prevStyle.top) || 0) + dy;
          return {
            ...n,
            props: {
              ...n.props,
              style: { ...prevStyle, position: 'absolute', left, top },
            },
          };
        }
        if (n.children) {
          return { ...n, children: n.children.map(updateNodePosition) };
        }
        return n;
      };

      store.setState({ schema: updateNodePosition({ ...schema }) });
    });
  }, [moveDrag, schema, store]);

  const handleStartMove = (nodeId: string, _el: HTMLElement, clientX: number, clientY: number) => {
    moveDrag.mousedown(document.body, clientX, clientY, { nodeId });
  };

  return (
    <div
      ref={canvasRef}
      style={{
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        backgroundImage: `
          linear-gradient(45deg, #e0e0e0 25%, transparent 25%),
          linear-gradient(-45deg, #e0e0e0 25%, transparent 25%),
          linear-gradient(45deg, transparent 75%, #e0e0e0 75%),
          linear-gradient(-45deg, transparent 75%, #e0e0e0 75%)
        `,
        backgroundSize: '20px 20px',
        backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px',
      }}
    >
      {/* 手机外框 */}
      <div
        style={{
          width: 375,
          minHeight: 667,
          background: '#fff',
          borderRadius: 24,
          boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* 状态栏模拟 */}
        <div
          style={{
            height: 24,
            background: '#000',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div
            style={{
              width: 120,
              height: 16,
              background: '#333',
              borderRadius: 8,
            }}
          />
        </div>

        {/* 页面内容区 */}
        <div
          style={{
            minHeight: 643,
            position: 'relative',
            padding: 16,
          }}
        >
          {!schema ? (
            <div
              style={{
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#999',
                fontSize: 14,
              }}
            >
              拖动组件到此处
            </div>
          ) : (
            <SchemaRenderer
              schema={schema}
              uniqueId2Module={uniqueId2Module}
              staticComponents={DEMO_STATIC_COMPONENTS}
              selectedNodeId={selectedNodeId}
              hoveredNodeId={hoveredNodeId}
              onSelectNode={handleSelectNode}
              onHoverNode={handleHoverNode}
              onStartMove={handleStartMove}
            />
          )}
        </div>
      </div>
    </div>
  );
}

/** H5Canvas 插槽注册器 */
export function useH5CanvasSlot(addDrag: OrangeDrag | null) {
  const register = useRegisterSlot();

  React.useEffect(() => {
    const H5CanvasSlot = () => <H5CanvasContent addDrag={addDrag} />;

    const unregister = register({
      id: 'h5-canvas',
      type: 'center',
      priority: 10,
      title: 'H5画布',
      component: H5CanvasSlot,
    });
    return unregister;
  }, [register, addDrag]);
}

export { H5CanvasContent };
export default H5CanvasContent;
