import { defaultContainer } from './index';
import {
  EditorConfigService,
  EditorConfigServiceImpl,
} from '../services/EditorConfigService';
import { StoreContribution } from '../extensions/store';
import { TEST_SCHEMA } from '../demo/testSchema';

/**
 * 注册默认容器绑定（测试服务等）
 */
export function registerDefaultBindings(): void {
  defaultContainer
    .bind(EditorConfigService)
    .to(EditorConfigServiceImpl)
    .inSingletonScope();

  defaultContainer
    .bind(StoreContribution)
    .toConstantValue({
      getInitialState: () => ({ schema: TEST_SCHEMA }),
    });
}
