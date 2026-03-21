import { create } from 'zustand';

export type PreviewDevice = 'mobile' | 'tablet' | 'desktop';

interface PreviewState {
  isPreviewMode: boolean;
  device: PreviewDevice;
  openPreview: () => void;
  closePreview: () => void;
  togglePreview: () => void;
  setDevice: (device: PreviewDevice) => void;
}

export const usePreviewStore = create<PreviewState>((set) => ({
  isPreviewMode: false,
  device: 'mobile',
  openPreview: () => set({ isPreviewMode: true }),
  closePreview: () => set({ isPreviewMode: false }),
  togglePreview: () => set((state) => ({ isPreviewMode: !state.isPreviewMode })),
  setDevice: (device) => set({ device }),
}));
