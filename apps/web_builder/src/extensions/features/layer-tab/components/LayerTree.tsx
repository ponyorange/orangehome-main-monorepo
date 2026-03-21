import React, { useMemo, useState } from 'react';
import { Empty } from '@douyinfe/semi-ui';
import { LayerPanel } from './LayerPanel';
import { LayerItem } from './LayerItem';
import { useLayerTree, type LayerDropPosition, type LayerTreeNode } from '../hooks/useLayerTree';

function collectIds(nodes: LayerTreeNode[]): string[] {
  return nodes.flatMap((node) => [node.id, ...collectIds(node.children)]);
}

export const LayerTree: React.FC = () => {
  const { tree, selectedIds, selectNode, moveLayer } = useLayerTree();
  const [expandedIds, setExpandedIds] = useState<string[] | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dropTarget, setDropTarget] = useState<{ id: string; position: LayerDropPosition } | null>(null);

  const allIds = useMemo(() => collectIds(tree), [tree]);
  const effectiveExpandedIds = expandedIds ?? allIds;

  const toggleExpand = (id: string) => {
    setExpandedIds((current) => {
      const base = current ?? allIds;
      return base.includes(id)
        ? base.filter((item) => item !== id)
        : [...base, id];
    });
  };

  const renderNode = (node: LayerTreeNode): React.ReactNode => {
    const expanded = effectiveExpandedIds.includes(node.id);
    const isSelected = selectedIds.includes(node.id);
    const nodeDropPosition = dropTarget?.id === node.id ? dropTarget.position : null;

    return (
      <React.Fragment key={node.id}>
        <LayerItem
          node={node}
          expanded={expanded}
          isSelected={isSelected}
          dropPosition={nodeDropPosition}
          onToggleExpand={toggleExpand}
          onSelect={selectNode}
          onDragStart={setDraggingId}
          onDragEnd={() => {
            setDraggingId(null);
            setDropTarget(null);
          }}
          onDragOverPositionChange={(id, position) => setDropTarget({ id, position })}
          onDrop={(id, position) => {
            if (draggingId) {
              moveLayer(draggingId, id, position);
            }
            setDraggingId(null);
            setDropTarget(null);
          }}
        />
        {expanded && node.children.map((child) => renderNode(child))}
      </React.Fragment>
    );
  };

  if (tree.length === 0) {
    return (
      <LayerPanel count={0}>
        <Empty description="暂无图层" />
      </LayerPanel>
    );
  }

  return (
    <LayerPanel count={allIds.length}>
      <div onDragOver={(event) => event.preventDefault()}>
        {tree.map((node) => renderNode(node))}
      </div>
    </LayerPanel>
  );
};
