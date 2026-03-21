import React, { useContext } from 'react';
import type { ISchema } from '../../../types/base';
import type { ResizeDirection } from '../../../extensions/select-and-drag/hooks/useResize';
import { 
  SelectableSchemaNode, 
  SelectableContainer 
} from './SelectableComponents';

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
  
  const selected = isSelected(schema.id);
  const hovered = isHovered(schema.id);
  
  if (schema.type === 'Container' || schema.children?.length) {
    return (
      <SelectableContainer
        schema={schema}
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
        {schema.children?.map((child) => (
          <SelectableSchemaNodeRecursive key={child.id} schema={child} />
        ))}
      </SelectableContainer>
    );
  }
  
  return (
    <SelectableSchemaNode
      schema={schema}
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
