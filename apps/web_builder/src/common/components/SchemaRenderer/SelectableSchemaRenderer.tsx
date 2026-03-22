import React, { useContext } from 'react';
import type { ISchema } from '../../../types/base';
import type { ResizeDirection } from '../../../extensions/select-and-drag/hooks/useResize';
import { findById } from '../../../common/base/schemaOperator';
import { useSchemaStore } from '../../../core/store/schemaStore';
import {
  SelectableSchemaNode,
  SelectableContainer,
} from './SelectableComponents';
import { isBuiltInLayoutContainerType } from '../../base/schemaLayout';

export interface SelectableSchemaRendererProps {
  schema: ISchema | null;
}

interface SelectionContextValue {
  selectedIds: string[];
  hoverId: string | null;
  isSelected: (id: string) => boolean;
  isHovered: (id: string) => boolean;
  handleClick: (id: string, event: React.MouseEvent) => void;
  handleMouseEnter: (id: string) => void;
  handleMouseLeave: () => void;
  clearSelection: () => void;
  handleContextMenu?: (id: string, event: React.MouseEvent) => void;
  onMoveStart?: (id: string, clientX: number, clientY: number) => void;
  onResizeStart?: (id: string, direction: ResizeDirection, clientX: number, clientY: number, width: number, height: number) => void;
}

const defaultContext: SelectionContextValue = {
  selectedIds: [],
  hoverId: null,
  isSelected: () => false,
  isHovered: () => false,
  handleClick: () => {},
  handleMouseEnter: () => {},
  handleMouseLeave: () => {},
  clearSelection: () => {},
  handleContextMenu: undefined,
  onMoveStart: undefined,
  onResizeStart: undefined,
};

export const SelectionContext = React.createContext<SelectionContextValue>(defaultContext);

/**
 * 使用选择上下文
 */
export function useSelectionContext() {
  return useContext(SelectionContext);
}

/**
 * 可选择的 Schema 渲染器
 * 使用父级提供的 SelectionContext（由 CenterCanvas 提供）
 */
export const SelectableSchemaRenderer: React.FC<SelectableSchemaRendererProps> = ({ 
  schema 
}) => {
  if (!schema) {
    return null;
  }

  return <SelectableSchemaNodeRecursive schema={schema} isRoot />;
};

/**
 * 递归渲染可选择 Schema 节点
 * 使用上下文获取选择状态
 */
interface SelectableSchemaNodeRecursiveProps {
  schema: ISchema;
  isRoot?: boolean;
}

const SelectableSchemaNodeRecursive: React.FC<SelectableSchemaNodeRecursiveProps> = ({
  schema,
  isRoot = false,
}) => {
  const { isSelected, isHovered, handleClick, handleMouseEnter, handleMouseLeave, handleContextMenu, onMoveStart, onResizeStart } = useSelectionContext();

  /** 始终从 store 按 id 取当前节点，避免父链 props 与右侧面板 setSchema 后的树不同步 */
  const fromStore = useSchemaStore((s) => findById(s.schema, schema.id));
  const node = fromStore ?? schema;

  const selected = isSelected(node.id);
  const hovered = isHovered(node.id);

  if (isBuiltInLayoutContainerType(node.type) || node.children?.length) {
    return (
      <SelectableContainer
        schema={node}
        selectable={!isRoot}
        isSelected={selected}
        isHovered={hovered}
        onClick={handleClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onContextMenu={handleContextMenu}
        onMoveStart={onMoveStart}
        onResizeStart={onResizeStart}
      >
        {node.children?.map((child) => (
          <SelectableSchemaNodeRecursive key={child.id} schema={child} />
        ))}
      </SelectableContainer>
    );
  }

  return (
    <SelectableSchemaNode
      schema={node}
      selectable={!isRoot}
      isSelected={selected}
      isHovered={hovered}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onContextMenu={handleContextMenu}
      onMoveStart={onMoveStart}
      onResizeStart={onResizeStart}
    />
  );
};
