import type { ISchema } from '../../../types/base';

export interface DragData {
  type: 'add-component';
  componentType: string;
  componentName: string;
  defaultSchema: ISchema;
}

export interface OrangeDragOptions {
  threshold?: number;
  mirrorOffsetX?: number;
  mirrorOffsetY?: number;
}

export interface DragEvent {
  clientX: number;
  clientY: number;
  data: DragData;
}

export type DragStartCallback = (event: DragEvent) => void;
export type DragMoveCallback = (event: DragEvent) => void;
export type DragEndCallback = (event: DragEvent) => void;

export interface DragCallbacks {
  onDragStart?: DragStartCallback;
  onDrag?: DragMoveCallback;
  onDragEnd?: DragEndCallback;
}
