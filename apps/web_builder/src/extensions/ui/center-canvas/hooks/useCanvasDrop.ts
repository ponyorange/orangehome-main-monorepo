import { useEffect, useState, useCallback, useRef } from 'react';
import { subscribeDrag } from '../../../../common/base/OrangeDrag';
import type { DragData } from '../../../../common/base/OrangeDrag/types';
import { useSchemaStore } from '../../../../core/store/schemaStore';
import { useSelectionStore } from '../../../../core/store/selectionStore';
import { addChild, findById } from '../../../../common/base/schemaOperator';
import { useMaterialBundleStore } from '../../../../core/store/materialBundleStore';
import { generateIdWithPrefix } from '../../../../utils/id';
import type { ISchema } from '../../../../types/base';
import { remoteComponentDebug } from '../../../../utils/remoteComponentDebug';
import { isBuiltInLayoutContainerType } from '../../../../common/base/schemaLayout';
import { withDefaultFloatingLayerStyleForNewNode } from '../../../../common/base/editorLayerStyle';

interface CanvasDropState {
  isDragOver: boolean;
  dropTargetId: string | null;
}

function isDropContainerNode(node: ISchema): boolean {
  if (isBuiltInLayoutContainerType(node.type)) return true;
  const caps = useMaterialBundleStore.getState().editorConfigs[node.type]?.editorCapabilities;
  return caps?.isContainer === true;
}

function findDropTarget(clientX: number, clientY: number, schema: ISchema): string {
  const els = document.elementsFromPoint(clientX, clientY);
  for (const el of els) {
    const schemaId = (el as HTMLElement).dataset?.schemaId;
    if (!schemaId) continue;
    const node = findById(schema, schemaId);
    if (!node) continue;
    if (isDropContainerNode(node)) return schemaId;
  }
  return schema.id;
}

export function useCanvasDrop(
  canvasRef: React.RefObject<HTMLElement | null>,
  _zoom: number,
  onComponentAdded?: (id: string) => void,
): CanvasDropState {
  const [isDragOver, setIsDragOver] = useState(false);
  const [dropTargetId, setDropTargetId] = useState<string | null>(null);
  const { schema, setSchema } = useSchemaStore();
  const schemaRef = useRef(schema);
  schemaRef.current = schema;

  const isInsideCanvas = useCallback(
    (clientX: number, clientY: number): boolean => {
      const el = canvasRef.current;
      if (!el) return false;
      const rect = el.getBoundingClientRect();
      return (
        clientX >= rect.left &&
        clientX <= rect.right &&
        clientY >= rect.top &&
        clientY <= rect.bottom
      );
    },
    [canvasRef],
  );

  const handleDrop = useCallback(
    (data: DragData, clientX: number, clientY: number) => {
      if (data.type !== 'add-component') return;

      const idPrefix = data.componentType.toLowerCase().replace(/\W/g, '') || 'node';

      // 找到目标容器并计算落点坐标
      const targetId = findDropTarget(clientX, clientY, schemaRef.current);
      const targetNode = findById(schemaRef.current, targetId);

      // 计算鼠标相对于目标容器的位置（逻辑坐标）
      let positionX = 0;
      let positionY = 0;

      if (targetNode) {
        // 获取目标容器的DOM元素
        const canvasEl = canvasRef.current;
        if (canvasEl) {
          // 查找目标容器对应的DOM元素
          let targetEl: Element | null = null;
          try {
            targetEl = canvasEl.querySelector(`[id="${CSS.escape(targetId)}"]`);
          } catch {
            targetEl = null;
          }

          if (targetEl) {
            const targetRect = targetEl.getBoundingClientRect();
            // 计算鼠标相对于目标容器左上角的偏移
            const relativeX = clientX - targetRect.left;
            const relativeY = clientY - targetRect.top;
            // 转换视觉坐标到逻辑坐标（考虑画布缩放）
            positionX = relativeX / _zoom;
            positionY = relativeY / _zoom;
          }
        }
      }

      // 创建新组件，设置 style.top/left 而非 position.x/y
      const newSchemaBase: ISchema = {
        ...data.defaultSchema,
        id: generateIdWithPrefix(idPrefix),
      };
      // 先应用默认浮动样式，然后覆盖top/left
      const withDefaults = withDefaultFloatingLayerStyleForNewNode(newSchemaBase);
      const newSchema: ISchema = {
        ...withDefaults,
        style: {
          ...withDefaults.style,
          top: Math.round(positionY),
          left: Math.round(positionX),
        },
      };

      const bundleUrl = useMaterialBundleStore.getState().bundles[newSchema.type];
      remoteComponentDebug('useCanvasDrop: 拖入节点', {
        componentType: data.componentType,
        schemaType: newSchema.type,
        schemaId: newSchema.id,
        schemaName: newSchema.name,
        bundleUrlInStore: bundleUrl ?? '(无 — 将导致 SchemaNode 未知组件)',
        dropPosition: { x: positionX, y: positionY },
        targetContainer: targetId,
      });

      const updated = addChild(schemaRef.current, targetId, newSchema);
      setSchema(updated);
      const addedId = newSchema.id;
      useSelectionStore.getState().setSelectedIds([addedId]);
      // 提交后再写一次，避免极端情况下首帧订阅未跟上
      requestAnimationFrame(() => {
        useSelectionStore.getState().setSelectedIds([addedId]);
      });
      onComponentAdded?.(addedId);
    },
    [setSchema, onComponentAdded, _zoom, canvasRef],
  );

  useEffect(() => {
    const unsub = subscribeDrag((event) => {
      if (event.phase === 'move') {
        const inside = isInsideCanvas(event.clientX, event.clientY);
        setIsDragOver(inside);
        if (inside) {
          const targetId = findDropTarget(event.clientX, event.clientY, schemaRef.current);
          setDropTargetId(targetId !== schemaRef.current.id ? targetId : null);
        } else {
          setDropTargetId(null);
        }
      } else if (event.phase === 'end') {
        setIsDragOver(false);
        setDropTargetId(null);
        if (isInsideCanvas(event.clientX, event.clientY)) {
          handleDrop(event.data, event.clientX, event.clientY);
        }
      } else if (event.phase === 'start') {
        setIsDragOver(false);
        setDropTargetId(null);
      }
    });
    return unsub;
  }, [isInsideCanvas, handleDrop]);

  return { isDragOver, dropTargetId };
}
