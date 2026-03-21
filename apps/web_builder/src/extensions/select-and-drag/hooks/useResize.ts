import { useRef, useCallback, useEffect } from 'react';
import { useSchemaStore } from '../../../core/store/schemaStore';
import { findById, updateProps } from '../../../common/base/schemaOperator';
import type { ISchema } from '../../../types/base';

export type ResizeDirection = 'n' | 's' | 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw';

interface ResizeState {
  isResizing: boolean;
  direction: ResizeDirection;
  startX: number;
  startY: number;
  originalWidth: number;
  originalHeight: number;
  originalMarginTop: number;
  originalMarginLeft: number;
  targetId: string;
  shiftKey: boolean;
  aspectRatio: number;
}

function getStyleNum(schema: ISchema, prop: string): number {
  const style = schema.props?.style as Record<string, unknown> | undefined;
  if (!style) return 0;
  const val = style[prop];
  return typeof val === 'number' ? val : 0;
}

export function useResize() {
  const { schema, setSchema } = useSchemaStore();
  const stateRef = useRef<ResizeState | null>(null);
  const schemaRef = useRef(schema);
  schemaRef.current = schema;

  const startResize = useCallback((
    id: string,
    direction: ResizeDirection,
    clientX: number,
    clientY: number,
    currentWidth: number,
    currentHeight: number,
  ) => {
    const node = findById(schemaRef.current, id);
    if (!node) return;

    stateRef.current = {
      isResizing: false,
      direction,
      startX: clientX,
      startY: clientY,
      originalWidth: currentWidth,
      originalHeight: currentHeight,
      originalMarginTop: getStyleNum(node, 'marginTop'),
      originalMarginLeft: getStyleNum(node, 'marginLeft'),
      targetId: id,
      shiftKey: false,
      aspectRatio: currentWidth / (currentHeight || 1),
    };
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const state = stateRef.current;
      if (!state) return;

      state.isResizing = true;
      state.shiftKey = e.shiftKey;

      const dx = e.clientX - state.startX;
      const dy = e.clientY - state.startY;
      const dir = state.direction;

      let newWidth = state.originalWidth;
      let newHeight = state.originalHeight;
      let newMarginTop = state.originalMarginTop;
      let newMarginLeft = state.originalMarginLeft;

      if (dir.includes('e')) newWidth = state.originalWidth + dx;
      if (dir.includes('w')) {
        newWidth = state.originalWidth - dx;
        newMarginLeft = state.originalMarginLeft + dx;
      }
      if (dir.includes('s')) newHeight = state.originalHeight + dy;
      if (dir.includes('n')) {
        newHeight = state.originalHeight - dy;
        newMarginTop = state.originalMarginTop + dy;
      }

      if (state.shiftKey && state.aspectRatio > 0) {
        if (dir === 'e' || dir === 'w') {
          newHeight = newWidth / state.aspectRatio;
        } else if (dir === 'n' || dir === 's') {
          newWidth = newHeight * state.aspectRatio;
        } else {
          newHeight = newWidth / state.aspectRatio;
        }
      }

      newWidth = Math.max(20, newWidth);
      newHeight = Math.max(20, newHeight);

      const node = findById(schemaRef.current, state.targetId);
      if (!node) return;

      const currentStyle = (node.props?.style as Record<string, unknown>) ?? {};
      const updated = updateProps(schemaRef.current, state.targetId, {
        style: {
          ...currentStyle,
          width: Math.round(newWidth),
          height: Math.round(newHeight),
          marginTop: Math.round(newMarginTop),
          marginLeft: Math.round(newMarginLeft),
        },
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

  return { startResize, isResizing: () => stateRef.current?.isResizing ?? false };
}
