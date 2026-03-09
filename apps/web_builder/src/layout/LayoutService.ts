/**
 * LayoutService - 布局插槽管理服务
 * 负责注册、注销、查询和订阅布局插槽
 */

import 'reflect-metadata';
import { injectable } from 'inversify';
import type { ILayoutService, LayoutSlot, SlotType, TabSlot } from './types';

export const LayoutService = Symbol('LayoutService');

@injectable()
export class LayoutServiceImpl implements ILayoutService {
  private _slots = new Map<string, LayoutSlot>();
  private _subscribers = new Map<SlotType, Set<(slots: LayoutSlot[]) => void>>();

  register(slot: LayoutSlot): void {
    if (this._slots.has(slot.id)) {
      console.warn(`[LayoutService] Slot ${slot.id} already exists, overwriting`);
    }
    this._slots.set(slot.id, { ...slot, visible: slot.visible ?? true });
    this._notify(slot.type);
  }

  unregister(id: string): void {
    const slot = this._slots.get(id);
    if (slot) {
      this._slots.delete(id);
      this._notify(slot.type);
    }
  }

  getSlotsByType(type: SlotType): LayoutSlot[] {
    const slots: LayoutSlot[] = [];
    for (const slot of this._slots.values()) {
      if (slot.type === type && slot.visible !== false) {
        slots.push(slot);
      }
    }
    // 按 priority 升序排序（越小越靠前）
    return slots.sort((a, b) => a.priority - b.priority);
  }

  getSlot(id: string): LayoutSlot | undefined {
    return this._slots.get(id);
  }

  hasSlot(id: string): boolean {
    return this._slots.has(id);
  }

  setVisible(id: string, visible: boolean): void {
    const slot = this._slots.get(id);
    if (slot && slot.visible !== visible) {
      slot.visible = visible;
      this._notify(slot.type);
    }
  }

  subscribe(type: SlotType, callback: (slots: LayoutSlot[]) => void): () => void {
    if (!this._subscribers.has(type)) {
      this._subscribers.set(type, new Set());
    }
    const set = this._subscribers.get(type)!;
    set.add(callback);
    return () => set.delete(callback);
  }

  clear(): void {
    this._slots.clear();
    for (const type of this._subscribers.keys()) {
      this._notify(type as SlotType);
    }
  }

  private _notify(type: SlotType): void {
    const slots = this.getSlotsByType(type);
    const callbacks = this._subscribers.get(type);
    if (callbacks) {
      for (const cb of callbacks) {
        cb(slots);
      }
    }
  }

  /** 获取 Tab 类型的插槽（专用于 leftPanelTab/rightPanelTab） */
  getTabSlots(tabType: 'leftPanelTab' | 'rightPanelTab'): TabSlot[] {
    return this.getSlotsByType(tabType as unknown as SlotType) as TabSlot[];
  }
}

export type { LayoutSlot, SlotType, ILayoutService };
