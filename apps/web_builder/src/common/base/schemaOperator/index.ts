/**
 * Schema 操作工具函数（参考文档 6.2 节）
 * 独立工具，不依赖 Inversify，便于复用
 */
import type { ISchema } from '../../../types/base';

/**
 * 深度遍历查找节点
 */
function findNodeById(schema: ISchema | null, id: string): ISchema | null {
  if (!schema) return null;
  if (schema.id === id) return schema;
  const children = schema.children;
  if (!children?.length) return null;
  for (const child of children) {
    const found = findNodeById(child, id);
    if (found) return found;
  }
  return null;
}

/**
 * 深度遍历查找父节点
 */
function findParentById(
  schema: ISchema | null,
  id: string,
  parent: ISchema | null = null
): ISchema | null {
  if (!schema) return null;
  if (schema.id === id) return parent;
  const children = schema.children;
  if (!children?.length) return null;
  for (const child of children) {
    const found = findParentById(child, id, schema);
    if (found !== null) return found;
  }
  return null;
}

/**
 * 深度克隆并更新节点
 */
function updateInTree(
  node: ISchema,
  id: string,
  updater: (node: ISchema) => ISchema
): ISchema {
  if (node.id === id) {
    return updater({ ...node });
  }
  const children = node.children;
  if (!children?.length) return node;
  return {
    ...node,
    children: children.map((child) => updateInTree(child, id, updater)),
  };
}

/**
 * 深度克隆并删除节点
 */
function deleteInTree(schema: ISchema, id: string): ISchema | null {
  if (schema.id === id) return null;
  const children = schema.children;
  if (!children?.length) return schema;
  const newChildren = children
    .map((child) => deleteInTree(child, id))
    .filter((n): n is ISchema => n !== null);
  return { ...schema, children: newChildren };
}

/**
 * 根据 ID 更新节点属性
 */
export function updateNodePropsById(
  schema: ISchema | null,
  id: string,
  props: Partial<Record<string, unknown>>
): ISchema | null {
  if (!schema) return null;
  const node = findNodeById(schema, id);
  if (!node) return schema;
  return updateInTree(schema, id, (n) => ({
    ...n,
    props: { ...n.props, ...props } as Record<string, unknown>,
  }));
}

/**
 * 根据 ID 读取节点
 */
export function readNodeById(
  schema: ISchema | null,
  id: string
): ISchema | null {
  return findNodeById(schema, id);
}

/**
 * 根据 ID 删除节点
 */
export function deleteNodeById(
  schema: ISchema | null,
  id: string
): ISchema | null {
  if (!schema) return null;
  if (schema.id === id) return null;
  return deleteInTree(schema, id);
}

/**
 * 在指定父节点下添加子节点
 * @param schema 根 schema
 * @param parentId 父节点 ID
 * @param node 要添加的子节点
 * @param index 插入位置，默认追加到末尾
 */
export function addChildNode(
  schema: ISchema | null,
  parentId: string,
  node: ISchema,
  index?: number
): ISchema | null {
  if (!schema) return null;
  const parent = findNodeById(schema, parentId);
  if (!parent) return schema;
  const children = parent.children ?? [];
  const newChildren = [...children];
  const insertIndex = index ?? newChildren.length;
  newChildren.splice(insertIndex, 0, node);
  return updateInTree(schema, parentId, () => ({
    ...parent,
    children: newChildren,
  }));
}
