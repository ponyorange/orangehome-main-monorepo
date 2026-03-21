import type { DragData, OrangeDragOptions, DragCallbacks, DragEvent } from './types';

const DEFAULT_THRESHOLD = 5;

type Subscriber = (event: DragEvent & { phase: 'start' | 'move' | 'end' }) => void;

const subscribers: Set<Subscriber> = new Set();

export function subscribeDrag(fn: Subscriber): () => void {
  subscribers.add(fn);
  return () => subscribers.delete(fn);
}

function notify(event: DragEvent, phase: 'start' | 'move' | 'end') {
  subscribers.forEach((fn) => fn({ ...event, phase }));
}

export class OrangeDrag {
  private startX = 0;
  private startY = 0;
  private isDragging = false;
  private mirror: HTMLElement | null = null;
  private data: DragData | null = null;
  private options: Required<OrangeDragOptions>;
  private callbacks: DragCallbacks;
  private boundMove: (e: MouseEvent) => void;
  private boundUp: (e: MouseEvent) => void;

  constructor(callbacks: DragCallbacks = {}, options: OrangeDragOptions = {}) {
    this.callbacks = callbacks;
    this.options = {
      threshold: options.threshold ?? DEFAULT_THRESHOLD,
      mirrorOffsetX: options.mirrorOffsetX ?? 12,
      mirrorOffsetY: options.mirrorOffsetY ?? 12,
    };
    this.boundMove = this.handleMouseMove.bind(this);
    this.boundUp = this.handleMouseUp.bind(this);
  }

  start(e: MouseEvent, data: DragData): void {
    e.preventDefault();
    this.startX = e.clientX;
    this.startY = e.clientY;
    this.data = data;
    this.isDragging = false;

    document.addEventListener('mousemove', this.boundMove);
    document.addEventListener('mouseup', this.boundUp);
  }

  private handleMouseMove(e: MouseEvent): void {
    if (!this.data) return;

    const dx = e.clientX - this.startX;
    const dy = e.clientY - this.startY;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (!this.isDragging) {
      if (distance < this.options.threshold) return;
      this.isDragging = true;
      this.createMirror(e.clientX, e.clientY);
      const evt: DragEvent = { clientX: e.clientX, clientY: e.clientY, data: this.data };
      this.callbacks.onDragStart?.(evt);
      notify(evt, 'start');
    }

    this.updateMirror(e.clientX, e.clientY);
    const evt: DragEvent = { clientX: e.clientX, clientY: e.clientY, data: this.data };
    this.callbacks.onDrag?.(evt);
    notify(evt, 'move');
  }

  private handleMouseUp(e: MouseEvent): void {
    if (this.data && this.isDragging) {
      const evt: DragEvent = { clientX: e.clientX, clientY: e.clientY, data: this.data };
      this.callbacks.onDragEnd?.(evt);
      notify(evt, 'end');
    }
    this.cleanup();
  }

  private createMirror(x: number, y: number): void {
    if (!this.data) return;
    const el = document.createElement('div');
    el.style.cssText = `
      position: fixed;
      z-index: 99999;
      pointer-events: none;
      padding: 8px 16px;
      background: var(--theme-primary, #fa8c35);
      color: #fff;
      border-radius: 6px;
      font-size: 13px;
      font-weight: 500;
      box-shadow: 0 4px 12px rgba(0,0,0,0.2);
      opacity: 0.9;
      white-space: nowrap;
      transform: translate(${this.options.mirrorOffsetX}px, ${this.options.mirrorOffsetY}px);
    `;
    el.textContent = this.data.componentName;
    document.body.appendChild(el);
    this.mirror = el;
    this.updateMirror(x, y);
  }

  private updateMirror(x: number, y: number): void {
    if (!this.mirror) return;
    this.mirror.style.left = `${x}px`;
    this.mirror.style.top = `${y}px`;
  }

  private cleanup(): void {
    if (this.mirror) {
      this.mirror.remove();
      this.mirror = null;
    }
    this.data = null;
    this.isDragging = false;
    document.removeEventListener('mousemove', this.boundMove);
    document.removeEventListener('mouseup', this.boundUp);
  }
}

export type { DragData, OrangeDragOptions, DragCallbacks, DragEvent } from './types';
