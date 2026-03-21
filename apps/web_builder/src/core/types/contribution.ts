import { interfaces } from 'inversify';

/**
 * 贡献点提供者接口
 * 用于扩展点模式，允许扩展贡献功能
 */
export interface ContributionProvider<T> {
  getContributions(): T[];
  getContribution(): T | undefined;
}

/**
 * 贡献点实现类
 */
export class ContributionProviderImpl<T> implements ContributionProvider<T> {
  private contributions: T[] = [];

  constructor(contributions: T[] = []) {
    this.contributions = contributions;
  }

  getContributions(): T[] {
    return this.contributions;
  }

  getContribution(): T | undefined {
    return this.contributions[0];
  }
}

/**
 * 绑定贡献点提供者
 * @param bind - Inversify bind 函数
 * @param identifier - 服务标识符
 */
export function bindContributionProvider<T>(
  bind: interfaces.Bind,
  identifier: interfaces.ServiceIdentifier<T>
): void {
  bind<ContributionProvider<T>>(Symbol.for(`ContributionProvider_${identifier.toString()}`))
    .toDynamicValue((context) => {
      const contributions = context.container.getAll<T>(identifier);
      return new ContributionProviderImpl<T>(contributions);
    })
    .inSingletonScope();
}

/**
 * 扩展贡献基础接口
 * 所有扩展都应实现此接口
 */
export interface ExtensionContribution {
  id: string;
  name: string;
  activate(): void | Promise<void>;
  deactivate?(): void | Promise<void>;
}
