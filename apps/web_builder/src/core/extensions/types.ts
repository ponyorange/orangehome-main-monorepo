import type { ISlotContent } from '../slots/types';
import type { OrangeEditor } from '../editor';

/**
 * 扩展接口
 * 所有扩展必须实现此接口
 */
export interface IExtension {
  /** 扩展唯一标识 */
  id: string;
  /** 扩展名称 */
  name: string;
  /** 扩展版本 */
  version?: string;
  /** 依赖的其他扩展ID列表 */
  dependencies?: string[];
  /** 初始化扩展 */
  init(context: IExtensionContext): void | Promise<void>;
  /** 激活扩展 */
  activate?(context: IExtensionContext): void | Promise<void>;
  /** 停用扩展 */
  deactivate?(context: IExtensionContext): void | Promise<void>;
  /** 销毁扩展 */
  destroy?(): void | Promise<void>;
}

/**
 * 扩展上下文
 * 提供给扩展的 API 接口
 */
export interface IExtensionContext {
  /** 编辑器实例 */
  editor: OrangeEditor;
  /** 定义插槽 */
  defineSlot(name: string, parent?: string): void;
  /** 注册插槽内容 */
  registerSlot(slotName: string, content: ISlotContent): void;
  /** 注销插槽内容 */
  unregisterSlot(slotName: string, contentId: string): void;
  /** 获取服务 */
  getService<T>(identifier: symbol | string): T;
  /** 注册服务 */
  registerService<T>(id: symbol | string, service: T): void;
  /** 监听事件 */
  on(event: string, handler: (...args: any[]) => void): void;
  /** 取消监听事件 */
  off(event: string, handler: (...args: any[]) => void): void;
  /** 触发事件 */
  emit(event: string, data?: any): void;
}
