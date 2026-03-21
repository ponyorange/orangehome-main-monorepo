import type { ISchema } from '../../../types/base';
import type { HistoryState } from '../types';

function cloneSchema<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function isSameSchema(a: ISchema, b: ISchema): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

export class HistoryService {
  private state: HistoryState;

  constructor(maxSize = 50) {
    this.state = {
      snapshots: [],
      currentIndex: -1,
      maxSize,
    };
  }

  init(initialSchema: ISchema): void {
    this.state = {
      ...this.state,
      snapshots: [cloneSchema(initialSchema)],
      currentIndex: 0,
    };
  }

  record(schema: ISchema): void {
    if (this.state.currentIndex === -1) {
      this.init(schema);
      return;
    }

    const current = this.state.snapshots[this.state.currentIndex];
    if (current && isSameSchema(current, schema)) {
      return;
    }

    const nextSnapshots = this.state.snapshots
      .slice(0, this.state.currentIndex + 1)
      .concat(cloneSchema(schema));

    if (nextSnapshots.length > this.state.maxSize) {
      nextSnapshots.shift();
    }

    this.state = {
      ...this.state,
      snapshots: nextSnapshots,
      currentIndex: nextSnapshots.length - 1,
    };
  }

  undo(): ISchema | null {
    if (!this.canUndo()) {
      return null;
    }

    this.state = {
      ...this.state,
      currentIndex: this.state.currentIndex - 1,
    };

    return cloneSchema(this.state.snapshots[this.state.currentIndex]);
  }

  redo(): ISchema | null {
    if (!this.canRedo()) {
      return null;
    }

    this.state = {
      ...this.state,
      currentIndex: this.state.currentIndex + 1,
    };

    return cloneSchema(this.state.snapshots[this.state.currentIndex]);
  }

  canUndo(): boolean {
    return this.state.currentIndex > 0;
  }

  canRedo(): boolean {
    return this.state.currentIndex >= 0 && this.state.currentIndex < this.state.snapshots.length - 1;
  }

  getCurrent(): ISchema | null {
    if (this.state.currentIndex < 0) {
      return null;
    }
    return cloneSchema(this.state.snapshots[this.state.currentIndex]);
  }

  getState(): HistoryState {
    return {
      snapshots: this.state.snapshots.map((snapshot) => cloneSchema(snapshot)),
      currentIndex: this.state.currentIndex,
      maxSize: this.state.maxSize,
    };
  }
}

export const historyService = new HistoryService(50);
