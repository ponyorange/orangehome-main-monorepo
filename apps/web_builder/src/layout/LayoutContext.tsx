/**
 * LayoutContext - 布局上下文
 * 提供 LayoutService 访问和插槽订阅功能
 */

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { ILayoutService, LayoutSlot, SlotType } from './types';

const LayoutContext = createContext<ILayoutService | null>(null);

export interface LayoutProviderProps {
  service: ILayoutService;
  children: React.ReactNode;
}

export function LayoutProvider({ service, children }: LayoutProviderProps) {
  return (
    <LayoutContext.Provider value={service}>
      {children}
    </LayoutContext.Provider>
  );
}

/** 获取 LayoutService 实例 */
export function useLayoutService(): ILayoutService {
  const service = useContext(LayoutContext);
  if (!service) {
    throw new Error('useLayoutService must be used within LayoutProvider');
  }
  return service;
}

/** 订阅指定类型的插槽列表（自动排序和更新） */
export function useSlots(type: SlotType): LayoutSlot[] {
  const service = useLayoutService();
  const [slots, setSlots] = useState<LayoutSlot[]>(() => service.getSlotsByType(type));

  useEffect(() => {
    setSlots(service.getSlotsByType(type));
    return service.subscribe(type, (newSlots) => {
      setSlots(newSlots);
    });
  }, [service, type]);

  return slots;
}

/** 获取单个插槽 */
export function useSlot(id: string): LayoutSlot | undefined {
  const service = useLayoutService();
  const [slot, setSlot] = useState<LayoutSlot | undefined>(() => service.getSlot(id));

  useEffect(() => {
    const update = () => setSlot(service.getSlot(id));
    update();
    // 订阅所有类型以捕获变化
    const unsubs: (() => void)[] = [];
    const types: SlotType[] = ['header', 'leftPanel', 'center', 'rightPanel', 'float'];
    for (const t of types) {
      unsubs.push(service.subscribe(t, update));
    }
    return () => unsubs.forEach((u) => u());
  }, [service, id]);

  return slot;
}

/** 注册插槽的 Hook（用于组件内动态注册） */
export function useRegisterSlot(): (slot: LayoutSlot) => () => void {
  const service = useLayoutService();

  return useCallback(
    (slot: LayoutSlot) => {
      service.register(slot);
      return () => service.unregister(slot.id);
    },
    [service]
  );
}
