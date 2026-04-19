import * as React from 'react';
import type { CSSProperties } from 'react';
import { convertSchemaStyleToRem } from './style-px-to-rem.util';

/** 与 `plugins/runtime/src/SchemaRender.tsx` 中 `OhSchemaNode` 对齐 */
export type OhSchemaNode = {
  id: string;
  name?: string;
  type: string;
  style?: CSSProperties;
  props?: Record<string, unknown>;
  children?: OhSchemaNode[];
};

export function collectSchemaTypes(node: OhSchemaNode, out = new Set<string>()): Set<string> {
  out.add(node.type);
  for (const c of node.children ?? []) collectSchemaTypes(c, out);
  return out;
}

function cjsExportToComponent(mod: unknown): React.ComponentType<Record<string, unknown>> {
  if (typeof mod === 'function') {
    return mod as React.ComponentType<Record<string, unknown>>;
  }
  if (mod && typeof mod === 'object' && 'default' in mod) {
    const d = (mod as { default: unknown }).default;
    if (typeof d === 'function') {
      return d as React.ComponentType<Record<string, unknown>>;
    }
  }
  throw new Error('SSR CJS 未导出可用的 React 组件');
}

/** 与客户端 `SchemaRender` 中 `renderSchemaNode` 一致 */
export function renderSchemaNode(
  node: OhSchemaNode,
  registry: Record<string, React.ComponentType<Record<string, unknown>>>,
): React.ReactElement | null {
  const Comp = registry[node.type];
  if (!Comp) return null;

  const childNodes = node.children ?? [];
  const childElements = childNodes.map((child) => renderSchemaNode(child, registry));
  const hasChildren = childElements.length > 0;

  return React.createElement(Comp, {
    key: node.id || node.type,
    id: node.id,
    style: convertSchemaStyleToRem(node.style),
    ...(node.props ?? {}),
    ...(hasChildren ? { children: childElements } : {}),
  });
}

export function buildSsrRegistryFromModules(
  types: string[],
  modules: unknown[],
): Record<string, React.ComponentType<Record<string, unknown>>> {
  const registry: Record<string, React.ComponentType<Record<string, unknown>>> = {};
  types.forEach((id, i) => {
    registry[id] = cjsExportToComponent(modules[i]);
  });
  return registry;
}
