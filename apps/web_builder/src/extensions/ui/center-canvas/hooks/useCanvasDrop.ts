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
      const newSchema: ISchema = withDefaultFloatingLayerStyleForNewNode({
        ...data.defaultSchema,
        id: generateIdWithPrefix(idPrefix),
      });

      const bundleUrl = useMaterialBundleStore.getState().bundles[newSchema.type];
      remoteComponentDebug('useCanvasDrop: 拖入节点', {
        componentType: data.componentType,
        schemaType: newSchema.type,
        schemaId: newSchema.id,
        schemaName: newSchema.name,
        bundleUrlInStore: bundleUrl ?? '(无 — 将导致 SchemaNode 未知组件)',
      });

      const targetId = findDropTarget(clientX, clientY, schemaRef.current);
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
    [setSchema, onComponentAdded],
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
