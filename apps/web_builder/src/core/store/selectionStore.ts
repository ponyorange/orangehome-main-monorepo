import { create } from 'zustand';

interface SelectionState {
  selectedIds: string[];
  setSelectedIds: (ids: string[]) => void;
  clearSelectedIds: () => void;
}

export const useSelectionStore = create<SelectionState>((set) => ({
  selectedIds: [],
  setSelectedIds: (ids) => set({ selectedIds: ids }),
  clearSelectedIds: () => set({ selectedIds: [] }),
}));
