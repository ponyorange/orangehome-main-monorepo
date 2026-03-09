import 'reflect-metadata';
import {
  Container,
  interfaces,
  inject,
  injectable,
  multiInject,
  tagged,
  named,
} from 'inversify';

export { Container, inject, injectable, multiInject, tagged, named, interfaces };

/**
 * Contribution Provider 接口：提供贡献项的集合
 */
export interface IContributionProvider<T> {
  getContributions(): T[];
}

/**
 * Contribution Provider 工厂 token
 * 用于创建特定类型的 ContributionProvider
 */
export const ContributionProvider = Symbol('ContributionProvider');

/**
 * 绑定 Contribution Provider 的工具函数
 * 将 contributionIdentifier 绑定到一个 IContributionProvider，
 * 该 Provider 会聚合所有绑定到 contributionIdentifier 的贡献项
 *
 * @param container - DI 容器
 * @param contributionIdentifier - 贡献项的服务标识符（如 ICommandContribution）
 * @param providerIdentifier - 可选，Provider 的绑定标识符，默认使用生成的 Symbol
 */
export function bindContributionProvider<T>(
  container: Container,
  contributionIdentifier: interfaces.ServiceIdentifier<T>,
  providerIdentifier?: symbol | string
): void {
  const providerId =
    providerIdentifier ??
    (Symbol.for(`ContributionProvider:${String(contributionIdentifier)}`) as interfaces.ServiceIdentifier<IContributionProvider<T>>);

  if (container.isBound(providerId)) {
    return;
  }

  container
    .bind<IContributionProvider<T>>(providerId)
    .toDynamicValue((context) => {
      return {
        getContributions(): T[] {
          try {
            return context.container.getAll<T>(contributionIdentifier);
          } catch {
            return [];
          }
        },
      };
    })
    .inSingletonScope();
}

/**
 * 装饰器工具：便于使用 @injectable、@inject 等
 */
export function getDecorators() {
  return {
    injectable,
    inject,
    multiInject,
    tagged,
    named,
  };
}

/** 默认 DI 容器 */
export const defaultContainer = new Container();
