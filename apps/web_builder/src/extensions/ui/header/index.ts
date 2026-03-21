import { IExtension, IExtensionContext } from '../../../core/extensions/types';
import { Header } from './components/Header';

export class HeaderExtension implements IExtension {
  id = 'header';
  name = 'Header UI';
  version = '1.0.0';

  init(context: IExtensionContext): void {
    // 定义子插槽
    context.defineSlot('header:left');
    context.defineSlot('header:center');
    context.defineSlot('header:right');

    // 注册 Header 容器到 header 插槽
    context.registerSlot('header', {
      id: 'header-container',
      component: Header,
      order: 1,
    });
  }
}

export * from './components/Header';
