/**
 * CSS 规则类型
 */
export interface ICSSRule {
  [property: string]: string | number;
}

/**
 * 事件动作绑定
 */
export interface IEvent2Action {
  event: string;      // 事件名，如 'onClick', 'onChange'
  action: string;     // 动作类型，如 'navigate', 'api', 'setState'
  target?: string;    // 目标组件ID
  params?: Record<string, unknown>;  // 动作参数
}

/**
 * API 数据配置
 */
export interface IApiInSchema {
  url: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  headers?: Record<string, string>;
  params?: Record<string, unknown>;
  dataPath?: string;  // 数据路径，如 'data.list'
  interval?: number;  // 轮询间隔（毫秒）
}

export type {
  ISchemaEditorConfig,
  ISchemaEditorConfigPropItem,
  ISchemaEditorConfigStyleConfig,
} from './editorConfig';

/**
 * Schema 节点结构
 * 描述页面组件树的 JSON 结构
 */
export interface ISchema {
  id: string;                    // 全局唯一 ID
  name: string;                   // 组件名称（可读）
  type: string;                   // 组件类型（如 'Text'、内置 'Container'、根节点 @orangehome/common-component-rootcontainer）；远端物料为 materialUid
  children: ISchema[];           // 子组件
  props: Record<string, unknown>; // 组件业务属性（不含内联 style；不含 remote，bundle 从组件列表按 type 解析）
  /** 内联样式，与 props 同级；旧数据 props.style 会在反序列化时迁移到此 */
  style?: Record<string, unknown>;
  propStyle?: Record<string, ICSSRule>;  // 样式配置，键为 CSS 选择器
  event2action?: IEvent2Action[];  // 事件动作绑定
  api?: IApiInSchema;            // API 数据配置
}

/**
 * 组件节点
 * 单个组件的完整描述
 */
export interface IComponentNode {
  id: string;
  name: string;
  type: string;
  props: Record<string, unknown>;
  children: IComponentNode[];
  parentId?: string;
}

/**
 * 编辑器配置选项
 */
export interface IEditorOptions {
  /** 编辑器容器元素 */
  container?: HTMLElement;
  /** 初始 Schema */
  initialSchema?: ISchema;
  /** 是否启用拖拽 */
  enableDrag?: boolean;
  /** 是否启用撤销重做 */
  enableHistory?: boolean;
  /** 调试模式 */
  debug?: boolean;
}

/**
 * 组件元数据
 */
export interface IComponentMeta {
  name: string;
  type: string;
  icon?: string;
  description?: string;
  category?: string;
  props?: IPropMeta[];
}

/**
 * 属性元数据
 */
export interface IPropMeta {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  defaultValue?: unknown;
  description?: string;
}

/**
 * 组件类型
 */
export interface IComponentType {
  type: string;
  name: string;
  icon?: string;
  description?: string;
  category?: string;
  component: React.ComponentType<unknown>;
  props?: IPropMeta[];
}

/**
 * 组件接口
 */
export interface IComponent {
  id: string;
  name: string;
  version: string;
  schema: ISchema;
  meta?: IComponentMeta;
}
