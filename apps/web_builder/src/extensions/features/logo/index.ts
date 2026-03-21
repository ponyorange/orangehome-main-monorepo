import { IExtension, IExtensionContext } from '../../../core/extensions/types';
import { Logo } from './components/Logo';

export class LogoExtension implements IExtension {
  id = 'logo';
  name = 'Logo';
  version = '1.0.0';

  init(context: IExtensionContext): void {
    context.registerSlot('header:left', {
      id: 'logo',
      component: Logo,
      order: 1,
    });
  }
}

export * from './components/Logo';
