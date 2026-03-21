import React, { useEffect, useMemo, useState } from 'react';
import type { ISchema } from '../../../types/base';
import { ComponentManager, type RemoteComponentDefinition, type SchemaComponentProps } from './ComponentManager';
import { useSchemaEventHandlers } from './utils/eventActions';
import { TextComponent } from '../../../components/Text';
import { ImageComponent } from '../../../components/Image';
import { ButtonComponent } from '../../../components/Button';
import { ContainerComponent } from '../../../components/Container';

function getRemoteDefinition(schema: ISchema): RemoteComponentDefinition | null {
  const props = schema.props as Record<string, unknown>;
  const remote = props.remote as Record<string, unknown> | undefined;

  if (remote) {
    return {
      moduleUrl: typeof remote.moduleUrl === 'string' ? remote.moduleUrl : undefined,
      scriptUrl: typeof remote.scriptUrl === 'string' ? remote.scriptUrl : undefined,
      cssUrl: typeof remote.cssUrl === 'string' ? remote.cssUrl : undefined,
      exportName: typeof remote.exportName === 'string' ? remote.exportName : undefined,
      globalName: typeof remote.globalName === 'string' ? remote.globalName : undefined,
    };
  }

  if (typeof props.remoteUrl === 'string') {
    return { moduleUrl: props.remoteUrl };
  }

  return null;
}

const UnknownComponent: React.FC<{ schema: ISchema; message?: string }> = ({ schema, message }) => (
  <div key={schema.id} data-schema-id={schema.id} style={{ color: '#999', fontSize: 12 }}>
    {message ?? `[未知组件: ${schema.type}]`}
  </div>
);

const RemoteSchemaNode: React.FC<{ schema: ISchema; children?: React.ReactNode }> = React.memo(({ schema, children }) => {
  const [RemoteComponent, setRemoteComponent] = useState<React.ComponentType<SchemaComponentProps> | null>(() => ComponentManager.get(schema.type));
  const [error, setError] = useState<string | null>(null);
  const remoteDefinition = useMemo(() => getRemoteDefinition(schema), [schema]);
  const eventHandlers = useSchemaEventHandlers(schema);

  useEffect(() => {
    let cancelled = false;

    if (!remoteDefinition) {
      setRemoteComponent(null);
      return;
    }

    void ComponentManager.loadRemote(schema.type, remoteDefinition)
      .then((component) => {
        if (cancelled) return;
        if (!component) {
          setError(`远程组件加载失败: ${schema.type}`);
          return;
        }
        setError(null);
        setRemoteComponent(() => component);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : `远程组件加载失败: ${schema.type}`);
      });

    return () => {
      cancelled = true;
    };
  }, [schema.type, remoteDefinition]);

  if (error) {
    return <UnknownComponent schema={schema} message={error} />;
  }

  if (!RemoteComponent) {
    return (
      <div data-schema-id={schema.id} style={{ color: '#999', fontSize: 12 }}>
        正在加载远程组件...
      </div>
    );
  }

  return <RemoteComponent schema={schema} eventHandlers={eventHandlers}>{children}</RemoteComponent>;
});

/** 递归渲染单个 Schema 节点 */
const SchemaNode: React.FC<{ schema: ISchema }> = React.memo(({ schema }) => {
  const Component = ComponentManager.get(schema.type);
  const eventHandlers = useSchemaEventHandlers(schema);
  const children = useMemo(
    () => schema.children?.map((child) => <SchemaNode key={child.id} schema={child} />),
    [schema.children]
  );

  if (Component) {
    return (
      <Component key={schema.id} schema={schema} eventHandlers={eventHandlers}>
        {children}
      </Component>
    );
  }

  const remoteDefinition = getRemoteDefinition(schema);
  if (remoteDefinition) {
    return (
      <RemoteSchemaNode schema={schema}>
        {children}
      </RemoteSchemaNode>
    );
  }

  return <UnknownComponent schema={schema} />;
});

/** 注册基础组件 */
ComponentManager.register('Text', TextComponent);
ComponentManager.register('Image', ImageComponent);
ComponentManager.register('Container', ContainerComponent);
ComponentManager.register('Button', ButtonComponent);

export { SchemaNode, TextComponent, ImageComponent, ContainerComponent, ButtonComponent };
