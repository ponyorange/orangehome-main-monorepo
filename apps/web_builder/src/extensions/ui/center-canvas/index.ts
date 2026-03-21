import { IExtension, IExtensionContext } from '../../../core/extensions/types';
import { CenterCanvas } from './components/CenterCanvas';

export class CenterCanvasExtension implements IExtension {
  id = 'center-canvas';
  name = 'Center Canvas UI';
  version = '1.0.0';

  init(context: IExtensionContext): void {
    // 定义子插槽
    context.defineSlot('center:ruler:top');
    context.defineSlot('center:ruler:left');
    context.defineSlot('center:canvas');

    // 注册 CenterCanvas 容器到 center 插槽
    context.registerSlot('center', {
      id: 'center-canvas-container',
      component: CenterCanvas,
      order: 1,
    });
  }
}

export * from './components/CenterCanvas';
