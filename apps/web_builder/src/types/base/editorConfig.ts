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
}

export interface ISchemaEditorConfig {
  uid?: string;
  dependencies?: unknown[];
  props?: ISchemaEditorConfigPropItem[];
  editorCapabilities?: { isContainer?: boolean };
}
