/**
 * SlotRenderer - 动态插槽渲染器
 * 根据类型渲染对应的所有插槽组件
 */

import React, { Suspense } from 'react';
import { useSlots } from './LayoutContext';
import type { SlotType, LayoutSlot } from './types';

export interface SlotRendererProps {
  /** 插槽类型 */
  type: SlotType;
  /** 空插槽时的占位内容 */
  emptyPlaceholder?: React.ReactNode;
  /** 包裹插槽的容器类名 */
  className?: string;
  /** 包裹插槽的容器样式 */
  style?: React.CSSProperties;
  /** 是否垂直排列（默认 true） */
  vertical?: boolean;
}

export function SlotRenderer({
  type,
  emptyPlaceholder,
  className,
  style,
  vertical = true,
}: SlotRendererProps) {
  const slots = useSlots(type);

  if (slots.length === 0 && emptyPlaceholder) {
    return (
      <div className={className} style={style} data-slot-type={type} data-empty>
        {emptyPlaceholder}
      </div>
    );
  }

  const containerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: vertical ? 'column' : 'row',
    ...style,
  };

  return (
    <div className={className} style={containerStyle} data-slot-type={type}>
      {slots.map((slot) => (
        <SlotItem key={slot.id} slot={slot} />
      ))}
    </div>
  );
}

/** 单个插槽项渲染 */
function SlotItem({ slot }: { slot: LayoutSlot }) {
  const Component = slot.component;

  return (
    <div
      className="layout-slot-item"
      data-slot-id={slot.id}
      data-slot-type={slot.type}
      style={{ position: 'relative' }}
    >
      <Suspense fallback={<SlotLoading title={slot.title} />}>
        <Component />
      </Suspense>
    </div>
  );
}

function SlotLoading({ title }: { title?: string }) {
  return (
    <div style={{ padding: 16, color: '#999', fontSize: 12 }}>
      {title ? `加载 ${title}...` : '加载中...'}
    </div>
  );
}
