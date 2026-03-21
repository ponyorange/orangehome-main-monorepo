import { IExtension, IExtensionContext } from '../../../core/extensions/types';

/**
 * Select 扩展
 * 组件选择功能
 */
export const SelectExtension: IExtension = {
  id: 'editing.select',
  name: 'Select Extension',
  version: '0.1.0',
  dependencies: ['ui.center-canvas'],

  async init(_context: IExtensionContext): Promise<void> {
    console.log('[SelectExtension] Initializing...');
    // 后续实现：选择逻辑
  },

  async activate(): Promise<void> {
    console.log('[SelectExtension] Activated');
  },
};

export default SelectExtension;
