/**
 * ComponentLibraryTab - 组件库 Tab（左侧面板）
 * 可拖拽添加的组件列表
 */

import React from 'react';
import { useRegisterSlot } from '../../LayoutContext';
import type { TabSlot } from '../../types';
import type { OrangeDrag } from '../../../common/base/OrangeDrag';

export interface ComponentItem {
  type: string;
  name: string;
  icon?: React.ReactNode;
}

// 简单的占位图标组件
const PlaceholderIcon = ({ text }: { text: string }) => (
  <span
    style={{
      width: 20,
      height: 20,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: 12,
      color: '#ff6b00',
      background: 'rgba(255,107,0,0.1)',
      borderRadius: 4,
    }}
  >
    {text}
  </span>
);

const DEFAULT_ITEMS: ComponentItem[] = [
  { type: 'button', name: '按钮', icon: <PlaceholderIcon text="B" /> },
  { type: 'div', name: '容器', icon: <PlaceholderIcon text="□" /> },
  { type: 'image', name: '图片', icon: <PlaceholderIcon text="I" /> },
];

export interface ComponentLibraryTabProps {
  items?: ComponentItem[];
  /** 外部传入的 OrangeDrag 实例，用于从面板拖拽到画布 */
  addDrag: OrangeDrag | null;
}

function ComponentLibraryContent({
  items = DEFAULT_ITEMS,
  addDrag,
}: ComponentLibraryTabProps) {
  const handleMouseDown = (e: React.MouseEvent, item: ComponentItem) => {
    if (e.button !== 0 || !addDrag) return;
    (e.currentTarget as HTMLElement).setAttribute('data-drag-label', item.name);
    addDrag.mousedown(e.currentTarget as HTMLElement, e.clientX, e.clientY, {
      type: item.type,
      name: item.name,
    });
  };

  return (
    <div style={{ padding: 12 }}>
      <div style={{ marginBottom: 12, fontSize: 12, color: '#999' }}>
        拖拽组件到画布
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {items.map((item) => (
          <div
            key={item.type}
            data-drag-source
            data-component-type={item.type}
            onMouseDown={(e) => handleMouseDown(e, item)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '10px 12px',
              borderRadius: 6,
              cursor: 'grab',
              background: '#fff',
              border: '1px solid var(--semi-color-border, #eee)',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#ff6b00';
              e.currentTarget.style.background = 'rgba(255, 107, 0, 0.04)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--semi-color-border, #eee)';
              e.currentTarget.style.background = '#fff';
            }}
          >
            <span style={{ color: '#ff6b00', display: 'flex', alignItems: 'center' }}>
              {item.icon}
            </span>
            <span style={{ fontSize: 13, color: '#333' }}>{item.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/** 组件库 Tab 插槽注册器 */
export function useComponentLibraryTab(addDrag: OrangeDrag | null) {
  const register = useRegisterSlot();

  React.useEffect(() => {
    const ComponentLibrarySlot = () => (
      <ComponentLibraryContent addDrag={addDrag} />
    );

    const unregister = register({
      id: 'component-library-tab',
      type: 'leftPanelTab',
      tabId: 'library',
      priority: 20,
      title: '组件',
      component: ComponentLibrarySlot,
    });
    return unregister;
  }, [register, addDrag]);
}

export { ComponentLibraryContent };
export default ComponentLibraryContent;
