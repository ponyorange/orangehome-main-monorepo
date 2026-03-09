import 'reflect-metadata';
import { Container, injectable } from 'inversify';

/** Canvas 服务标识 */
export const CanvasService = Symbol('CanvasService');

export interface ICanvasService {
  getCanvasElement(): HTMLDivElement | null;
  setCanvasElement(el: HTMLDivElement | null): void;
  getWidth(): number;
  getHeight(): number;
  setSize(width: number, height: number): void;
  getZoom(): number;
  setZoom(zoom: number): void;
  getOffset(): { x: number; y: number };
  setOffset(x: number, y: number): void;
  getBackgroundColor(): string;
  setBackgroundColor(color: string): void;
  init(): void;
}

@injectable()
export class CanvasServiceImpl implements ICanvasService {
  private _element: HTMLDivElement | null = null;
  private _width = 0;
  private _height = 0;
  private _zoom = 1;
  private _offsetX = 0;
  private _offsetY = 0;
  private _backgroundColor = '#f5f5f5';

  getCanvasElement(): HTMLDivElement | null {
    return this._element;
  }

  setCanvasElement(el: HTMLDivElement | null): void {
    this._element = el;
    if (el) {
      const rect = el.getBoundingClientRect();
      this._width = rect.width;
      this._height = rect.height;
      this._setupResizeObserver(el);
    }
  }

  private _setupResizeObserver(el: HTMLDivElement): void {
    if (typeof ResizeObserver !== 'undefined') {
      const ro = new ResizeObserver((entries) => {
        for (const entry of entries) {
          const { width, height } = entry.contentRect;
          this._width = width;
          this._height = height;
        }
      });
      ro.observe(el);
    }
  }

  getWidth(): number {
    return this._width;
  }

  getHeight(): number {
    return this._height;
  }

  setSize(width: number, height: number): void {
    this._width = width;
    this._height = height;
  }

  getZoom(): number {
    return this._zoom;
  }

  setZoom(zoom: number): void {
    this._zoom = Math.max(0.1, Math.min(3, zoom));
  }

  getOffset(): { x: number; y: number } {
    return { x: this._offsetX, y: this._offsetY };
  }

  setOffset(x: number, y: number): void {
    this._offsetX = x;
    this._offsetY = y;
  }

  getBackgroundColor(): string {
    return this._backgroundColor;
  }

  setBackgroundColor(color: string): void {
    this._backgroundColor = color;
  }

  init(): void {
    console.log('[canvasExtension] init - CanvasService initialized');
    // 画布事件在 React 组件挂载后通过 setCanvasElement 设置 DOM 时注册
  }
}

/** Canvas 扩展 */
export const canvasExtension = {
  id: 'canvas',
  init(container: Container): void {
    console.log('[canvasExtension] init');
    container.bind(CanvasService).to(CanvasServiceImpl).inSingletonScope();
    const service = container.get<ICanvasService>(CanvasService);
    service.init();
  },
};
