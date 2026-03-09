/**
 * SettingComponents 入口
 * 导出所有配置表单组件
 */

export * from './types';
export { TextInput } from './TextInput';
export { NumberInput } from './NumberInput';
export { ColorPicker } from './ColorPicker';
export { ImageUpload } from './ImageUpload';

/** 组件映射表 */
import type { SettingComponentType } from './types';
import { TextInput } from './TextInput';
import { NumberInput } from './NumberInput';
import { ColorPicker } from './ColorPicker';
import { ImageUpload } from './ImageUpload';

export const SETTING_COMPONENTS: Record<string, SettingComponentType> = {
  '@orangehome/settingcomponent-input': TextInput,
  '@orangehome/settingcomponent-number': NumberInput,
  '@orangehome/settingcomponent-colorpicker': ColorPicker,
  '@orangehome/settingcomponent-imageupload': ImageUpload,
  // 简写别名
  'input': TextInput,
  'number': NumberInput,
  'color': ColorPicker,
  'image': ImageUpload,
};

/** 获取配置组件 */
export function getSettingComponent(type: string): SettingComponentType | undefined {
  return SETTING_COMPONENTS[type];
}
