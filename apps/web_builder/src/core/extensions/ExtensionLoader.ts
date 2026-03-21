import { IExtension, IExtensionContext } from './types';
import { EventBus } from '../events/EventBus';
import { SlotRegistry } from '../slots/SlotRegistry';
import type { OrangeEditor } from '../editor';

/**
 * 扩展加载器
 * 负责加载和管理扩展的生命周期
 */
export class ExtensionLoader {
  private slotRegistry: SlotRegistry;
  private eventBus: EventBus;
  private extensions: IExtension[] = [];
  private contexts = new Map<string, IExtensionContext>();

  constructor(slotRegistry: SlotRegistry, eventBus: EventBus) {
    this.slotRegistry = slotRegistry;
    this.eventBus = eventBus;
  }

  /**
   * 加载扩展列表
   * @param extensions - 扩展列表
   * @param editor - 编辑器实例
   */
  async load(extensions: IExtension[], editor: OrangeEditor): Promise<void> {
    // 按依赖拓扑排序
    const sorted = this.sortByDependencies(extensions);

    for (const ext of sorted) {
      const context = this.createContext(ext, editor);
      this.contexts.set(ext.id, context);

      try {
        await ext.init(context);
        this.extensions.push(ext);
        console.log(`[Extension] Loaded: ${ext.name} (${ext.id})`);
      } catch (error) {
        console.error(`[Extension] Failed to load ${ext.id}:`, error);
      }
    }

    // 激活所有扩展
    await this.activateAll();
  }

  /**
   * 激活所有扩展
   */
  private async activateAll(): Promise<void> {
    for (const ext of this.extensions) {
      if (ext.activate) {
        const context = this.contexts.get(ext.id)!;
        try {
          await ext.activate(context);
          console.log(`[Extension] Activated: ${ext.name}`);
        } catch (error) {
          console.error(`[Extension] Failed to activate ${ext.id}:`, error);
        }
      }
    }
  }

  /**
   * 停用所有扩展
   */
  async deactivateAll(): Promise<void> {
    for (const ext of this.extensions) {
      if (ext.deactivate) {
        const context = this.contexts.get(ext.id)!;
        try {
          await ext.deactivate(context);
          console.log(`[Extension] Deactivated: ${ext.name}`);
        } catch (error) {
          console.error(`[Extension] Failed to deactivate ${ext.id}:`, error);
        }
      }
    }
  }

  /**
   * 销毁所有扩展
   */
  async destroyAll(): Promise<void> {
    await this.deactivateAll();
    for (const ext of this.extensions) {
      if (ext.destroy) {
        try {
          await ext.destroy();
        } catch (error) {
          console.error(`[Extension] Failed to destroy ${ext.id}:`, error);
        }
      }
    }
    this.extensions = [];
    this.contexts.clear();
  }

  /**
   * 创建扩展上下文
   */
  private createContext(_ext: IExtension, editor: OrangeEditor): IExtensionContext {
    const slotRegistry = this.slotRegistry;
    const eventBus = this.eventBus;

    return {
      editor,

      defineSlot: (name: string, parent?: string) => {
        slotRegistry.defineSlot(name, parent);
      },

      registerSlot: (slotName: string, content) => {
        slotRegistry.registerContent(slotName, content);
      },

      unregisterSlot: (slotName: string, contentId: string) => {
        slotRegistry.unregisterContent(slotName, contentId);
      },

      getService: <T>(id: symbol | string): T => {
        return editor.container.get<T>(id);
      },

      registerService: <T>(id: symbol | string, service: T): void => {
        if (!editor.container.isBound(id)) {
          editor.container.bind<T>(id).toConstantValue(service);
        }
      },

      on: (event: string, handler: (...args: any[]) => void) => {
        eventBus.on(event, handler);
      },

      off: (event: string, handler: (...args: any[]) => void) => {
        eventBus.off(event, handler);
      },

      emit: (event: string, data?: any) => {
        eventBus.emit(event, data);
      },
    };
  }

  /**
   * 按依赖拓扑排序
   */
  private sortByDependencies(extensions: IExtension[]): IExtension[] {
    const visited = new Set<string>();
    const temp = new Set<string>();
    const result: IExtension[] = [];
    const extMap = new Map(extensions.map(e => [e.id, e]));

    const visit = (ext: IExtension) => {
      if (temp.has(ext.id)) {
        throw new Error(`Circular dependency detected: ${ext.id}`);
      }
      if (visited.has(ext.id)) return;

      temp.add(ext.id);

      for (const depId of ext.dependencies || []) {
        const dep = extMap.get(depId);
        if (dep) {
          visit(dep);
        }
      }

      temp.delete(ext.id);
      visited.add(ext.id);
      result.push(ext);
    };

    for (const ext of extensions) {
      visit(ext);
    }

    return result;
  }

  /**
   * 获取已加载的扩展
   */
  getExtension(id: string): IExtension | undefined {
    return this.extensions.find(e => e.id === id);
  }

  /**
   * 获取所有已加载的扩展
   */
  getAllExtensions(): IExtension[] {
    return [...this.extensions];
  }
}
