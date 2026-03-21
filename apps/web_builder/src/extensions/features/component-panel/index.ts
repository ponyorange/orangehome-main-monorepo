import { IExtension, IExtensionContext } from '../../../core/extensions/types';

/**
 * Component Panel 扩展
 * 组件面板，展示可拖拽的组件列表
 */
export const ComponentPanelExtension: IExtension = {
  id: 'features.component-panel',
  name: 'Component Panel',
  version: '0.1.0',
  dependencies: ['ui.left-panel'],

  async init(_context: IExtensionContext): Promise<void> {
    console.log('[ComponentPanelExtension] Initializing...');
    // 后续实现：注册到 left-panel:tabs
  },

  async activate(): Promise<void> {
    console.log('[ComponentPanelExtension] Activated');
  },
};

export default ComponentPanelExtension;
