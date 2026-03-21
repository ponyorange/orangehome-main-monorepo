import { IExtension, IExtensionContext } from '../../../core/extensions/types';
import { PropertiesPanel } from './components/PropertiesPanel';

export class PropertiesPanelExtension implements IExtension {
  id = 'properties-panel';
  name = 'Properties Panel';
  version = '1.0.0';

  init(context: IExtensionContext): void {
    context.registerSlot('right-panel:content', {
      id: 'properties-panel',
      component: PropertiesPanel,
      order: 10,
    });
  }
}

export * from './components/PropertiesPanel';
