import { IExtension, IExtensionContext } from '../../../core/extensions/types';
import { LayerTab } from './components/LayerTab';

export class LayerTabExtension implements IExtension {
  id = 'layer-tab';
  name = 'Layer Tab';
  version = '1.0.0';
  dependencies = ['left-panel'];

  init(context: IExtensionContext): void {
    // 只注册 tab 按钮到 left-panel:tabs
    // 内容由 LeftPanel 直接渲染，不再通过 slot 系统
    context.registerSlot('left-panel:tabs', {
      id: 'layer-tab',
      component: LayerTab,
      order: 5, // 在组件tab之前（组件tab order=10）
    });
  }
}

export * from './components/LayerTab';
export * from './components/LayerTree';
export * from './components/LayerPanel';
export * from './components/LayerItem';
export * from './hooks/useLayerTree';
