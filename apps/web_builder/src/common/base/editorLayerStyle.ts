/**
 * 样式面板「图层」：固定 = relative + 外边距拖动；移动 = absolute + top/left 拖动
 */
export function isStyleLayerFloating(style: Record<string, unknown>): boolean {
  return style.position === 'absolute';
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
