import React, { useRef, useCallback } from 'react';
import { OrangeDrag } from '../../../../common/base/OrangeDrag';
import type { ComponentCatalogItem } from '../catalog';

interface Props {
  item: ComponentCatalogItem;
}

export const DraggableComponentItem: React.FC<Props> = ({ item }) => {
  const dragRef = useRef(new OrangeDrag());

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    dragRef.current.start(e.nativeEvent, {
      type: 'add-component',
      componentType: item.type,
      componentName: item.name,
      defaultSchema: item.createSchema(),
    });
  }, [item]);

  return (
    <div
      onMouseDown={handleMouseDown}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 4,
        padding: '14px 8px',
        borderRadius: 20,
        border: '1px solid var(--theme-border-soft)',
        cursor: 'grab',
        userSelect: 'none',
        transition: 'all 0.18s ease',
        background: 'linear-gradient(180deg, rgba(255,255,255,0.86) 0%, rgba(255,255,255,0.68) 100%)',
        boxShadow: 'var(--theme-shadow-sm)',
        backdropFilter: 'blur(var(--theme-backdrop-blur))',
      }}
      onMouseEnter={(e) => {
        const t = e.currentTarget;
        t.style.background = 'var(--theme-gradient-panel)';
        t.style.borderColor = 'var(--theme-border-glow)';
        t.style.boxShadow = 'var(--theme-shadow-md)';
        t.style.transform = 'translateY(-2px)';
      }}
      onMouseLeave={(e) => {
        const t = e.currentTarget;
        t.style.background = 'linear-gradient(180deg, rgba(255,255,255,0.86) 0%, rgba(255,255,255,0.68) 100%)';
        t.style.borderColor = 'var(--theme-border-soft)';
        t.style.boxShadow = 'var(--theme-shadow-sm)';
        t.style.transform = 'translateY(0)';
      }}
    >
      <span style={{ fontSize: 22, lineHeight: 1, color: 'var(--theme-primary)' }}>{item.icon}</span>
      <span style={{ fontSize: 12, color: 'var(--theme-text-secondary)', fontWeight: 600 }}>{item.name}</span>
    </div>
  );
};
