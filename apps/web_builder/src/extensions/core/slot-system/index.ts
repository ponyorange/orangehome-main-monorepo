import { IExtension, IExtensionContext } from '../../../core/extensions/types';

/**
 * Slot System 扩展
 * 核心插槽系统扩展
 */
export const SlotSystemExtension: IExtension = {
  id: 'core.slot-system',
  name: 'Slot System',
  version: '0.1.0',
  dependencies: [],

  async init(_context: IExtensionContext): Promise<void> {
    console.log('[SlotSystemExtension] Initializing...');
    // 插槽系统已在 OrangeEditor 中初始化
  },
};

export default SlotSystemExtension;
