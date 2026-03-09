import { defaultContainer } from './index';
import {
  EditorConfigService,
  EditorConfigServiceImpl,
} from '../services/EditorConfigService';
import {
  EditorConfigLoader,
  EditorConfigLoaderImpl,
} from '../services/EditorConfigLoader';
import {
  LayoutService,
  LayoutServiceImpl,
} from '../layout';
import { StoreContribution } from '../extensions/store';
import { TEST_SCHEMA } from '../demo/testSchema';

/**
 * 注册默认容器绑定（测试服务等）
 */
export function registerDefaultBindings(): void {
  // 编辑器配置服务
  defaultContainer
    .bind(EditorConfigService)
    .to(EditorConfigServiceImpl)
    .inSingletonScope();

  // 组件配置加载服务
  defaultContainer
    .bind(EditorConfigLoader)
    .to(EditorConfigLoaderImpl)
    .inSingletonScope();

  // 布局服务
  defaultContainer
    .bind(LayoutService)
    .to(LayoutServiceImpl)
    .inSingletonScope();

  // Store 初始状态贡献（测试 schema）
  defaultContainer
    .bind(StoreContribution)
    .toConstantValue({
      getInitialState: () => ({ schema: TEST_SCHEMA }),
    });
}
