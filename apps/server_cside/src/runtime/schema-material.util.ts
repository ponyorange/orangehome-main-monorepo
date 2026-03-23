/**
 * 从页面 schema 根节点沿 `children` 递归收集各节点的 `type`（即用 type 作为物料标识）。
 */
export function collectMaterialUids(root: any): string[] {
  const order: string[] = [];

  function walk(node: Record<string, any>): void {
    if (node === null || node === undefined) return;
    if (node.type) {
      order.push(node.type);
    }
    if (node.children) {
      for (const child of node.children) {
        walk(child);
      }
    }
  }

  walk(root);
  return order;
}
