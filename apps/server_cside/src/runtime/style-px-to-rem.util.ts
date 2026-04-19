import type { CSSProperties } from 'react';

/** 与运行时插件 `DEFAULT_ROOT_PX` 一致 */
export const DEFAULT_ROOT_PX = 100;

const LENGTH_KEYS = new Set<string>([
  'width',
  'height',
  'minWidth',
  'minHeight',
  'maxWidth',
  'maxHeight',
  'margin',
  'marginTop',
  'marginRight',
  'marginBottom',
  'marginLeft',
  'padding',
  'paddingTop',
  'paddingRight',
  'paddingBottom',
  'paddingLeft',
  'top',
  'right',
  'bottom',
  'left',
  'gap',
  'rowGap',
  'columnGap',
  'fontSize',
  'borderRadius',
  'outlineOffset',
]);

const PX_VALUE = /^\s*-?\d*\.?\d+\s*px\s*$/i;

function skipStringAsNonPxLength(value: string): boolean {
  const lower = value.toLowerCase();
  if (lower.includes('%') || lower.includes('vh') || lower.includes('vw')) return true;
  if (lower.includes('calc(')) return true;
  if (/(?:^|[^\w-])(?:\d+\.?\d*|\.\d+)\s*rem\b/i.test(value)) return true;
  if (/(?:^|[^\w-])(?:\d+\.?\d*|\.\d+)\s*em\b/i.test(value)) return true;
  return false;
}

function pxToRemString(px: number, rootPx: number): string {
  const rem = px / rootPx;
  const rounded = Math.round(rem * 10000) / 10000;
  return `${rounded}rem`;
}

/** 与 `plugins/runtime` 中 `convertSchemaStyleToRem` 行为对齐，保证 SSR 与客户端首屏样式一致 */
export function convertSchemaStyleToRem(
  style: CSSProperties | undefined | null,
  rootPx: number = DEFAULT_ROOT_PX,
): CSSProperties | undefined {
  if (style == null) return undefined;

  let effectiveRoot = rootPx;
  if (!Number.isFinite(effectiveRoot) || effectiveRoot <= 0) {
    effectiveRoot = DEFAULT_ROOT_PX;
  }

  const entries = Object.entries(style).filter(([, v]) => v !== undefined);
  if (entries.length === 0) return {};

  const out = {} as CSSProperties;

  for (const [key, raw] of entries) {
    if (!LENGTH_KEYS.has(key)) {
      (out as Record<string, unknown>)[key] = raw;
      continue;
    }

    if (raw === null) {
      (out as Record<string, unknown>)[key] = raw;
      continue;
    }

    if (typeof raw === 'number') {
      if (!Number.isFinite(raw)) continue;
      (out as Record<string, unknown>)[key] = pxToRemString(raw, effectiveRoot);
      continue;
    }

    if (typeof raw === 'string') {
      if (skipStringAsNonPxLength(raw)) {
        (out as Record<string, unknown>)[key] = raw;
        continue;
      }
      if (PX_VALUE.test(raw)) {
        const n = parseFloat(raw);
        if (Number.isFinite(n)) {
          (out as Record<string, unknown>)[key] = pxToRemString(n, effectiveRoot);
        } else {
          (out as Record<string, unknown>)[key] = raw;
        }
        continue;
      }
      (out as Record<string, unknown>)[key] = raw;
      continue;
    }

    (out as Record<string, unknown>)[key] = raw;
  }

  return out;
}
