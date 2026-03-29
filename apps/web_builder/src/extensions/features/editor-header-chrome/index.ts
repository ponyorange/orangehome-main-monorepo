import type { IExtension, IExtensionContext } from '../../../core/extensions/types';
import { UserProfileChip } from './components/UserProfileChip';

export class EditorHeaderChromeExtension implements IExtension {
  id = 'editor-header-chrome';
  name = 'Editor Header Chrome';
  version = '1.0.0';

  init(context: IExtensionContext): void {
    context.registerSlot('header:right', {
      id: 'user-profile',
      component: UserProfileChip,
      order: 1,
      config: { flex: 0 },
    });
  }
}

export { EditorSettingsMenu } from './components/EditorSettingsMenu';
export { UserProfileChip } from './components/UserProfileChip';
