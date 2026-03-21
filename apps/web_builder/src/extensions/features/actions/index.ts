import { IExtension, IExtensionContext } from '../../../core/extensions/types';
import { Actions } from './components/Actions';

export class ActionsExtension implements IExtension {
  id = 'actions';
  name = 'Actions';
  version = '1.0.0';

  init(context: IExtensionContext): void {
    context.registerSlot('header:left', {
      id: 'actions',
      component: Actions,
      order: 2,
    });
  }
}

export * from './components/Actions';
