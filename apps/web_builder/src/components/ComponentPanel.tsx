/**
 * 组件库面板（左侧）：可拖拽添加的组件列表
 */
import React from 'react';
import type { OrangeDrag } from '../common/base/OrangeDrag';

export interface ComponentItem {
  type: string;
  name: string;
  icon?: React.ReactNode;
}

const DEFAULT_ITEMS: ComponentItem[] = [
  { type: 'button', name: '按钮' },
  { type: 'div', name: '容器' },
  { type: 'image', name: '图片' },
];

export interface ComponentPanelProps {
  items?: ComponentItem[];
  /** 外部传入的 OrangeDrag 实例，用于从面板拖拽到画布 */
  addDrag: OrangeDrag | null;
}

export function ComponentPanel({
  items = DEFAULT_ITEMS,
  addDrag,
}: ComponentPanelProps) {
  const handleMouseDown = (e: React.MouseEvent, item: ComponentItem) => {
    if (e.button !== 0 || !addDrag) return;
    (e.currentTarget as HTMLElement).setAttribute('data-drag-label', item.name);
    addDrag.mousedown(e.currentTarget as HTMLElement, e.clientX, e.clientY, { type: item.type, name: item.name });
  };

  return (
    <div className="orange-component-panel">
      <div className="orange-component-panel-title">组件库</div>
      <ul className="orange-component-panel-list">
        {items.map((item) => (
          <li
            key={item.type}
            className="orange-component-panel-item"
            data-drag-source
            data-component-type={item.type}
            onMouseDown={(e) => handleMouseDown(e, item)}
          >
            {item.icon ?? <span className="orange-component-panel-icon" />}
            <span>{item.name}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
