import { useCallback, useMemo } from 'react';
import type { ISchema } from '../../../../types/base';
import { useSchemaStore } from '../../../../core/store/schemaStore';
import { useSelectionStore } from '../../../../core/store/selectionStore';
import { addChild, findById, findParentById, moveNode, removeById } from '../../../../common/base/schemaOperator';

export interface LayerTreeNode {
  id: string;
  name: string;
  type: string;
  level: number;
  isContainer: boolean;
  children: LayerTreeNode[];
}

export type LayerDropPosition = 'before' | 'after' | 'inside';

function buildTree(node: ISchema, level: number): LayerTreeNode {
  return {
    id: node.id,
    name: node.name,
    type: node.type,
    level,
    isContainer: node.type === 'Container' || node.children.length > 0,
    children: node.children.map((child) => buildTree(child, level + 1)),
  };
}

function moveNodeByPosition(
  schema: ISchema,
  sourceId: string,
  targetId: string,
  position: LayerDropPosition
): ISchema | null {
  if (sourceId === targetId) return schema;

  const target = findById(schema, targetId);
  const sourceParent = findParentById(schema, sourceId);
  if (!target || !sourceParent) return null;

  if (position === 'inside' && target.type === 'Container') {
    return moveNode(schema, sourceId, target.id);
  }

  const targetParent = findParentById(schema, targetId);
  if (!targetParent) return null;

  const sourceIndex = sourceParent.children.findIndex((child) => child.id === sourceId);
  const targetIndex = targetParent.children.findIndex((child) => child.id === targetId);
  if (sourceIndex === -1 || targetIndex === -1) return null;

  let insertIndex = position === 'before' ? targetIndex : targetIndex + 1;
  if (sourceParent.id === targetParent.id && sourceIndex < insertIndex) {
    insertIndex -= 1;
  }

  return moveNode(schema, sourceId, targetParent.id, insertIndex);
}

export function useLayerTree() {
  const { schema, setSchema } = useSchemaStore();
  const selectedIds = useSelectionStore((state) => state.selectedIds);
  const setSelectedIds = useSelectionStore((state) => state.setSelectedIds);

  const tree = useMemo(() => schema.children.map((child) => buildTree(child, 0)), [schema]);

  const selectNode = useCallback((id: string, multi = false) => {
    if (!multi) {
      setSelectedIds([id]);
      return;
    }

    setSelectedIds(
      selectedIds.includes(id)
        ? selectedIds.filter((currentId) => currentId !== id)
        : [...selectedIds, id]
    );
  }, [selectedIds, setSelectedIds]);

  const moveLayer = useCallback((sourceId: string, targetId: string, position: LayerDropPosition) => {
    const updated = moveNodeByPosition(schema, sourceId, targetId, position);
    if (updated) {
      setSchema(updated);
      setSelectedIds([sourceId]);
    }
  }, [schema, setSchema, setSelectedIds]);

  const reorderToRoot = useCallback((sourceId: string, index: number) => {
    const sourceNode = findById(schema, sourceId);
    const sourceParent = findParentById(schema, sourceId);
    if (!sourceNode || !sourceParent) return;

    const sourceIndex = sourceParent.children.findIndex((child) => child.id === sourceId);
    let updated = removeById(schema, sourceId);
    const insertIndex = sourceParent.id === schema.id && sourceIndex < index ? index - 1 : index;
    updated = addChild(updated, schema.id, sourceNode, insertIndex);
    setSchema(updated);
    setSelectedIds([sourceId]);
  }, [schema, setSchema, setSelectedIds]);

  return {
    tree,
    selectedIds,
    selectNode,
    moveLayer,
    reorderToRoot,
  };
}
