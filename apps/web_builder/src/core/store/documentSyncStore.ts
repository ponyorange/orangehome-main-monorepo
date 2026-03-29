import { create } from 'zustand';

interface DocumentSyncState {
  /** true = 相对上次成功持久化或本次加载版本存在未持久化变更 */
  isDirty: boolean;
  markClean: () => void;
  markDirty: () => void;
}

export const useDocumentSyncStore = create<DocumentSyncState>((set) => ({
  isDirty: false,
  markClean: () => set({ isDirty: false }),
  markDirty: () => set({ isDirty: true }),
}));
