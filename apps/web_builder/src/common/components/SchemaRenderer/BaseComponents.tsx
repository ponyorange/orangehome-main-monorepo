import React, { useEffect, useMemo, useState } from 'react';
import type { ISchema } from '../../../types/base';
import { ComponentManager, type RemoteComponentDefinition } from './ComponentManager';
import { useSchemaEventHandlers } from './utils/eventActions';
import { useRuntimeComponentsStore } from '../../../core/store/runtimeComponentsStore';
import { useMaterialBundleStore } from '../../../core/store/materialBundleStore';
import { remoteComponentDebug, REMOTE_COMPONENT_DEBUG_TAG } from '../../../utils/remoteComponentDebug';

function getRemoteDefinitionFromProps(schema: ISchema): RemoteComponentDefinition | null {
  const props = schema.props as Record<string, unknown> | undefined;
  if (!props) return null;
  const remote = props.remote as Record<string, unknown> | undefined;

  let def: RemoteComponentDefinition | null = null;

  if (remote) {
    const amdUrl = typeof remote.amdUrl === 'string' ? remote.amdUrl.trim() : '';
    const moduleUrl = typeof remote.moduleUrl === 'string' ? remote.moduleUrl.trim() : '';
    const scriptUrl = typeof remote.scriptUrl === 'string' ? remote.scriptUrl.trim() : '';
    def = {
      amdUrl: amdUrl || undefined,
      moduleUrl: moduleUrl || undefined,
      scriptUrl: scriptUrl || undefined,
      cssUrl: typeof remote.cssUrl === 'string' ? remote.cssUrl : undefined,
      exportName: typeof remote.exportName === 'string' ? remote.exportName : undefined,
      globalName: typeof remote.globalName === 'string' ? remote.globalName : undefined,
    };
  } else if (typeof props.remoteUrl === 'string') {
    const u = props.remoteUrl.trim();
    if (u) def = { moduleUrl: u };
  }

  if (!def) return null;
  if (!def.amdUrl && !def.moduleUrl && !def.scriptUrl) return null;
  return def;
}

/** 供 SchemaNode / SelectableSchemaNode 共用：props.remote 或物料列表 bundle → RemoteComponentDefinition */
export function mergeRemoteDefinition(schema: ISchema, bundleUrl: string | undefined): RemoteComponentDefinition | null {
  const fromProps = getRemoteDefinitionFromProps(schema);
  if (fromProps?.amdUrl || fromProps?.moduleUrl || fromProps?.scriptUrl) {
    return fromProps;
  }
  const url = bundleUrl?.trim();
  return url ? { amdUrl: url } : null;
}

const UnknownComponent: React.FC<{ schema: ISchema; message?: string }> = ({ schema, message }) => (
  <div key={schema.id} data-schema-id={schema.id} style={{ color: '#999', fontSize: 12 }}>
    {message ?? `[未知组件: ${schema.type}]`}
  </div>
);

/** 画布可选择层与 SchemaNode 共用：异步 loadRemote + 渲染 */
function schemaVisualSignature(s: ISchema): string {
  try {
    return JSON.stringify({
      props: s.props,
      style: s.style,
      name: s.name,
      childrenLen: s.children?.length ?? 0,
    });
  } catch {
    return `${s.id}:${String(s.props)}`;
  }
}

/** 不用 React.memo：schema 常被原地改 props，引用不变会导致整节点不渲染、RemoteComponent 拿不到新平铺 props */
export const RemoteSchemaNode: React.FC<{ schema: ISchema; children?: React.ReactNode }> = ({ schema, children }) => {
  const bundleUrl = useMaterialBundleStore((s) => s.bundles[schema.type]);
  const editorConfigFingerprint = useMaterialBundleStore((s) => {
    const c = s.editorConfigs[schema.type];
    if (!c) return '';
    try {
      return JSON.stringify(c);
    } catch {
      return '1';
    }
  });
  const cachedRenderer = useRuntimeComponentsStore((s) => s.componentsMap[schema.type]);
  /** AMD 物料导出 props 形状不统一，画布侧按 {...schema.props} 平铺传入 */
  /** 仅信任运行时缓存的远程渲染器；勿用 ComponentManager.get，否则 type 与内置重名时会误把内置组件当 Remote 实例 */
  const [RemoteComponent, setRemoteComponent] = useState<React.ComponentType<any> | null>(
    () => cachedRenderer ?? null,
  );
  const [error, setError] = useState<string | null>(null);
  const schemaSig = schemaVisualSignature(schema);
  const remoteDefinition = useMemo(
    () => mergeRemoteDefinition(schema, bundleUrl),
    [bundleUrl, schema.type, schemaSig],
  );
  /** 依赖内容指纹而非 schema 引用，避免原地更新 props/style 时 useMemo 仍返回旧 key */
  const remoteRenderKey = useMemo(
    () => `${schema.id}:${schemaSig}|edm:${editorConfigFingerprint}`,
    [schema.id, schemaSig, editorConfigFingerprint],
  );
  const eventHandlers = useSchemaEventHandlers(schema);

  useEffect(() => {
    if (cachedRenderer) {
      setRemoteComponent(() => cachedRenderer);
    }
  }, [cachedRenderer]);

  useEffect(() => {
    let cancelled = false;

    if (!remoteDefinition) {
      remoteComponentDebug('RemoteSchemaNode: 无 remoteDefinition，不发起 loadRemote', {
        type: schema.type,
        id: schema.id,
        bundleUrlFromStore: bundleUrl ?? '(无)',
      });
      setRemoteComponent(null);
      return;
    }

    if (cachedRenderer) {
      remoteComponentDebug('RemoteSchemaNode: 使用 store 已缓存渲染器', { type: schema.type, id: schema.id });
      return () => {
        cancelled = true;
      };
    }

    remoteComponentDebug('RemoteSchemaNode: 开始 ComponentManager.loadRemote', {
      type: schema.type,
      id: schema.id,
      amdUrl: remoteDefinition.amdUrl,
      moduleUrl: remoteDefinition.moduleUrl,
      exportName: remoteDefinition.exportName,
    });

    void ComponentManager.loadRemote(schema.type, remoteDefinition)
      .then((component) => {
        if (cancelled) return;
        if (!component) {
          remoteComponentDebug('RemoteSchemaNode: loadRemote 返回 null（检查 AMD 导出 / exportName）', {
            type: schema.type,
            id: schema.id,
          });
          setError(`远程组件加载失败: ${schema.type}`);
          return;
        }
        setError(null);
        remoteComponentDebug('RemoteSchemaNode: loadRemote 成功，已拿到 React 组件', {
          type: schema.type,
          name: component.displayName ?? component.name ?? '(匿名)',
        });
        setRemoteComponent(() => component);
      })
      .catch((err) => {
        if (cancelled) return;
        remoteComponentDebug('RemoteSchemaNode: loadRemote 异常', {
          type: schema.type,
          message: err instanceof Error ? err.message : String(err),
        });
        setError(err instanceof Error ? err.message : `远程组件加载失败: ${schema.type}`);
      });

    return () => {
      cancelled = true;
    };
  }, [schema.type, remoteDefinition, cachedRenderer]);

  if (error) {
    remoteComponentDebug('RemoteSchemaNode: 渲染错误态', { type: schema.type, error });
    console.error(REMOTE_COMPONENT_DEBUG_TAG, error);
    return <UnknownComponent schema={schema} message={error} />;
  }

  if (!RemoteComponent) {
    return (
      <div data-schema-id={schema.id} style={{ color: '#999', fontSize: 12 }}>
        正在加载远程组件...
      </div>
    );
  }
  return (
    <RemoteComponent
      key={remoteRenderKey}
      {...schema.props}
      id={schema.id}
      style={schema.style}
      eventHandlers={eventHandlers}
    >
      {children}
    </RemoteComponent>
  );
};

/** 递归渲染单个 Schema 节点（仅远端：物料 bundle 或 props.remote） */
const SchemaNode: React.FC<{ schema: ISchema }> = React.memo(({ schema }) => {
  const bundleUrl = useMaterialBundleStore((s) => s.bundles[schema.type]);
  const children = useMemo(
    () => schema.children?.map((child) => <SchemaNode key={child.id} schema={child} />),
    [schema.children],
  );

  const remoteDefinition = useMemo(() => mergeRemoteDefinition(schema, bundleUrl), [schema, bundleUrl]);

  if (remoteDefinition) {
    remoteComponentDebug('SchemaNode: RemoteSchemaNode', {
      type: schema.type,
      id: schema.id,
      name: schema.name,
      bundleUrl: bundleUrl ?? '(无)',
      amdUrl: remoteDefinition.amdUrl,
      moduleUrl: remoteDefinition.moduleUrl,
    });
    return (
      <RemoteSchemaNode schema={schema}>
        {children}
      </RemoteSchemaNode>
    );
  }

  remoteComponentDebug('SchemaNode: 无 bundle/remote → 未知组件', {
    type: schema.type,
    id: schema.id,
    name: schema.name,
    bundleUrl: bundleUrl ?? '(store 中无此 type)',
    hint: '确认组件列表已拉取且 materialUid 与 schema.type 一致',
  });
  return <UnknownComponent schema={schema} />;
});

export { SchemaNode };
