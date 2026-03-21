import React from 'react';
import type { ISchema } from '../../../types/base';
import { loadRemoteComponent } from './utils/remoteLoader';

export interface RemoteComponentDefinition {
  moduleUrl?: string;
  scriptUrl?: string;
  cssUrl?: string;
  exportName?: string;
  globalName?: string;
}

export interface SchemaComponentProps {
  schema: ISchema;
  children?: React.ReactNode;
  eventHandlers?: Record<string, unknown>;
}

type SchemaComponent = React.ComponentType<SchemaComponentProps>;

/** 基础组件映射表 */
const componentMap: Record<string, SchemaComponent> = {};
const remoteComponentCache = new Map<string, Promise<SchemaComponent | null>>();

function getRemoteCacheKey(definition: RemoteComponentDefinition): string {
  return JSON.stringify(definition);
}

/**
 * 组件管理器
 * 负责将 Schema type 映射到实际的 React 组件
 */
export const ComponentManager = {
  /**
   * 注册组件
   */
  register(type: string, component: SchemaComponent): void {
    componentMap[type] = component;
  },

  /**
   * 获取组件
   */
  get(type: string): SchemaComponent | null {
    return componentMap[type] ?? null;
  },

  /**
   * 检查是否已注册
   */
  has(type: string): boolean {
    return type in componentMap;
  },

  /**
   * 加载远程组件
   */
  async loadRemote(type: string, definition: RemoteComponentDefinition): Promise<SchemaComponent | null> {
    const cacheKey = `${type}:${getRemoteCacheKey(definition)}`;
    if (!remoteComponentCache.has(cacheKey)) {
      remoteComponentCache.set(
        cacheKey,
        (async () => {
          const component = await loadRemoteComponent(definition);
          if (component) {
            componentMap[type] = component;
          }
          return component;
        })()
      );
    }

    return (await remoteComponentCache.get(cacheKey)) ?? null;
  },
};
