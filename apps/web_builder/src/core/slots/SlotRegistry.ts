import { ISlot, SlotContent } from './types';
import { injectable } from 'inversify';

/**
 * 插槽注册中心
 * 管理所有插槽的定义和内容注册
 */
@injectable()
export class SlotRegistry {
  private slots: Map<string, ISlot> = new Map();

  /**
   * 定义插槽
   * @param name - 插槽名称
   * @param parent - 父插槽名称（可选）
   */
  defineSlot(name: string, parent?: string): void {
    if (!this.slots.has(name)) {
      this.slots.set(name, {
        id: name,
        name,
        contents: [],
        parent,
      });
    }
  }

  /**
   * 注册插槽内容
   * @param slotName - 插槽名称
   * @param content - 插槽内容
   */
  registerContent(slotName: string, content: SlotContent): void {
    const slot = this.slots.get(slotName);
    if (slot) {
      // 检查是否已存在，存在则更新
      const existingIndex = slot.contents.findIndex(c => c.id === content.id);
      if (existingIndex >= 0) {
        slot.contents[existingIndex] = content;
      } else {
        slot.contents.push(content);
      }
      // 按 order 排序
      slot.contents.sort((a, b) => (a.order || 0) - (b.order || 0));
    } else {
      console.warn(`Slot "${slotName}" is not defined`);
    }
  }

  /**
   * 注销插槽内容
   * @param slotName - 插槽名称
   * @param contentId - 内容ID
   */
  unregisterContent(slotName: string, contentId: string): void {
    const slot = this.slots.get(slotName);
    if (slot) {
      slot.contents = slot.contents.filter(c => c.id !== contentId);
    }
  }

  /**
   * 获取插槽内容列表
   * @param slotName - 插槽名称
   * @returns 插槽内容列表
   */
  getContents(slotName: string): SlotContent[] {
    return this.slots.get(slotName)?.contents || [];
  }

  /**
   * 获取插槽
   * @param name - 插槽名称
   * @returns 插槽对象
   */
  getSlot(name: string): ISlot | undefined {
    return this.slots.get(name);
  }

  /**
   * 检查插槽是否存在
   * @param name - 插槽名称
   * @returns 是否存在
   */
  hasSlot(name: string): boolean {
    return this.slots.has(name);
  }

  /**
   * 获取所有插槽
   * @returns 插槽列表
   */
  getAllSlots(): ISlot[] {
    return Array.from(this.slots.values());
  }
}
