import { IExtension, IExtensionContext } from '../../../core/extensions/types';
import { Toolbar } from './components/Toolbar';

export class ToolbarExtension implements IExtension {
  id = 'toolbar';
  name = 'Toolbar';
  version = '1.0.0';

  init(context: IExtensionContext): void {
    context.registerSlot('header:center', {
      id: 'toolbar',
      component: Toolbar,
      order: 1,
    });
  }
}

export * from './components/Toolbar';
