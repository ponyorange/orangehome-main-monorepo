import 'reflect-metadata';
import { Container, ContainerModule, interfaces } from 'inversify';

// 创建默认容器
let defaultContainer = new Container({
  defaultScope: 'Singleton',
});

// 容器模块类型
export type ContainerModuleType = ContainerModule;

// 获取默认容器
export function getDefaultContainer(): Container {
  return defaultContainer;
}

// 设置默认容器
export function setDefaultContainer(container: Container): void {
  defaultContainer = container;
}

// 加载容器模块
export function loadModule(module: ContainerModule): void {
  defaultContainer.load(module);
}

// 获取服务
export function getService<T>(serviceIdentifier: interfaces.ServiceIdentifier<T>): T {
  return defaultContainer.get<T>(serviceIdentifier);
}

// 绑定服务
export function bindService<T>(
  serviceIdentifier: interfaces.ServiceIdentifier<T>,
  constructor: new (...args: unknown[]) => T
): void {
  defaultContainer.bind<T>(serviceIdentifier).to(constructor);
}

// 重新导出默认容器（向后兼容）
export { defaultContainer };
