import React from 'react';
import type { RemoteComponentDefinition, SchemaComponentProps } from '../ComponentManager';

const remoteStyleCache = new Set<string>();

async function loadRemoteStyle(cssUrl?: string): Promise<void> {
  if (!cssUrl || remoteStyleCache.has(cssUrl)) return;

  await new Promise<void>((resolve, reject) => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = cssUrl;
    link.onload = () => resolve();
    link.onerror = () => reject(new Error(`远程样式加载失败: ${cssUrl}`));
    document.head.appendChild(link);
  });

  remoteStyleCache.add(cssUrl);
}

export async function loadRemoteComponent(
  definition: RemoteComponentDefinition
): Promise<React.ComponentType<SchemaComponentProps> | null> {
  await loadRemoteStyle(definition.cssUrl);

  if (definition.moduleUrl) {
    const mod = await import(/* @vite-ignore */ definition.moduleUrl);
    const exported = definition.exportName ? mod[definition.exportName] : mod.default;
    return (exported as React.ComponentType<SchemaComponentProps> | undefined) ?? null;
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

    return (globalValue as React.ComponentType<SchemaComponentProps> | undefined) ?? null;
  }

  return null;
}
