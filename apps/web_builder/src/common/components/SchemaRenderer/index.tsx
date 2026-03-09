import React, { useMemo } from 'react';
import { ComponentManager } from './ComponentManager';
import { BaseSchemaRenderer } from './BaseSchemaRenderer';
import type { ISchema } from '../../../types/base';
import type { UniqueId2Module } from '../../../types/store';
import { createConfigComponentLoader } from '../../../services/RuntimeContextService';

export interface SchemaRendererProps {
  schema: ISchema | null;
  uniqueId2Module?: UniqueId2Module;
  /** 静态组件映射：type -> React 组件 */
  staticComponents?: Record<string, React.ComponentType<Record<string, unknown>>>;
  onAction?: (actionId: string, schema: ISchema, event: React.SyntheticEvent) => void;
  selectedNodeId?: string | null;
  hoveredNodeId?: string | null;
  onSelectNode?: (id: string | null) => void;
  onHoverNode?: (id: string | null) => void;
  onStartMove?: (nodeId: string, el: HTMLElement, clientX: number, clientY: number) => void;
}

export function SchemaRenderer({
  schema,
  uniqueId2Module = {},
  staticComponents = {},
  onAction,
  selectedNodeId = null,
  hoveredNodeId = null,
  onSelectNode,
  onHoverNode,
  onStartMove,
}: SchemaRendererProps) {
  const componentManager = useMemo(() => {
    const manager = new ComponentManager();
    for (const [type, comp] of Object.entries(staticComponents)) {
      manager.registerStatic(type, comp);
    }
    manager.registerLoader(
      createConfigComponentLoader(() => uniqueId2Module)
    );
    return manager;
  }, [uniqueId2Module, staticComponents]);

  if (!schema) {
    return null;
  }

  return (
    <BaseSchemaRenderer
      schema={schema}
      componentManager={componentManager}
      onAction={onAction}
      selectedNodeId={selectedNodeId}
      hoveredNodeId={hoveredNodeId}
      onSelectNode={onSelectNode}
      onHoverNode={onHoverNode}
      onStartMove={onStartMove}
    />
  );
}
