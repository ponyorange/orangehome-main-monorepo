/**
 * EditorConfigLoader - 组件配置加载服务
 * 根据组件 type 加载对应的 editor.json
 */

import 'reflect-metadata';
import { injectable } from 'inversify';
import type { IEditorConfig } from '../common/settingComponents/types';

export const EditorConfigLoader = Symbol('EditorConfigLoader');

export interface IEditorConfigLoader {
  /** 加载组件配置 */
  load(componentType: string): Promise<IEditorConfig | null>;
  /** 获取已缓存的配置 */
  getCached(componentType: string): IEditorConfig | undefined;
  /** 清除缓存 */
  clearCache(): void;
  /** 注册静态配置（用于内置组件） */
  registerStatic(componentType: string, config: IEditorConfig): void;
}

/** 内置组件的默认配置 */
const DEFAULT_CONFIGS: Record<string, IEditorConfig> = {
  button: {
    componentType: 'button',
    displayName: '按钮',
    props: [
      { type: 'input', propKey: 'text', label: '按钮文字', defaultValue: '按钮' },
      { type: 'color', propKey: 'backgroundColor', label: '背景色', defaultValue: '#ff6b00' },
      { type: 'color', propKey: 'color', label: '文字颜色', defaultValue: '#ffffff' },
    ],
  },
  div: {
    componentType: 'div',
    displayName: '容器',
    props: [
      { type: 'color', propKey: 'backgroundColor', label: '背景色', defaultValue: 'transparent' },
      { type: 'number', propKey: 'padding', label: '内边距', defaultValue: 16, extra: { min: 0, max: 100 } },
    ],
  },
  image: {
    componentType: 'image',
    displayName: '图片',
    props: [
      { type: 'image', propKey: 'src', label: '图片地址' },
      { type: 'input', propKey: 'alt', label: '替代文本', defaultValue: '' },
      { type: 'number', propKey: 'width', label: '宽度', extra: { min: 0 } },
      { type: 'number', propKey: 'height', label: '高度', extra: { min: 0 } },
    ],
  },
};

@injectable()
export class EditorConfigLoaderImpl implements IEditorConfigLoader {
  private _cache = new Map<string, IEditorConfig>();
  private _staticConfigs = new Map<string, IEditorConfig>();

  constructor() {
    // 注册内置默认配置
    for (const [type, config] of Object.entries(DEFAULT_CONFIGS)) {
      this._staticConfigs.set(type, config);
      this._cache.set(type, config);
    }
  }

  async load(componentType: string): Promise<IEditorConfig | null> {
    // 1. 检查缓存
    const cached = this._cache.get(componentType);
    if (cached) return cached;

    // 2. 检查静态配置
    const staticConfig = this._staticConfigs.get(componentType);
    if (staticConfig) {
      this._cache.set(componentType, staticConfig);
      return staticConfig;
    }

    // 3. 尝试远程加载（实际项目中从服务器或 CDN 加载 editor.json）
    try {
      // 示例：/components/{type}/editor.json
      const response = await fetch(`/components/${componentType}/editor.json`);
      if (response.ok) {
        const config: IEditorConfig = await response.json();
        this._cache.set(componentType, config);
        return config;
      }
    } catch (err) {
      console.warn(`[EditorConfigLoader] Failed to load config for ${componentType}:`, err);
    }

    // 4. 返回 null 表示无法加载
    return null;
  }

  getCached(componentType: string): IEditorConfig | undefined {
    return this._cache.get(componentType);
  }

  clearCache(): void {
    this._cache.clear();
    // 重新加载静态配置
    for (const [type, config] of Object.entries(DEFAULT_CONFIGS)) {
      this._cache.set(type, config);
    }
  }

  registerStatic(componentType: string, config: IEditorConfig): void {
    this._staticConfigs.set(componentType, config);
    this._cache.set(componentType, config);
  }
}

export { DEFAULT_CONFIGS };
