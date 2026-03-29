/**
 * 画布内可选中 schema 节点的「真实宿主 DOM」登记簿。
 * 供交互层通过 createPortal 绘制选中框 / hover，而不依赖物料是否转发 ref 或合成事件。
 */
export class CanvasSchemaHostRegistry {
  private readonly hosts = new Map<string, HTMLElement>();

  private version = 0;

  private readonly listeners = new Set<() => void>();

  register(id: string, el: HTMLElement | null): void {
    if (el) {
      this.hosts.set(id, el);
    } else {
      this.hosts.delete(id);
    }
    this.bump();
  }

  unregister(id: string): void {
    if (!this.hosts.has(id)) return;
    this.hosts.delete(id);
    this.bump();
  }

  get(id: string): HTMLElement | null {
    return this.hosts.get(id) ?? null;
  }

  /** 供 useSyncExternalStore 触发重渲染 */
  subscribe = (onStoreChange: () => void): (() => void) => {
    this.listeners.add(onStoreChange);
    return () => {
      this.listeners.delete(onStoreChange);
    };
  };

  getSnapshot = (): number => this.version;

  private bump(): void {
    this.version += 1;
    this.listeners.forEach((fn) => fn());
  }
}

export const canvasSchemaHostRegistry = new CanvasSchemaHostRegistry();
