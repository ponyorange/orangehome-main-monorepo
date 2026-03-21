import { create } from 'zustand';

// 事件发射器类型
type EventEmitter = (event: string, data: any) => void;

export interface LeftPanelState {
  activeTab: string;
  collapsed: boolean;
  setActiveTab: (tab: string) => void;
  toggleCollapsed: () => void;
  setEventEmitter: (emitter: EventEmitter) => void;
}

// 内部状态
interface InternalState extends LeftPanelState {
  _eventEmitter: EventEmitter | null;
}

export const useLeftPanelStore = create<InternalState>((set, get) => ({
  activeTab: 'component',
  collapsed: false,
  _eventEmitter: null,
  setActiveTab: (tab) => {
    const previousTab = get().activeTab;
    set({ activeTab: tab });
    // 发射 tab 切换事件
    const emitter = get()._eventEmitter;
    if (emitter && previousTab !== tab) {
      emitter('left-panel:tab:change', tab);
    }
  },
  toggleCollapsed: () => set((state) => ({ collapsed: !state.collapsed })),
  setEventEmitter: (emitter) => set({ _eventEmitter: emitter }),
}));
