/**
 * LayoutRegistry - 布局插槽统一注册
 * 集中注册所有内置插槽组件
 */

import React, { useRef } from 'react';
import { useRegisterSlot } from './LayoutContext';
import { OrangeHomeTitle } from './slots/header/OrangeHomeTitle';
import { VerticalTabContainer } from './slots/leftPanel/VerticalTabContainer';
import { PageHierarchyContent } from './slots/leftPanel/PageHierarchyTab';
import { ComponentLibraryContent } from './slots/leftPanel/ComponentLibraryTab';
import { H5CanvasContent } from './slots/center/H5Canvas';
import { PropertyPanelContent } from './slots/rightPanel/PropertyPanel';
import { HelpButtonContent } from './slots/float/HelpButton';
import type { OrangeDrag } from '../common/base/OrangeDrag';
import type { LayoutSlot } from './types';

// 简单的占位图标
const TreeIcon = () => (
  <span style={{ fontSize: 16, color: '#ff6b00' }}>🌲</span>
);
const ComponentIcon = () => (
  <span style={{ fontSize: 16, color: '#ff6b00' }}>📦</span>
);

export interface LayoutRegistryProps {
  /** 添加组件用的拖拽实例 */
  addDrag: OrangeDrag | null;
}

// 静态插槽定义（不依赖 addDrag 的）
const STATIC_SLOTS: Omit<LayoutSlot, 'component'>[] = [
  {
    id: 'orangehome-title',
    type: 'header',
    priority: 10,
    title: 'OrangeHome',
  },
  {
    id: 'left-panel-tabs',
    type: 'leftPanel',
    priority: 5,
    title: '功能模块',
  },
  {
    id: 'page-hierarchy-tab',
    type: 'leftPanelTab' as unknown as import('./types').SlotType,
    tabId: 'hierarchy',
    priority: 10,
    title: '层级',
    icon: <TreeIcon />,
  },
  {
    id: 'property-panel',
    type: 'rightPanel',
    priority: 10,
    title: '属性配置',
  },
  {
    id: 'help-button',
    type: 'float',
    priority: 10,
    title: '帮助',
  },
];

// 创建稳定的动态组件包装器
function createLibrarySlot(addDrag: OrangeDrag | null) {
  return function LibrarySlot() {
    return <ComponentLibraryContent addDrag={addDrag} />;
  };
}

function createCanvasSlot(addDrag: OrangeDrag | null) {
  return function CanvasSlot() {
    return <H5CanvasContent addDrag={addDrag} />;
  };
}

/** 注册所有布局插槽的 Hook */
export function useLayoutRegistry({ addDrag }: LayoutRegistryProps) {
  const register = useRegisterSlot();
  const hasRegistered = useRef(false);

  // 使用 ref 存储 addDrag，避免 effect 重新执行
  const addDragRef = useRef(addDrag);
  addDragRef.current = addDrag;

  // 只注册一次所有插槽
  React.useEffect(() => {
    if (hasRegistered.current) return;
    hasRegistered.current = true;

    // 1. Header
    register({
      ...STATIC_SLOTS[0],
      component: OrangeHomeTitle,
    });

    // 2. LeftPanel 容器
    register({
      ...STATIC_SLOTS[1],
      component: VerticalTabContainer,
    });

    // 3. LeftPanel Tab - 层级
    register({
      ...STATIC_SLOTS[2],
      component: PageHierarchyContent,
    });

    // 4. LeftPanel Tab - 组件库（使用当前 addDrag）
    register({
      id: 'component-library-tab',
      type: 'leftPanelTab' as unknown as import('./types').SlotType,
      tabId: 'library',
      priority: 20,
      title: '组件',
      icon: <ComponentIcon />,
      component: createLibrarySlot(addDragRef.current),
    });

    // 5. Center - H5 画布（使用当前 addDrag）
    register({
      id: 'h5-canvas',
      type: 'center',
      priority: 10,
      title: 'H5画布',
      component: createCanvasSlot(addDragRef.current),
    });

    // 6. RightPanel - 属性面板
    register({
      ...STATIC_SLOTS[3],
      component: PropertyPanelContent,
    });

    // 7. Float - 帮助按钮
    register({
      ...STATIC_SLOTS[4],
      component: HelpButtonContent,
    });
  }, [register]); // 只依赖 register，addDrag 使用 ref
}

/** 布局注册组件（用于在 React 组件树中注册） */
export function LayoutRegistry({ addDrag }: LayoutRegistryProps) {
  useLayoutRegistry({ addDrag });
  return null;
}
