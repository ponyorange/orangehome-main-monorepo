import React from 'react';
import type { ISchema } from '../../../types/base';
import { loadRemoteComponent } from './utils/remoteLoader';
import { runtimeContextService } from '../../../core/services/RuntimeContextService';
import { remoteComponentDebug } from '../../../utils/remoteComponentDebug';

export interface RemoteComponentDefinition {
  /** 通过 RequireJS（AMD）加载的脚本 URL，与 moduleUrl 二选一优先使用 */
  amdUrl?: string;
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
    const cacheHit = remoteComponentCache.has(cacheKey);
    remoteComponentDebug('ComponentManager.loadRemote', {
      type,
      cacheHit,
      amdUrl: definition.amdUrl,
      moduleUrl: definition.moduleUrl,
      exportName: definition.exportName,
    });
    if (!cacheHit) {
      remoteComponentCache.set(
        cacheKey,
        (async () => {
          let component: SchemaComponent | null = null;
          if (definition.amdUrl) {
            remoteComponentDebug('ComponentManager.loadRemote: 走 AMD → runtimeContextService.loadRemoteMaterial', {
              type,
            });
            component = await runtimeContextService.loadRemoteMaterial(type, definition);
          } else {
            remoteComponentDebug('ComponentManager.loadRemote: 走 ESM/script → loadRemoteComponent', { type });
            component = await loadRemoteComponent(definition);
          }
          remoteComponentDebug('ComponentManager.loadRemote: 解析结果', {
            type,
            ok: Boolean(component),
            displayName: component?.displayName ?? component?.name,
          });
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
