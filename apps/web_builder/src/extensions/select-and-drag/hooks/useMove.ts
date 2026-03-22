import { useRef, useCallback, useEffect } from 'react';
import { useSchemaStore } from '../../../core/store/schemaStore';
import { findById, getResolvedInlineStyle, updateInlineStyle } from '../../../common/base/schemaOperator';
import type { ISchema } from '../../../types/base';

interface MoveState {
  isMoving: boolean;
  startX: number;
  startY: number;
  originalMarginTop: number;
  originalMarginLeft: number;
  targetId: string;
}

function getStyleNum(schema: ISchema, prop: string): number {
  const style = getResolvedInlineStyle(schema);
  const val = style[prop];
  return typeof val === 'number' ? val : 0;
}

export function useMove(selectedIds: string[]) {
  const { schema, setSchema } = useSchemaStore();
  const stateRef = useRef<MoveState | null>(null);
  const schemaRef = useRef(schema);
  schemaRef.current = schema;

  const startMove = useCallback((id: string, clientX: number, clientY: number) => {
    const node = findById(schemaRef.current, id);
    if (!node) return;

    stateRef.current = {
      isMoving: false,
      startX: clientX,
      startY: clientY,
      originalMarginTop: getStyleNum(node, 'marginTop'),
      originalMarginLeft: getStyleNum(node, 'marginLeft'),
      targetId: id,
    };
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const state = stateRef.current;
      if (!state) return;

      const dx = e.clientX - state.startX;
      const dy = e.clientY - state.startY;

      if (!state.isMoving && Math.abs(dx) < 3 && Math.abs(dy) < 3) return;
      state.isMoving = true;

      const newMarginTop = state.originalMarginTop + dy;
      const newMarginLeft = state.originalMarginLeft + dx;

      const target = findById(schemaRef.current, state.targetId);
      if (!target) return;
      const updated = updateInlineStyle(schemaRef.current, state.targetId, {
        ...getResolvedInlineStyle(target),
        marginTop: newMarginTop,
        marginLeft: newMarginLeft,
      });
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
      const mt = typeof currentStyle.marginTop === 'number' ? currentStyle.marginTop : 0;
      const ml = typeof currentStyle.marginLeft === 'number' ? currentStyle.marginLeft : 0;

      let newMt = mt as number;
      let newMl = ml as number;
      if (direction === 'up') newMt -= amount;
      else if (direction === 'down') newMt += amount;
      else if (direction === 'left') newMl -= amount;
      else if (direction === 'right') newMl += amount;

      updated = updateInlineStyle(updated, id, {
        ...currentStyle,
        marginTop: newMt,
        marginLeft: newMl,
      });
    }
    setSchema(updated);
  }, [selectedIds, setSchema]);

  return { startMove, nudge, isMoving: () => stateRef.current?.isMoving ?? false };
}
