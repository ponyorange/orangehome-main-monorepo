import type { ISchema } from '../../../types/base';
import { generateIdWithPrefix } from '../../../utils/id';

/**
 * 合并顶层 style 与旧版 props.style（顶层优先），用于渲染与编辑
 */
export function getResolvedInlineStyle(node: ISchema): Record<string, unknown> {
  const legacy = (node.props?.style as Record<string, unknown>) ?? {};
  const top = (node.style as Record<string, unknown>) ?? {};
  return { ...legacy, ...top };
}

/**
 * 将 props.style 迁到顶层 style，并递归子节点（加载旧数据时用）
 */
export function normalizeSchemaNode(node: ISchema): ISchema {
  const raw = node as ISchema & { editorConfig?: unknown };
  const { editorConfig: _omitEditorConfig, children, ...rest } = raw;
  const props = { ...(rest.props ?? {}) } as Record<string, unknown>;
  delete props.remote;
  delete props.remoteUrl;
  let style = { ...((rest.style as Record<string, unknown>) ?? {}) };
  const legacy = props.style;
  if (legacy != null && typeof legacy === 'object' && !Array.isArray(legacy)) {
    style = { ...(legacy as Record<string, unknown>), ...style };
    delete props.style;
  }
  const childrenNorm = Array.isArray(children)
    ? children.map(normalizeSchemaNode)
    : [];
  return {
    ...rest,
    props,
    style: Object.keys(style).length > 0 ? style : undefined,
    children: childrenNorm,
  };
}

/**
 * 根据 ID 查找节点
 * @param schema - Schema 树
 * @param id - 节点 ID
 * @returns 找到的节点或 null
 */
export function findById(schema: ISchema, id: string): ISchema | null {
  if (schema.id === id) return schema;
  for (const child of schema.children) {
    const found = findById(child, id);
    if (found) return found;
  }
  return null;
}

/**
 * 根据 ID 查找父节点
 * @param schema - Schema 树
 * @param id - 节点 ID
 * @returns 父节点或 null（如果是根节点）
 */
export function findParentById(schema: ISchema, id: string): ISchema | null {
  for (const child of schema.children) {
    if (child.id === id) return schema;
    const parent = findParentById(child, id);
    if (parent) return parent;
  }
  return null;
}

/**
 * 根据 ID 查找节点路径
 * @param schema - Schema 树
 * @param id - 节点 ID
 * @returns 从根到目标节点的 ID 路径数组
 */
export function findPathById(schema: ISchema, id: string): string[] {
  if (schema.id === id) return [id];
  for (const child of schema.children) {
    const path = findPathById(child, id);
    if (path.length > 0) return [schema.id, ...path];
  }
  return [];
}

/**
 * 创建 Schema 的深拷贝
 */
function cloneSchema(schema: ISchema): ISchema {
  return {
    ...schema,
    props: { ...schema.props },
    style: schema.style ? { ...schema.style } : undefined,
    propStyle: schema.propStyle ? { ...schema.propStyle } : undefined,
    event2action: schema.event2action ? [...schema.event2action] : undefined,
    api: schema.api ? { ...schema.api } : undefined,
    children: schema.children.map(cloneSchema),
  };
}

/**
 * 更新节点的 props（不可变操作）
 * @param schema - Schema 树
 * @param id - 目标节点 ID
 * @param props - 要更新的属性
 * @returns 新的 Schema 树
 */
export function updateProps(
  schema: ISchema,
  id: string,
  props: Record<string, unknown>
): ISchema {
  if (schema.id === id) {
    const next = cloneSchema(schema);
    const merged = { ...next.props, ...props } as Record<string, unknown>;
    const embedded = merged.style;
    delete merged.style;
    delete merged.remote;
    delete merged.remoteUrl;
    next.props = merged;
    if (
      embedded !== null &&
      typeof embedded === 'object' &&
      !Array.isArray(embedded)
    ) {
      next.style = {
        ...getResolvedInlineStyle(next),
        ...(embedded as Record<string, unknown>),
      };
    }
    return next;
  }
  return {
    ...cloneSchema(schema),
    children: schema.children.map((child) => updateProps(child, id, props)),
  };
}

/**
 * 更新节点内联 style（顶层），并移除 props.style
 */
export function updateInlineStyle(
  schema: ISchema,
  id: string,
  style: Record<string, unknown>
): ISchema {
  if (schema.id === id) {
    const next = cloneSchema(schema);
    next.style = { ...style };
    const p = { ...next.props } as Record<string, unknown>;
    delete p.style;
    delete p.remote;
    delete p.remoteUrl;
    next.props = p;
    return next;
  }
  return {
    ...cloneSchema(schema),
    children: schema.children.map((child) => updateInlineStyle(child, id, style)),
  };
}

/**
 * 更新节点的样式（不可变操作）
 * @param schema - Schema 树
 * @param id - 目标节点 ID
 * @param style - 要更新的样式
 * @param selector - CSS 选择器（默认 'root'）
 * @returns 新的 Schema 树
 */
export function updateStyle(
  schema: ISchema,
  id: string,
  style: Record<string, string | number>,
  selector = 'root'
): ISchema {
  if (schema.id === id) {
    const newSchema = cloneSchema(schema);
    newSchema.propStyle = {
      ...(newSchema.propStyle || {}),
      [selector]: { ...((newSchema.propStyle?.[selector]) || {}), ...style },
    };
    return newSchema;
  }
  return {
    ...cloneSchema(schema),
    children: schema.children.map((child) => updateStyle(child, id, style, selector)),
  };
}

/**
 * 添加子节点（不可变操作）
 * @param schema - Schema 树
 * @param parentId - 父节点 ID
 * @param child - 要添加的子节点
 * @param index - 插入位置（可选，默认为末尾）
 * @returns 新的 Schema 树
 */
export function addChild(
  schema: ISchema,
  parentId: string,
  child: ISchema,
  index?: number
): ISchema {
  if (schema.id === parentId) {
    const newSchema = cloneSchema(schema);
    if (index !== undefined && index >= 0 && index <= newSchema.children.length) {
      newSchema.children.splice(index, 0, child);
    } else {
      newSchema.children.push(child);
    }
    return newSchema;
  }
  return {
    ...cloneSchema(schema),
    children: schema.children.map((c) => addChild(c, parentId, child, index)),
  };
}

/**
 * 删除节点（不可变操作）
 * @param schema - Schema 树
 * @param id - 要删除的节点 ID
 * @returns 新的 Schema 树
 */
export function removeById(schema: ISchema, id: string): ISchema {
  const newSchema = cloneSchema(schema);
  newSchema.children = newSchema.children
    .filter((child) => child.id !== id)
    .map((child) => removeById(child, id));
  return newSchema;
}

/**
 * 移动节点到新父节点（不可变操作）
 * @param schema - Schema 树
 * @param id - 要移动的节点 ID
 * @param newParentId - 新父节点 ID
 * @param index - 在新父节点中的位置（可选）
 * @returns 新的 Schema 树或 null（如果移动无效）
 */
export function moveNode(
  schema: ISchema,
  id: string,
  newParentId: string,
  index?: number
): ISchema | null {
  // 检查是否是有效移动（不能移动到自己或自己的后代中）
  const targetPath = findPathById(schema, id);
  const parentPath = findPathById(schema, newParentId);
  if (targetPath.length === 0 || parentPath.length === 0) return null;
  if (parentPath.includes(id)) return null; // 不能移动到自己的后代中

  // 找到要移动的节点
  const nodeToMove = findById(schema, id);
  if (!nodeToMove) return null;

  // 先从原位置删除
  let newSchema = removeById(schema, id);

  // 再添加到新位置
  newSchema = addChild(newSchema, newParentId, nodeToMove, index);

  return newSchema;
}

/**
 * 复制节点（不可变操作）
 * @param schema - Schema 树
 * @param id - 要复制的节点 ID
 * @returns 包含新节点的 Schema 树或 null
 */
export function duplicateNode(schema: ISchema, id: string): ISchema | null {
  const node = findById(schema, id);
  if (!node) return null;

  const parent = findParentById(schema, id);
  if (!parent) return null; // 不能复制根节点

  // 递归复制节点及其子节点，生成新 ID
  function cloneWithNewId(node: ISchema): ISchema {
    return {
      ...node,
      id: generateIdWithPrefix(node.type.toLowerCase()),
      props: { ...node.props },
      style: node.style ? { ...node.style } : undefined,
      propStyle: node.propStyle ? { ...node.propStyle } : undefined,
      event2action: node.event2action ? [...node.event2action] : undefined,
      api: node.api ? { ...node.api } : undefined,
      children: node.children.map(cloneWithNewId),
    };
  }

  const clonedNode = cloneWithNewId(node);

  // 找到原节点在父节点中的位置，插入到其后
  const originalIndex = parent.children.findIndex((child) => child.id === id);
  return addChild(schema, parent.id, clonedNode, originalIndex + 1);
}

/**
 * 展平 Schema 为节点数组
 * @param schema - Schema 树
 * @returns 包含所有节点的数组（深度优先）
 */
export function flatten(schema: ISchema): ISchema[] {
  const result: ISchema[] = [schema];
  for (const child of schema.children) {
    result.push(...flatten(child));
  }
  return result;
}

/**
 * 验证 Schema 的有效性
 * @param schema - Schema 树
 * @returns 是否有效
 */
export function validate(schema: ISchema): boolean {
  // 检查必需字段
  if (!schema.id || typeof schema.id !== 'string') return false;
  if (!schema.name || typeof schema.name !== 'string') return false;
  if (!schema.type || typeof schema.type !== 'string') return false;
  if (!Array.isArray(schema.children)) return false;
  if (typeof schema.props !== 'object') return false;
  if (
    schema.style != null &&
    (typeof schema.style !== 'object' || Array.isArray(schema.style))
  ) {
    return false;
  }

  // 递归验证子节点
  for (const child of schema.children) {
    if (!validate(child)) return false;
  }

  return true;
}

/**
 * 序列化 Schema 为 JSON 字符串
 * @param schema - Schema 树
 * @returns JSON 字符串
 */
export function serialize(schema: ISchema): string {
  return JSON.stringify(schema, null, 2);
}

/**
 * 反序列化 JSON 字符串为 Schema
 * @param json - JSON 字符串
 * @returns Schema 树或 null（如果解析失败）
 */
export function deserialize(json: string): ISchema | null {
  try {
    const raw = JSON.parse(json) as ISchema;
    const schema = normalizeSchemaNode(raw);
    return validate(schema) ? schema : null;
  } catch {
    return null;
  }
}

/**
 * Schema 操作工具对象
 * 提供所有 Schema 操作方法
 */
export const schemaOperator = {
  findById,
  findParentById,
  findPathById,
  getResolvedInlineStyle,
  normalizeSchemaNode,
  updateProps,
  updateInlineStyle,
  updateStyle,
  addChild,
  removeById,
  moveNode,
  duplicateNode,
  flatten,
  validate,
  serialize,
  deserialize,
};

export default schemaOperator;
