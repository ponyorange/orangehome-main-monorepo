import type { ISchema } from '../../types/base';

/**
 * 样式面板「图层」：堆叠 = relative + 外边距；移动 = absolute + top/left（与画布拖动一致）
 */
export function isStyleLayerFloating(style: Record<string, unknown>): boolean {
  const p = style.position;
  if (p === 'absolute') return true;
  if (typeof p === 'string' && p.trim().toLowerCase() === 'absolute') return true;
  return false;
}

/** 与「移动」图层一致：写入 style 时保证 position 为 absolute（供属性面板与其它入口复用） */
export function withMoveLayerPosition<T extends Record<string, unknown>>(style: T): T & { position: 'absolute' } {
  return { ...style, position: 'absolute' };
}

/**
 * 从组件库拖入画布的新节点：默认图层模式为「移动」（absolute + top/left），
 * 保留已有 style 字段，并与 StyleForm 切换到「移动」时的数值迁移规则一致。
 */
export function withDefaultFloatingLayerStyleForNewNode(node: ISchema): ISchema {
  const prev = { ...(node.style ?? {}) } as Record<string, unknown>;
  const mt = typeof prev.marginTop === 'number' ? prev.marginTop : 0;
  const ml = typeof prev.marginLeft === 'number' ? prev.marginLeft : 0;
  const top = typeof prev.top === 'number' ? prev.top : mt;
  const left = typeof prev.left === 'number' ? prev.left : ml;
  return {
    ...node,
    style: {
      ...prev,
      position: 'absolute',
      top,
      left,
      marginTop: 0,
      marginLeft: 0,
    },
  };
}

export function nudgeInlinePosition(
  style: Record<string, unknown>,
  direction: 'up' | 'down' | 'left' | 'right',
  amount: number,
): Record<string, unknown> {
  const next = { ...style };
  if (isStyleLayerFloating(style)) {
    const top = typeof next.top === 'number' ? next.top : 0;
    const left = typeof next.left === 'number' ? next.left : 0;
    let t = top;
    let l = left;
    if (direction === 'up') t -= amount;
    else if (direction === 'down') t += amount;
    else if (direction === 'left') l -= amount;
    else if (direction === 'right') l += amount;
    return { ...next, top: t, left: l };
  }
  const mt = typeof next.marginTop === 'number' ? next.marginTop : 0;
  const ml = typeof next.marginLeft === 'number' ? next.marginLeft : 0;
  let newMt = mt;
  let newMl = ml;
  if (direction === 'up') newMt -= amount;
  else if (direction === 'down') newMt += amount;
  else if (direction === 'left') newMl -= amount;
  else if (direction === 'right') newMl += amount;
  return { ...next, marginTop: newMt, marginLeft: newMl };
}
