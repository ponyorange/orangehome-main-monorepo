/**
 * 视口内上下文菜单定位（指针锚定 + 翻转 + 夹取）。
 * 新增长按/右键菜单时 MUST 复用 `resolveContextMenuPlacement`，禁止复制另一套 fixed 坐标逻辑（FR-004 / feature 005 contract）。
 *
 * @see specs/005-context-menu-follow-pointer/contracts/context-menu-placement.md
 */

export const CONTEXT_MENU_VIEWPORT_PADDING = 8;

export interface ResolveContextMenuPlacementInput {
  clientX: number;
  clientY: number;
  menuWidth: number;
  menuHeight: number;
  viewportWidth: number;
  viewportHeight: number;
  /** @default CONTEXT_MENU_VIEWPORT_PADDING */
  padding?: number;
}

function clamp(n: number, min: number, max: number): number {
  return Math.min(Math.max(n, min), max);
}

/**
 * 计算 `position: fixed` 的 left/top：默认左上角在指针处；超出视口则先尝试向指针左/上翻转，再夹取到安全区内。
 */
export function resolveContextMenuPlacement(
  input: ResolveContextMenuPlacementInput,
): { left: number; top: number } {
  const {
    clientX,
    clientY,
    menuWidth,
    menuHeight,
    viewportWidth,
    viewportHeight,
    padding = CONTEXT_MENU_VIEWPORT_PADDING,
  } = input;

  const w = Math.max(menuWidth, 1);
  const h = Math.max(menuHeight, 1);
  const vw = Math.max(viewportWidth, 1);
  const vh = Math.max(viewportHeight, 1);

  const minLeft = padding;
  const maxLeft = Math.max(padding, vw - padding - w);
  const minTop = padding;
  const maxTop = Math.max(padding, vh - padding - h);

  let left = clientX;
  let top = clientY;

  if (left + w + padding > vw) {
    left = clientX - w;
  }
  if (top + h + padding > vh) {
    top = clientY - h;
  }

  left = clamp(left, minLeft, maxLeft);
  top = clamp(top, minTop, maxTop);

  return { left, top };
}

/** 测量失败时的降级尺寸（research R5 / FR-005），避免 NaN 或菜单不出现在视口内 */
export function fallbackContextMenuDimensions(
  itemCount: number,
): { width: number; height: number } {
  return { width: 200, height: Math.max(itemCount * 36 + 16, 48) };
}
