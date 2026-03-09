/**
 * Layout 模块入口
 * 导出所有布局相关组件和类型
 */

// 类型
export * from './types';
export { LayoutService, LayoutServiceImpl, type ILayoutService } from './LayoutService';

// Context 和 Hooks
export {
  LayoutProvider,
  useLayoutService,
  useSlots,
  useSlot,
  useRegisterSlot,
} from './LayoutContext';

// 组件
export { SlotRenderer } from './SlotRenderer';
export { LayoutShell } from './LayoutShell';
export { LayoutRegistry, useLayoutRegistry } from './LayoutRegistry';

// 工具组件
export { CollapsiblePanel } from './components/CollapsiblePanel';

// 插槽组件（可选导出）
export { OrangeHomeTitle } from './slots/header/OrangeHomeTitle';
export { VerticalTabContainer } from './slots/leftPanel/VerticalTabContainer';
export { PageHierarchyContent, usePageHierarchyTab } from './slots/leftPanel/PageHierarchyTab';
export { ComponentLibraryContent, useComponentLibraryTab } from './slots/leftPanel/ComponentLibraryTab';
export { H5CanvasContent, useH5CanvasSlot } from './slots/center/H5Canvas';
export { PropertyPanelContent, usePropertyPanelSlot } from './slots/rightPanel/PropertyPanel';
export { HelpButtonContent, useHelpButtonSlot } from './slots/float/HelpButton';
