import { IExtension, IExtensionContext } from '../../../core/extensions/types';
import { ComponentTab } from './components/ComponentTab';

export class ComponentTabExtension implements IExtension {
  id = 'component-tab';
  name = 'Component Tab';
  version = '1.0.0';
  dependencies = ['left-panel'];

  init(context: IExtensionContext): void {
    // 只注册 tab 按钮到 left-panel:tabs
    // 内容由 LeftPanel 直接渲染，不再通过 slot 系统
    context.registerSlot('left-panel:tabs', {
      id: 'component-tab',
      component: ComponentTab,
      order: 10,
    });
  }
}

export * from './components/ComponentTab';
export * from './components/ComponentPanel';
