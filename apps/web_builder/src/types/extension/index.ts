import type { IComponentType } from '../base/index';

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
  /** 初始化扩展 */
  init(context: IExtensionContext): void | Promise<void>;
  /** 销毁扩展 */
  destroy?(): void | Promise<void>;
}

/**
 * 扩展上下文
 * 提供给扩展的 API 接口
 */
export interface IExtensionContext {
  /** 注册插槽内容 */
  registerSlot(slotName: string, content: ISlotContent): void;
  /** 监听事件 */
  on(event: string, handler: (...args: unknown[]) => void): void;
  /** 触发事件 */
  emit(event: string, ...args: unknown[]): void;
  /** 获取服务 */
  getService<T>(identifier: symbol): T;
}

/**
 * 插槽内容
 */
export interface ISlotContent {
  id: string;
  component: React.ComponentType;
  priority?: number;
  config?: Record<string, unknown>;
}

/**
 * 组件扩展
 * 用于注册新组件类型
 */
export interface IComponentExtension extends IExtension {
  /** 注册的组件类型 */
  componentTypes: IComponentType[];
}

/**
 * 插件扩展
 * 用于添加编辑器功能
 */
export interface IPluginExtension extends IExtension {
  /** 插件激活时调用 */
  activate(): void;
  /** 插件停用时调用 */
  deactivate?(): void;
}
