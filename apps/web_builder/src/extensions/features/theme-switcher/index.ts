import { IExtension, IExtensionContext } from '../../../core/extensions/types';
import { ThemeSwitcherPanel } from './components/ThemeSwitcherPanel';

export class ThemeSwitcherExtension implements IExtension {
  id = 'theme-switcher';
  name = 'Theme Switcher';
  version = '1.0.0';

  init(context: IExtensionContext): void {
    // 注册到header:right位置
    context.registerSlot('header:right', {
      id: 'theme-switcher',
      component: ThemeSwitcherPanel,
      order: 100,
    });
  }
}

export { ThemeSwitcherPanel };
