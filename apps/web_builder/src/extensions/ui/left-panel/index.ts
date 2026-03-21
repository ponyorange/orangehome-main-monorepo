import { IExtension, IExtensionContext } from '../../../core/extensions/types';
import { LeftPanel } from './components/LeftPanel';
import { useLeftPanelStore } from './store';

export class LeftPanelExtension implements IExtension {
  id = 'left-panel';
  name = 'Left Panel UI';
  version = '1.0.0';

  init(context: IExtensionContext): void {
    // 定义子插槽
    context.defineSlot('left-panel:tabs');      // 竖向 tabs
    context.defineSlot('left-panel:top');
    context.defineSlot('left-panel:content');
    context.defineSlot('left-panel:bottom');

    // 注册 LeftPanel 容器到 left-panel 插槽
    context.registerSlot('left-panel', {
      id: 'left-panel-container',
      component: LeftPanel,
      order: 1,
    });

    // 设置 store 的事件发射器
    useLeftPanelStore.getState().setEventEmitter((event: string, data: any) => {
      context.emit(event, data);
    });
  }
}

export * from './components/LeftPanel';
export * from './components/TabButton';
export * from './store';
