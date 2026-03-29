/**
 * 远端物料 editorConfigJson 解析后的结构；存于物料目录 store（按 materialUid），不写入 schema。
 */
export interface ISchemaEditorConfigPropItem {
  key: string;
  type: string;
  label?: string;
  placeholder?: string;
  options?: { label: string; value: string }[];
  min?: number;
  max?: number;
  step?: number;
  /** 拖入画布时写入 schema.props[key] 的初始值 */
  initValue?: unknown;
}

/** 物料侧样式默认值（拖入画布时写入 schema.style） */
export interface ISchemaEditorConfigStyleConfig {
  initValue?: Record<string, unknown>;
}

export interface ISchemaEditorConfig {
  uid?: string;
  dependencies?: unknown[];
  props?: ISchemaEditorConfigPropItem[];
  editorCapabilities?: { isContainer?: boolean; hideInComponentList?: boolean };
  styleConfig?: ISchemaEditorConfigStyleConfig;
}
