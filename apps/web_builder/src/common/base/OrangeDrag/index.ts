/**
 * OrangeDrag 核心类：自定义拖拽逻辑（参考文档 4.3 节）
 * 支持拖拽镜像、区域检测、距离阈值
 */

export interface OrangeDragOptions {
  /** 触发拖拽的最小移动距离（px） */
  distanceThreshold?: number;
  /** 生成拖拽镜像元素 */
  createMirror?: (el: HTMLElement, data?: unknown) => HTMLElement;
  /** 拖拽数据（如组件类型） */
  data?: unknown;
}

export type DragPhase = 'idle' | 'pending' | 'dragging' | 'dropped';

export interface DragState {
  phase: DragPhase;
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
  mirror: HTMLElement | null;
  data: unknown;
}

export type DropTarget = (x: number, y: number) => { element: HTMLElement; rect: DOMRect } | null;

const DEFAULT_OPTIONS: Required<Pick<OrangeDragOptions, 'distanceThreshold'>> = {
  distanceThreshold: 4,
};

function defaultCreateMirror(el: HTMLElement): HTMLElement {
  const rect = el.getBoundingClientRect();
  const mirror = el.cloneNode(true) as HTMLElement;
  mirror.style.cssText = `
    position: fixed;
    left: ${rect.left}px;
    top: ${rect.top}px;
    width: ${rect.width}px;
    height: ${rect.height}px;
    pointer-events: none;
    opacity: 0.6;
    z-index: 10000;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  `;
  return mirror;
}

export class OrangeDrag {
  private _options: OrangeDragOptions & typeof DEFAULT_OPTIONS;
  private _state: DragState = {
    phase: 'idle',
    startX: 0,
    startY: 0,
    currentX: 0,
    currentY: 0,
    mirror: null,
    data: undefined,
  };
  private _boundMove: (e: MouseEvent) => void;
  private _boundUp: (e: MouseEvent) => void;
  private _onDragStart?: (state: DragState) => void;
  private _onDragMove?: (state: DragState) => void;
  private _onDragEnd?: (state: DragState, dropTarget: { element: HTMLElement; rect: DOMRect } | null) => void;
  private _dropTargetResolver: DropTarget | null = null;

  constructor(options: OrangeDragOptions = {}) {
    this._options = { ...DEFAULT_OPTIONS, ...options };
    this._boundMove = this._handleMove.bind(this);
    this._boundUp = this._handleUp.bind(this);
  }

  get state(): Readonly<DragState> {
    return this._state;
  }

  onDragStart(fn: (state: DragState) => void): this {
    this._onDragStart = fn;
    return this;
  }

  onDragMove(fn: (state: DragState) => void): this {
    this._onDragMove = fn;
    return this;
  }

  onDragEnd(fn: (state: DragState, dropTarget: { element: HTMLElement; rect: DOMRect } | null) => void): this {
    this._onDragEnd = fn;
    return this;
  }

  setDropTarget(resolver: DropTarget | null): this {
    this._dropTargetResolver = resolver;
    return this;
  }

  /**
   * 在元素上绑定 mousedown，按下后进入 pending，移动超过阈值则开始拖拽
   */
  mousedown(el: HTMLElement, clientX: number, clientY: number, data?: unknown): void {
    if (this._state.phase !== 'idle') return;
    this._state = {
      phase: 'pending',
      startX: clientX,
      startY: clientY,
      currentX: clientX,
      currentY: clientY,
      mirror: null,
      data: data ?? this._options.data,
    };
    this.startWatching();
  }

  /**
   * 开始监听全局 mousemove / mouseup
   */
  startWatching(): void {
    window.addEventListener('mousemove', this._boundMove, true);
    window.addEventListener('mouseup', this._boundUp, true);
  }

  /**
   * 停止监听
   */
  stopWatching(): void {
    window.removeEventListener('mousemove', this._boundMove, true);
    window.removeEventListener('mouseup', this._boundUp, true);
  }

  private _handleMove(e: MouseEvent): void {
    const { phase, startX, startY } = this._state;
    this._state.currentX = e.clientX;
    this._state.currentY = e.clientY;

    if (phase === 'pending') {
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist >= this._options.distanceThreshold) {
        this._state.phase = 'dragging';
        this._createMirror(e);
        this._onDragStart?.(this._state);
      }
      return;
    }

    if (phase === 'dragging' && this._state.mirror) {
      this._state.mirror.style.left = `${e.clientX - (this._state.mirror.offsetWidth / 2)}px`;
      this._state.mirror.style.top = `${e.clientY - (this._state.mirror.offsetHeight / 2)}px`;
      this._onDragMove?.(this._state);
    }
  }

  private _createMirror(e: MouseEvent): void {
    const create = this._options.createMirror ?? defaultCreateMirror;
    const source = (e.target as HTMLElement).closest('[data-drag-source]') as HTMLElement || document.body;
    const mirror = create(source, this._state.data);
    document.body.appendChild(mirror);
    mirror.style.left = `${e.clientX - mirror.offsetWidth / 2}px`;
    mirror.style.top = `${e.clientY - mirror.offsetHeight / 2}px`;
    this._state.mirror = mirror;
  }

  private _handleUp(e: MouseEvent): void {
    this.stopWatching();
    const phase = this._state.phase;
    let dropTarget: { element: HTMLElement; rect: DOMRect } | null = null;
    if (this._dropTargetResolver && phase === 'dragging') {
      dropTarget = this._dropTargetResolver(e.clientX, e.clientY);
    }
    if (this._state.mirror && this._state.mirror.parentNode) {
      this._state.mirror.parentNode.removeChild(this._state.mirror);
    }
    this._state.phase = 'dropped';
    this._onDragEnd?.(this._state, dropTarget);
    this._state = {
      phase: 'idle',
      startX: 0,
      startY: 0,
      currentX: 0,
      currentY: 0,
      mirror: null,
      data: undefined,
    };
  }
}
