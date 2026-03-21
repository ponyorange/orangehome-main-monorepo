import { injectable, inject, optional, multiInject } from 'inversify';

// 重新导出 Inversify 装饰器
export { injectable, inject, optional, multiInject };

// 服务标识符符号
export const TYPES = {
  EditorService: Symbol.for('EditorService'),
  StoreService: Symbol.for('StoreService'),
  EventBus: Symbol.for('EventBus'),
  SlotRegistry: Symbol.for('SlotRegistry'),
  ExtensionLoader: Symbol.for('ExtensionLoader'),
} as const;
