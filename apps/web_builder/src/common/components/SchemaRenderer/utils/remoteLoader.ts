import type { ComponentType } from 'react';
import type { RemoteComponentDefinition, SchemaComponentProps } from '../ComponentManager';
import { loadRemoteStyle } from './remoteStyle';

function normalizeExportedComponent(
  mod: unknown,
  exportName?: string,
): ComponentType<SchemaComponentProps> | null {
  if (mod == null) return null;
  let v: unknown = mod;
  if (exportName && typeof mod === 'object' && mod !== null && exportName in mod) {
    v = (mod as Record<string, unknown>)[exportName];
  }
  if (typeof v === 'function') return v as ComponentType<SchemaComponentProps>;
  if (typeof v === 'object' && v !== null && 'default' in v) {
    const d = (v as { default: unknown }).default;
    if (typeof d === 'function') return d as ComponentType<SchemaComponentProps>;
  }
  return null;
}

/** 非 AMD：ESM dynamic import / 全局脚本 */
export async function loadRemoteComponent(
  definition: RemoteComponentDefinition,
): Promise<ComponentType<SchemaComponentProps> | null> {
  await loadRemoteStyle(definition.cssUrl);

  if (definition.moduleUrl) {
    const mod = await import(/* @vite-ignore */ definition.moduleUrl);
    return normalizeExportedComponent(mod, definition.exportName);
  }

  if (definition.scriptUrl) {
    const scriptUrl = definition.scriptUrl;
    await new Promise<void>((resolve, reject) => {
      const existed = document.querySelector(`script[data-remote-src="${scriptUrl}"]`) as HTMLScriptElement | null;
      if (existed) {
        if (existed.dataset.loaded === 'true') {
          resolve();
          return;
        }
        existed.addEventListener('load', () => resolve(), { once: true });
        existed.addEventListener('error', () => reject(new Error(`远程脚本加载失败: ${scriptUrl}`)), { once: true });
        return;
      }

      const script = document.createElement('script');
      script.src = scriptUrl;
      script.async = true;
      script.dataset.remoteSrc = scriptUrl;
      script.onload = () => {
        script.dataset.loaded = 'true';
        resolve();
      };
      script.onerror = () => reject(new Error(`远程脚本加载失败: ${scriptUrl}`));
      document.body.appendChild(script);
    });

    const globalWindow = window as unknown as Record<string, unknown>;
    const globalValue = definition.globalName
      ? globalWindow[definition.globalName]
      : globalWindow.__OrangeRemoteComponent__;

    return normalizeExportedComponent(globalValue, definition.exportName);
  }

  return null;
}
