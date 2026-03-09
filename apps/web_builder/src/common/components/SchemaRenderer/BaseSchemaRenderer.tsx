import React, { useEffect, useState } from 'react';
import type { ISchema } from '../../../types/base';
import type { ComponentManager } from './ComponentManager';
import type { ComponentType } from 'react';

export interface BaseSchemaRendererProps {
  schema: ISchema;
  componentManager: ComponentManager;
  /** 事件处理器：actionId -> handler */
  onAction?: (actionId: string, schema: ISchema, event: React.SyntheticEvent) => void;
  /** 选中/悬停（画布用） */
  selectedNodeId?: string | null;
  hoveredNodeId?: string | null;
  onSelectNode?: (id: string | null) => void;
  onHoverNode?: (id: string | null) => void;
  /** 开始移动（画布用，选中节点拖拽手柄） */
  onStartMove?: (nodeId: string, el: HTMLElement, clientX: number, clientY: number) => void;
}

export function BaseSchemaRenderer({
  schema,
  componentManager,
  onAction,
  selectedNodeId = null,
  hoveredNodeId = null,
  onSelectNode,
  onHoverNode,
  onStartMove,
}: BaseSchemaRendererProps) {
  const [Component, setComponent] = useState<ComponentType<Record<string, unknown>> | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const { type, id, children = [], props = {}, propStyle, event2action = {} } = schema;
  const isSelected = selectedNodeId === id;
  const isHovered = hoveredNodeId === id;
  const selectable = Boolean(onSelectNode || onHoverNode);

  useEffect(() => {
    let cancelled = false;
    setError(null);
    componentManager
      .loadRemoteComponent(type)
      .then((comp) => {
        if (!cancelled) setComponent(() => comp);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err);
          setComponent(null);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [type, componentManager]);

  const handleEvent = (eventName: string) => (e: React.SyntheticEvent) => {
    const actionId = event2action[eventName];
    if (actionId && onAction) {
      onAction(actionId, schema, e);
    }
  };

  const childElements = children.map((child) => (
    <BaseSchemaRenderer
      key={child.id}
      schema={child}
      componentManager={componentManager}
      onAction={onAction}
      selectedNodeId={selectedNodeId}
      hoveredNodeId={hoveredNodeId}
      onSelectNode={onSelectNode}
      onHoverNode={onHoverNode}
      onStartMove={onStartMove}
    />
  ));

  if (error) {
    return (
      <div
        data-schema-id={id}
        data-schema-type={type}
        data-error="component-load-failed"
        style={{ color: '#f53f3f', padding: 8, fontSize: 12 }}
      >
        [{type}] 加载失败: {error.message}
      </div>
    );
  }

  if (!Component) {
    return (
      <div data-schema-id={id} data-schema-type={type} style={{ padding: 4 }}>
        <span style={{ color: '#999' }}>加载中 ({type})...</span>
      </div>
    );
  }

  const mergedProps: Record<string, unknown> = {
    ...props,
    style: { ...(propStyle ?? {}), ...((props.style as object) ?? {}) },
    children: childElements.length > 0 ? childElements : props.children,
  };

  if (event2action.onClick) {
    (mergedProps as Record<string, unknown>).onClick = handleEvent('onClick');
  }
  if (event2action.onChange) {
    (mergedProps as Record<string, unknown>).onChange = handleEvent('onChange');
  }

  const inner = (
    <Component key={id} {...mergedProps} data-schema-id={id} data-schema-type={type} />
  );

  if (!selectable) {
    return inner;
  }

  return (
    <div
      className={`orange-schema-node ${isSelected ? 'orange-schema-node--selected' : ''} ${isHovered ? 'orange-schema-node--hovered' : ''}`}
      data-schema-id={id}
      data-schema-type={type}
      onClick={(e) => {
        e.stopPropagation();
        onSelectNode?.(id);
      }}
      onMouseEnter={() => onHoverNode?.(id)}
      onMouseLeave={() => onHoverNode?.(null)}
    >
      {inner}
      {isSelected && onStartMove && (
        <div
          className="orange-schema-node-move-handle"
          data-move-handle
          data-schema-id={id}
          title="拖动移动"
          onMouseDown={(e) => {
            e.stopPropagation();
            onStartMove(id, e.currentTarget as HTMLElement, e.clientX, e.clientY);
          }}
        />
      )}
    </div>
  );
}
