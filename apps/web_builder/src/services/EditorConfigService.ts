import { injectable } from '../container';

export const EditorConfigService = Symbol('EditorConfigService');
export interface IEditorConfigService {
  getEditorName(): string;
}

@injectable()
export class EditorConfigServiceImpl implements IEditorConfigService {
  getEditorName(): string {
    return 'Orange Editor';
  }
}
