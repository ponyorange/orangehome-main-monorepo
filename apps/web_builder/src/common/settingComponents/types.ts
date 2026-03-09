/**
 * SettingComponents 类型定义
 * 定义属性配置表单组件的统一接口
 */

import type { ReactNode } from 'react';

/** 配置项基础接口 */
export interface SettingConfig {
  /** 配置项类型（组件标识） */
  type: string;
  /** 对应 schema.props 中的属性名 */
  propKey: string;
  /** 显示标签 */
  label?: string;
  /** 默认值 */
  defaultValue?: unknown;
  /** 其他配置参数 */
  extra?: Record<string, unknown>;
}

/** SettingComponent 统一 props */
export interface SettingComponentProps {
  /** 当前值 */
  value: unknown;
  /** 值变化回调 */
  onChange: (value: unknown) => void;
  /** 配置定义 */
  config: SettingConfig;
}

/** 配置表单组件类型 */
export type SettingComponentType = (props: SettingComponentProps) => ReactNode;

/** editor.json 结构定义 */
export interface IEditorConfig {
  /** 组件标识（对应 schema.type） */
  componentType: string;
  /** 显示名称 */
  displayName?: string;
  /** 图标 */
  icon?: string;
  /** 可配置属性列表 */
  props: SettingConfig[];
}
