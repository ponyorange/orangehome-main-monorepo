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
        padding: '12px 4px',
        borderRadius: 6,
        border: '1px solid #eee',
        cursor: 'grab',
        userSelect: 'none',
        transition: 'all 0.15s',
        background: '#fff',
      }}
      onMouseEnter={(e) => {
        const t = e.currentTarget;
        t.style.background = 'var(--theme-primary-light-bg, #fff7f0)';
        t.style.borderColor = 'var(--theme-primary, #fa8c35)';
        t.style.boxShadow = '0 2px 6px rgba(0,0,0,0.08)';
      }}
      onMouseLeave={(e) => {
        const t = e.currentTarget;
        t.style.background = '#fff';
        t.style.borderColor = '#eee';
        t.style.boxShadow = 'none';
      }}
    >
      <span style={{ fontSize: 22, lineHeight: 1 }}>{item.icon}</span>
      <span style={{ fontSize: 12, color: '#666' }}>{item.name}</span>
    </div>
  );
};
