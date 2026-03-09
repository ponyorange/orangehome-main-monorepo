import type { interfaces } from 'inversify';
import type { Container } from 'inversify';

/**
 * 扩展模块接口
 * 每个扩展实现此接口，在 init 中完成注册与初始化
 */
export interface Extension {
  readonly id: string;
  init(container: Container): void | Promise<void>;
}

/**
 * ContainerModule 工厂函数
 * 便于每个扩展独立注册到 DI 容器
 */
export type ContainerModule = (bind: interfaces.Bind) => void;

/**
 * 扩展注册表：收集所有需要加载的扩展
 */
export const EXTENSION_IDS = ['store', 'canvas', 'schema'] as const;
export type ExtensionId = (typeof EXTENSION_IDS)[number];
