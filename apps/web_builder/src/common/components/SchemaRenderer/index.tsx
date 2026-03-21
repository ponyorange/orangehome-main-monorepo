import React from 'react';
import type { ISchema } from '../../../types/base';
import './BaseComponents'; // 注册基础组件
import { ComponentManager } from './ComponentManager';

export interface SchemaRendererProps {
  schema: ISchema | null;
}

/**
 * Schema 渲染器
 * 将 ISchema 树递归渲染为 React 组件
 */
export const SchemaRenderer: React.FC<SchemaRendererProps> = ({ schema }) => {
  if (!schema) {
    return null;
  }

  const Component = ComponentManager.get(schema.type);
  if (!Component) {
    return (
      <div data-schema-id={schema.id} style={{ color: '#999', fontSize: 12, padding: 8 }}>
        [未知根组件: {schema.type}]
      </div>
    );
  }

  return <Component schema={schema} />;
};

export { ComponentManager } from './ComponentManager';
export { SchemaNode, TextComponent, ImageComponent, ContainerComponent, ButtonComponent } from './BaseComponents';

// 可选择版本（支持点击选中和悬停高亮）
export { 
  SelectableSchemaRenderer,
  SelectionContext,
  useSelectionContext,
  type SelectableSchemaRendererProps,
} from './SelectableSchemaRenderer';
export {
  SelectableSchemaNode,
  SelectableContainer,
  type SelectableSchemaNodeProps,
  type SelectableContainerProps,
} from './SelectableComponents';
