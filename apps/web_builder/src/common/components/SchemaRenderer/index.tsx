import React from 'react';
import type { ISchema } from '../../../types/base';
import { SchemaNode } from './BaseComponents';

export interface SchemaRendererProps {
  schema: ISchema | null;
}

/**
 * Schema 渲染器（仅远端物料 / props.remote）
 */
export const SchemaRenderer: React.FC<SchemaRendererProps> = ({ schema }) => {
  if (!schema) {
    return null;
  }

  return <SchemaNode schema={schema} />;
};

export { ComponentManager } from './ComponentManager';
export { SchemaNode } from './BaseComponents';

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
export { EditorChromeOverlayMount, useEditorChromeOverlay } from './EditorChromeOverlayContext';
