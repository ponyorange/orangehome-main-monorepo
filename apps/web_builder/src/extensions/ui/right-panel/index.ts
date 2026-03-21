import { IExtension, IExtensionContext } from '../../../core/extensions/types';
import { RightPanel } from './components/RightPanel';

export class RightPanelExtension implements IExtension {
  id = 'right-panel';
  name = 'Right Panel UI';
  version = '1.0.0';

  init(context: IExtensionContext): void {
    // 定义子插槽
    context.defineSlot('right-panel:top');
    context.defineSlot('right-panel:content');
    context.defineSlot('right-panel:bottom');

    // 注册 RightPanel 容器到 right-panel 插槽
    context.registerSlot('right-panel', {
      id: 'right-panel-container',
      component: RightPanel,
      order: 1,
    });
  }
}

export * from './components/RightPanel';
