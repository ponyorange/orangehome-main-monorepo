import type { ISchema } from '../../types/base';

export interface HistoryState {
  snapshots: ISchema[];
  currentIndex: number;
  maxSize: number;
}

export interface Command<T = ISchema> {
  execute: () => T;
  undo: () => T | null;
  redo: () => T | null;
}
