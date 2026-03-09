/**
 * LayoutRegistry - 布局插槽统一注册
 * 集中注册所有内置插槽组件
 */

import React from 'react';
import { useRegisterSlot } from './LayoutContext';
import { OrangeHomeTitle } from './slots/header/OrangeHomeTitle';
import { VerticalTabContainer } from './slots/leftPanel/VerticalTabContainer';
import { PageHierarchyContent } from './slots/leftPanel/PageHierarchyTab';
import { ComponentLibraryContent } from './slots/leftPanel/ComponentLibraryTab';
import { H5CanvasContent } from './slots/center/H5Canvas';
import { PropertyPanelContent } from './slots/rightPanel/PropertyPanel';
import { HelpButtonContent } from './slots/float/HelpButton';
import type { OrangeDrag } from '../common/base/OrangeDrag';

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

/** 注册所有布局插槽的 Hook */
export function useLayoutRegistry({ addDrag }: LayoutRegistryProps) {
  const register = useRegisterSlot();

  React.useEffect(() => {
    // 1. Header - OrangeHomeTitle
    register({
      id: 'orangehome-title',
      type: 'header',
      priority: 10,
      title: 'OrangeHome',
      component: OrangeHomeTitle,
    });

    // 2. LeftPanel - VerticalTabContainer（容器）
    register({
      id: 'left-panel-tabs',
      type: 'leftPanel',
      priority: 5,
      title: '功能模块',
      component: VerticalTabContainer,
    });

    // 3. LeftPanel Tabs - 页面层级
    register({
      id: 'page-hierarchy-tab',
      type: 'leftPanelTab' as unknown as import('./types').SlotType,
      tabId: 'hierarchy',
      priority: 10,
      title: '层级',
      icon: <TreeIcon />,
      component: PageHierarchyContent,
    });

    // 4. LeftPanel Tabs - 组件库
    const LibrarySlot = () => <ComponentLibraryContent addDrag={addDrag} />;
    register({
      id: 'component-library-tab',
      type: 'leftPanelTab' as unknown as import('./types').SlotType,
      tabId: 'library',
      priority: 20,
      title: '组件',
      icon: <ComponentIcon />,
      component: LibrarySlot,
    });

    // 5. Center - H5Canvas
    const CanvasSlot = () => <H5CanvasContent addDrag={addDrag} />;
    register({
      id: 'h5-canvas',
      type: 'center',
      priority: 10,
      title: 'H5画布',
      component: CanvasSlot,
    });

    // 6. RightPanel - PropertyPanel
    register({
      id: 'property-panel',
      type: 'rightPanel',
      priority: 10,
      title: '属性配置',
      component: PropertyPanelContent,
    });

    // 7. Float - HelpButton
    register({
      id: 'help-button',
      type: 'float',
      priority: 10,
      title: '帮助',
      component: HelpButtonContent,
    });
  }, [register, addDrag]);
}

/** 布局注册组件（用于在 React 组件树中注册） */
export function LayoutRegistry({ addDrag }: LayoutRegistryProps) {
  useLayoutRegistry({ addDrag });
  return null;
}
