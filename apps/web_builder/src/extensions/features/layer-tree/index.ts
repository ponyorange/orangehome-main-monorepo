import { IExtension, IExtensionContext } from '../../../core/extensions/types';

/**
 * Layer Tree 扩展
 * 图层树面板，展示页面组件层级结构
 */
export const LayerTreeExtension: IExtension = {
  id: 'features.layer-tree',
  name: 'Layer Tree',
  version: '0.1.0',
  dependencies: ['ui.left-panel'],

  async init(_context: IExtensionContext): Promise<void> {
    console.log('[LayerTreeExtension] Initializing...');
    // 后续实现：注册到 left-panel:tabs
  },

  async activate(): Promise<void> {
    console.log('[LayerTreeExtension] Activated');
  },
};

export default LayerTreeExtension;
