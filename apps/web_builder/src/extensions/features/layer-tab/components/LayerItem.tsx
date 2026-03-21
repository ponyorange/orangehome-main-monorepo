import React, { useMemo } from 'react';
import type { LayerDropPosition, LayerTreeNode } from '../hooks/useLayerTree';

interface LayerItemProps {
  node: LayerTreeNode;
  expanded: boolean;
  isSelected: boolean;
  dropPosition: LayerDropPosition | null;
  onToggleExpand: (id: string) => void;
  onSelect: (id: string, multi: boolean) => void;
  onDragStart: (id: string) => void;
  onDragEnd: () => void;
  onDragOverPositionChange: (id: string, position: LayerDropPosition) => void;
  onDrop: (id: string, position: LayerDropPosition) => void;
}

function getTypeIcon(type: string): string {
  switch (type) {
    case 'Text':
      return 'T';
    case 'Image':
      return 'IMG';
    case 'Button':
      return 'BTN';
    case 'Container':
      return 'BOX';
    default:
      return 'CMP';
  }
}

export const LayerItem: React.FC<LayerItemProps> = ({
  node,
  expanded,
  isSelected,
  dropPosition,
  onToggleExpand,
  onSelect,
  onDragStart,
  onDragEnd,
  onDragOverPositionChange,
  onDrop,
}) => {
  const dropIndicatorStyle = useMemo<React.CSSProperties>(() => {
    if (dropPosition === 'before') {
      return { boxShadow: 'inset 0 2px 0 var(--theme-primary)' };
    }
    if (dropPosition === 'after') {
      return { boxShadow: 'inset 0 -2px 0 var(--theme-primary)' };
    }
    if (dropPosition === 'inside') {
      return { background: 'var(--theme-surface-accent)' };
    }
    return {};
  }, [dropPosition]);

  return (
    <div
      draggable
      onDragStart={() => onDragStart(node.id)}
      onDragEnd={onDragEnd}
      onDragOver={(event) => {
        event.preventDefault();
        event.stopPropagation();

        const rect = event.currentTarget.getBoundingClientRect();
        const offsetY = event.clientY - rect.top;
        const position =
          offsetY < rect.height * 0.25
            ? 'before'
            : offsetY > rect.height * 0.75
              ? 'after'
              : node.isContainer
                ? 'inside'
                : 'after';

        onDragOverPositionChange(node.id, position);
      }}
      onDrop={(event) => {
        event.preventDefault();
        event.stopPropagation();

        const rect = event.currentTarget.getBoundingClientRect();
        const offsetY = event.clientY - rect.top;
        const position =
          offsetY < rect.height * 0.25
            ? 'before'
            : offsetY > rect.height * 0.75
              ? 'after'
              : node.isContainer
                ? 'inside'
                : 'after';

        onDrop(node.id, position);
      }}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        padding: '6px 8px',
        marginLeft: node.level * 16,
        borderRadius: 16,
        cursor: 'pointer',
        background: isSelected ? 'var(--theme-gradient-panel)' : 'transparent',
        border: isSelected ? '1px solid var(--theme-border-glow)' : '1px solid transparent',
        boxShadow: isSelected ? 'var(--theme-shadow-sm)' : 'none',
        color: 'var(--theme-text-primary)',
        userSelect: 'none',
        ...dropIndicatorStyle,
      }}
      onClick={(event) => {
        event.stopPropagation();
        const isMulti = event.ctrlKey || event.metaKey;
        onSelect(node.id, isMulti);
        if (!isMulti && isSelected && node.children.length > 0) {
          onToggleExpand(node.id);
        }
      }}
    >
      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          if (node.children.length > 0) {
            onToggleExpand(node.id);
          }
        }}
        style={{
          width: 16,
          height: 16,
          border: 'none',
          background: 'transparent',
          padding: 0,
          cursor: node.children.length > 0 ? 'pointer' : 'default',
          color: 'var(--theme-text-disabled)',
          flexShrink: 0,
        }}
      >
        {node.children.length > 0 ? (expanded ? '▾' : '▸') : ''}
      </button>

      <span
        style={{
          minWidth: 32,
          fontSize: 11,
          color: 'var(--theme-text-secondary)',
          fontFamily: 'monospace',
          flexShrink: 0,
        }}
      >
        {getTypeIcon(node.type)}
      </span>

      <span
        style={{
          flex: 1,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          fontSize: 12,
          fontWeight: isSelected ? 700 : 500,
        }}
      >
        {node.name}
      </span>
    </div>
  );
};
