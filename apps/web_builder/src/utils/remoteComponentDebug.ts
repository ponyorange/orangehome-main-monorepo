/**
 * 远程 / AMD 物料渲染排查：控制台过滤 `[OrangeBuilder:Remote]`。
 * 仅在 Vite 开发构建输出（import.meta.env.DEV）。
 */
export const REMOTE_COMPONENT_DEBUG_TAG = '[OrangeBuilder:Remote]';

export function remoteComponentDebug(phase: string, detail?: Record<string, unknown>): void {
  try {
    if (import.meta.env?.DEV !== true) return;
  } catch {
    return;
  }
  if (detail !== undefined) {
    console.log(REMOTE_COMPONENT_DEBUG_TAG, phase, detail);
  } else {
    console.log(REMOTE_COMPONENT_DEBUG_TAG, phase);
  }
}
