import type { ISchema } from '../../../../types/base';
import { findById } from '../../../../common/base/schemaOperator';

/** 画布指针下「第一个」命中的 schema 节点（自 target 向上），与 CenterCanvas mousedown 分发规则一致 */
export type CanvasPointerSchemaHit =
  | { kind: 'none' }
  /** 命中页面根容器 DOM（可编辑根 id），用于清除选中等；悬停装饰应忽略 */
  | { kind: 'root' }
  | { kind: 'node'; id: string };

/**
 * @param target - 指针事件 target
 * @param pageSchema - 当前页根 schema 树
 */
export function resolveHitSchemaTarget(
  target: EventTarget | null,
  pageSchema: ISchema,
): CanvasPointerSchemaHit {
  const t = target instanceof HTMLElement ? target : null;
  if (!t) return { kind: 'none' };
  if (t.closest('input, textarea, select, [contenteditable="true"]')) {
    return { kind: 'none' };
  }
  const canvas = t.closest('[data-canvas-area="true"]') as HTMLElement | null;
  if (!canvas) return { kind: 'none' };
  if (t.closest('[data-resize-dir]')) return { kind: 'none' };

  let el: HTMLElement | null = t;
  while (el && canvas.contains(el)) {
    const id = el.id;
    if (id && findById(pageSchema, id)) {
      if (id === pageSchema.id) return { kind: 'root' };
      return { kind: 'node', id };
    }
    el = el.parentElement;
  }
  return { kind: 'none' };
}
