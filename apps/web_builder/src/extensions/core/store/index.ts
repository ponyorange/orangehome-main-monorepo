import { IExtension, IExtensionContext } from '../../../core/extensions/types';

/**
 * Store 扩展
 * 提供全局状态管理能力
 */
export const StoreExtension: IExtension = {
  id: 'core.store',
  name: 'Store Extension',
  version: '0.1.0',
  dependencies: [],

  async init(_context: IExtensionContext): Promise<void> {
    console.log('[StoreExtension] Initializing...');
    // 后续实现：初始化 Zustand store
  },

  async activate(): Promise<void> {
    console.log('[StoreExtension] Activated');
  },

  async deactivate(): Promise<void> {
    console.log('[StoreExtension] Deactivated');
  },
};

export default StoreExtension;
