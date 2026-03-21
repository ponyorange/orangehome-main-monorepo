import { IExtension, IExtensionContext } from '../../../core/extensions/types';

/**
 * Event System 扩展
 * 核心事件系统扩展
 */
export const EventSystemExtension: IExtension = {
  id: 'core.event-system',
  name: 'Event System',
  version: '0.1.0',
  dependencies: [],

  async init(_context: IExtensionContext): Promise<void> {
    console.log('[EventSystemExtension] Initializing...');
    // 事件系统已在 OrangeEditor 中初始化
  },
};

export default EventSystemExtension;
