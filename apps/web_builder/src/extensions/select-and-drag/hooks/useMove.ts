import { useRef, useCallback, useEffect } from 'react';
import { useSchemaStore } from '../../../core/store/schemaStore';
import { findById, getResolvedInlineStyle, updateInlineStyle } from '../../../common/base/schemaOperator';
import { isStyleLayerFloating, nudgeInlinePosition } from '../../../common/base/editorLayerStyle';
import type { ISchema } from '../../../types/base';

interface MoveState {
  isMoving: boolean;
  startX: number;
  startY: number;
  floating: boolean;
  originalTop: number;
  originalLeft: number;
  originalMarginTop: number;
  originalMarginLeft: number;
  targetId: string;
}

function getStyleNum(schema: ISchema, prop: string): number {
  const style = getResolvedInlineStyle(schema);
  const val = style[prop];
  return typeof val === 'number' ? val : 0;
}

/** canvasLayoutScale = zoom * EDITOR_VIEWPORT_SCALE：client 像素位移 → schema 逻辑像素 */
export function useMove(selectedIds: string[], canvasLayoutScale: number) {
  const { schema, setSchema } = useSchemaStore();
  const stateRef = useRef<MoveState | null>(null);
  const schemaRef = useRef(schema);
  schemaRef.current = schema;
  const scaleRef = useRef(canvasLayoutScale);
  scaleRef.current = canvasLayoutScale;

  const startMove = useCallback((id: string, clientX: number, clientY: number) => {
    const node = findById(schemaRef.current, id);
    if (!node) return;

    const st = getResolvedInlineStyle(node);
    const floating = isStyleLayerFloating(st);

    stateRef.current = {
      isMoving: false,
      startX: clientX,
      startY: clientY,
      floating,
      originalTop: getStyleNum(node, 'top'),
      originalLeft: getStyleNum(node, 'left'),
      originalMarginTop: getStyleNum(node, 'marginTop'),
      originalMarginLeft: getStyleNum(node, 'marginLeft'),
      targetId: id,
    };
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const state = stateRef.current;
      if (!state) return;

      const s = scaleRef.current || 1;
      const dxs = e.clientX - state.startX;
      const dys = e.clientY - state.startY;
      if (!state.isMoving && Math.abs(dxs) < 3 && Math.abs(dys) < 3) return;
      state.isMoving = true;
      const dx = dxs / s;
      const dy = dys / s;

      const target = findById(schemaRef.current, state.targetId);
      if (!target) return;
      const base = getResolvedInlineStyle(target);
      const nextStyle = state.floating
        ? {
            ...base,
            top: state.originalTop + dy,
            left: state.originalLeft + dx,
          }
        : {
            ...base,
            marginTop: state.originalMarginTop + dy,
            marginLeft: state.originalMarginLeft + dx,
          };
      const updated = updateInlineStyle(schemaRef.current, state.targetId, nextStyle);
      setSchema(updated);
    };

    const handleMouseUp = () => {
      stateRef.current = null;
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [setSchema]);

  const nudge = useCallback((direction: 'up' | 'down' | 'left' | 'right', amount: number) => {
    if (selectedIds.length === 0) return;
    let updated = schemaRef.current;
    for (const id of selectedIds) {
      const node = findById(updated, id);
      if (!node) continue;
      const currentStyle = getResolvedInlineStyle(node);
      updated = updateInlineStyle(updated, id, nudgeInlinePosition(currentStyle, direction, amount));
    }
    setSchema(updated);
  }, [selectedIds, setSchema]);

  return { startMove, nudge, isMoving: () => stateRef.current?.isMoving ?? false };
}
