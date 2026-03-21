// 版本号
export const version = __VERSION__;

// 导入 reflect-metadata（必须在应用入口）
import 'reflect-metadata';

// ===== 核心容器 =====
export {
  defaultContainer,
  loadModule,
  getService,
  bindService,
  type ContainerModuleType,
} from './core/container';

export {
  TYPES,
  injectable,
  inject,
  optional,
  multiInject,
} from './core/container/decorators';

// ===== 核心服务 =====
export { EditorService } from './core/services/EditorService';
export { StoreService } from './core/services/StoreService';

// ===== 核心类 =====
export { OrangeEditor } from './core/editor';
export { SlotRegistry } from './core/slots/SlotRegistry';
export { SlotRenderer } from './core/slots/SlotRenderer';
export { ExtensionLoader } from './core/extensions/ExtensionLoader';
export { EventBus } from './core/events/EventBus';

// ===== 核心组件 =====
export { EditorView } from './core/components/EditorView';

// ===== 贡献点系统 =====
export {
  ContributionProviderImpl,
  bindContributionProvider,
} from './core/types/contribution';
export type { ContributionProvider, ExtensionContribution } from './core/types/contribution';

// ===== 插槽类型 =====
export type {
  ISlotContent,
  ISlot,
} from './core/slots/types';

// ===== 扩展类型 =====
export type {
  IExtension,
  IExtensionContext,
} from './core/extensions/types';

// ===== 基础类型 =====
export type {
  ISchema,
  IComponentNode,
  IComponent,
  IComponentMeta,
  IPropMeta,
  IEditorOptions,
} from './types/base';

// ===== 状态类型 =====
export type {
  IEditorState,
  IComponentState,
  IHistoryState,
  IStoreState,
} from './types/store';

// ===== 工具 =====
export { generateId, generateIdWithPrefix } from './utils/id';
export { deepClone } from './utils/clone';

// ===== Schema 操作 =====
export { schemaOperator } from './common/base/schemaOperator';

// ===== 数据模块 =====
export * from './data/modules';
