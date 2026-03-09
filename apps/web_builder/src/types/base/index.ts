/**
 * 事件到动作的映射（如 onClick -> actionId）
 */
export type Event2Action = Record<string, string>;

/**
 * Schema 基础类型定义（参考文档 6.1 节）
 */
export interface ISchema {
  /** 唯一标识 */
  id: string;
  /** 组件名称 */
  name: string;
  /** 组件类型 */
  type: string;
  /** 子节点 */
  children?: ISchema[];
  /** 组件属性 */
  props?: Record<string, unknown>;
  /** 样式属性（内联 style） */
  propStyle?: React.CSSProperties;
  /** 事件绑定映射 */
  event2action?: Event2Action;
  /** 其他扩展字段 */
  [key: string]: unknown;
}
