import type { ISchema } from '../../../types/base';
import { flatten } from '../../../common/base/schemaOperator';

export interface AlignLine {
  type: 'horizontal' | 'vertical';
  position: number;
}

/** 避免 mousemove 每帧 setState 相同内容导致整画布无意义重渲染（与 uniqueLines 的取整一致） */
export function alignLinesEqual(a: AlignLine[], b: AlignLine[]): boolean {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    const x = a[i];
    const y = b[i];
    if (x.type !== y.type || Math.round(x.position) !== Math.round(y.position)) return false;
  }
  return true;
}

export interface AlignResult {
  snappedX: number | null;
  snappedY: number | null;
  lines: AlignLine[];
}

const SNAP_THRESHOLD = 5;

interface Rect {
  id: string;
  top: number;
  left: number;
  width: number;
  height: number;
  right: number;
  bottom: number;
  centerX: number;
  centerY: number;
}

function getComponentRect(id: string, canvasContainer: HTMLElement): Rect | null {
  const el = canvasContainer.querySelector(`[data-schema-id="${id}"]`) as HTMLElement | null;
  if (!el) return null;

  const canvasRect = canvasContainer.getBoundingClientRect();
  const elRect = el.getBoundingClientRect();

  const top = elRect.top - canvasRect.top;
  const left = elRect.left - canvasRect.left;
  const width = elRect.width;
  const height = elRect.height;

  return {
    id,
    top,
    left,
    width,
    height,
    right: left + width,
    bottom: top + height,
    centerX: left + width / 2,
    centerY: top + height / 2,
  };
}

export function computeAlignLines(
  movingId: string,
  schema: ISchema,
  canvasContainer: HTMLElement,
): AlignLine[] {
  const allNodes = flatten(schema).filter((n) => n.id !== movingId && n.id !== schema.id);
  const movingRect = getComponentRect(movingId, canvasContainer);
  if (!movingRect) return [];

  const lines: AlignLine[] = [];

  for (const node of allNodes) {
    const rect = getComponentRect(node.id, canvasContainer);
    if (!rect) continue;

    const edges = [
      { type: 'horizontal' as const, a: movingRect.top, b: rect.top },
      { type: 'horizontal' as const, a: movingRect.bottom, b: rect.bottom },
      { type: 'horizontal' as const, a: movingRect.top, b: rect.bottom },
      { type: 'horizontal' as const, a: movingRect.bottom, b: rect.top },
      { type: 'horizontal' as const, a: movingRect.centerY, b: rect.centerY },
      { type: 'vertical' as const, a: movingRect.left, b: rect.left },
      { type: 'vertical' as const, a: movingRect.right, b: rect.right },
      { type: 'vertical' as const, a: movingRect.left, b: rect.right },
      { type: 'vertical' as const, a: movingRect.right, b: rect.left },
      { type: 'vertical' as const, a: movingRect.centerX, b: rect.centerX },
    ];

    for (const edge of edges) {
      if (Math.abs(edge.a - edge.b) <= SNAP_THRESHOLD) {
        lines.push({ type: edge.type, position: edge.b });
      }
    }
  }

  const canvasRect = canvasContainer.getBoundingClientRect();
  const canvasW = canvasRect.width;
  const canvasH = canvasRect.height;
  const canvasCenterX = canvasW / 2;
  const canvasCenterY = canvasH / 2;

  if (Math.abs(movingRect.centerX - canvasCenterX) <= SNAP_THRESHOLD) {
    lines.push({ type: 'vertical', position: canvasCenterX });
  }
  if (Math.abs(movingRect.centerY - canvasCenterY) <= SNAP_THRESHOLD) {
    lines.push({ type: 'horizontal', position: canvasCenterY });
  }

  const uniqueLines: AlignLine[] = [];
  const seen = new Set<string>();
  for (const line of lines) {
    const key = `${line.type}-${Math.round(line.position)}`;
    if (!seen.has(key)) {
      seen.add(key);
      uniqueLines.push(line);
    }
  }

  return uniqueLines;
}

