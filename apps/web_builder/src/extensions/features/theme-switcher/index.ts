import type { IExtension, IExtensionContext } from '../../../core/extensions/types';
import { ThemeSwitcherPanel } from './components/ThemeSwitcherPanel';

/**
 * 主题切换已迁至「设置 → 切换主题」弹层；本扩展保留类与面板导出供兼容，不再注册顶栏插槽。
 */
export class ThemeSwitcherExtension implements IExtension {
  id = 'theme-switcher';
  name = 'Theme Switcher';
  version = '1.0.0';

  init(_context: IExtensionContext): void {
    // 不再占用 header:right；由 editor-header-chrome 提供设置入口
  }
}

export { ThemeSwitcherPanel };
