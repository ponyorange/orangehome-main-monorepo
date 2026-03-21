# 1-3-PLAN.md

## 计划 1-3: 插槽化架构基础文件创建（Rush Monorepo）

### 前置依赖
- 计划 1-1 完成（Rush Monorepo 项目初始化）
- 计划 1-2 完成（Inversify 配置）

### 文件变更

| 操作 | 文件路径 | 说明 |
|-----|---------|------|
| 创建 | `apps/web_builder/src/core/slots/types.ts` | 插槽类型定义 |
| 创建 | `apps/web_builder/src/core/slots/SlotRegistry.ts` | 插槽注册中心 |
| 创建 | `apps/web_builder/src/core/slots/SlotRenderer.tsx` | 插槽渲染组件 |
| 创建 | `apps/web_builder/src/core/extensions/types.ts` | 扩展类型定义 |
| 创建 | `apps/web_builder/src/core/extensions/ExtensionLoader.ts` | 扩展加载器 |
| 创建 | `apps/web_builder/src/core/extensions/ExtensionContext.ts` | 扩展上下文 |
| 创建 | `apps/web_builder/src/core/events/EventBus.ts` | 事件总线 |
| 创建 | `apps/web_builder/src/core/editor.ts` | OrangeEditor 主类 |
| 创建 | `apps/web_builder/src/extensions/core/slot-system/index.ts` | 插槽系统扩展 |
| 创建 | `apps/web_builder/src/extensions/core/event-system/index.ts` | 事件系统扩展 |
| 创建 | `apps/web_builder/src/extensions/core/store/index.ts` | Store 扩展 |
| 创建 | `apps/web_builder/src/extensions/ui/header/index.ts` | Header UI 扩展 |
| 创建 | `apps/web_builder/src/extensions/ui/left-panel/index.ts` | LeftPanel UI 扩展 |
| 创建 | `apps/web_builder/src/extensions/ui/right-panel/index.ts` | RightPanel UI 扩展 |
| 创建 | `apps/web_builder/src/extensions/ui/center-canvas/index.ts` | CenterCanvas UI 扩展 |
| 创建 | `apps/web_builder/src/extensions/features/component-panel/index.ts` | 组件面板扩展占位 |
| 创建 | `apps/web_builder/src/extensions/features/layer-tree/index.ts` | 图层树扩展占位 |
| 创建 | `apps/web_builder/src/extensions/features/properties-panel/index.ts` | 属性面板扩展占位 |
| 创建 | `apps/web_builder/src/extensions/editing/select/index.ts` | 选择扩展占位 |
| 创建 | `apps/web_builder/src/common/base/schemaOperator/index.ts` | Schema 操作工具 |
| 创建 | `apps/web_builder/src/common/base/OrangeDrag/index.ts` | 拖拽基础类 |
| 修改 | `apps/web_builder/src/index.ts` | 更新导出 |

### 实现步骤

1. **创建插槽系统**
   - SlotRegistry: 管理插槽注册和查询
   - SlotRenderer: 渲染插槽内容
   - 插槽类型定义

2. **创建扩展系统**
   - ExtensionLoader: 按顺序加载扩展
   - ExtensionContext: 提供插槽/服务/事件 API
   - 扩展类型定义

3. **创建事件总线**
   - EventBus: 发布订阅模式
   - 支持通配符事件

4. **创建核心编辑器类**
   - OrangeEditor 单例模式
   - 集成 SlotRegistry, ExtensionLoader, EventBus
   - mount/unmount 生命周期

5. **创建基础扩展占位**
   - 核心扩展: slot-system, event-system, store
   - UI 扩展: header, left-panel, right-panel, center-canvas
   - 功能扩展: component-panel, layer-tree, properties-panel

### 核心代码结构

```typescript
// apps/web_builder/src/core/slots/types.ts
export interface ISlotContent {
  id: string;
  component: React.ComponentType<any>;
  order?: number;
  weight?: number;
  config?: Record<string, any>;
}

export interface ISlot {
  name: string;
  contents: ISlotContent[];
  parent?: string;
}

// apps/web_builder/src/core/slots/SlotRegistry.ts
@injectable()
export class SlotRegistry {
  private slots = new Map<string, ISlot>();
  
  defineSlot(name: string, parent?: string): void {
    if (!this.slots.has(name)) {
      this.slots.set(name, { name, contents: [], parent });
    }
  }
  
  registerContent(slotName: string, content: ISlotContent): void {
    const slot = this.slots.get(slotName);
    if (slot) {
      // 检查是否已存在
      const existingIndex = slot.contents.findIndex(c => c.id === content.id);
      if (existingIndex >= 0) {
        slot.contents[existingIndex] = content;
      } else {
        slot.contents.push(content);
      }
      // 按 order 排序
      slot.contents.sort((a, b) => (a.order || 0) - (b.order || 0));
    } else {
      console.warn(`Slot "${slotName}" is not defined`);
    }
  }
  
  unregisterContent(slotName: string, contentId: string): void {
    const slot = this.slots.get(slotName);
    if (slot) {
      slot.contents = slot.contents.filter(c => c.id !== contentId);
    }
  }
  
  getContents(slotName: string): ISlotContent[] {
    return this.slots.get(slotName)?.contents || [];
  }
  
  hasSlot(name: string): boolean {
    return this.slots.has(name);
  }
}

// apps/web_builder/src/core/extensions/types.ts
export interface IExtension {
  id: string;
  name: string;
  version: string;
  dependencies?: string[];
  init(context: IExtensionContext): void | Promise<void>;
  activate?(context: IExtensionContext): void | Promise<void>;
  deactivate?(context: IExtensionContext): void | Promise<void>;
  dispose?(): void;
}

export interface IExtensionContext {
  editor: OrangeEditor;
  defineSlot(name: string, parent?: string): void;
  registerSlot(slotName: string, content: ISlotContent): void;
  unregisterSlot(slotName: string, contentId: string): void;
  getService<T>(id: string): T;
  registerService<T>(id: string, service: T): void;
  on(event: string, handler: Function): void;
  off(event: string, handler: Function): void;
  emit(event: string, data?: any): void;
}

// apps/web_builder/src/core/extensions/ExtensionLoader.ts
@injectable()
export class ExtensionLoader {
  @inject(SlotRegistry) private slotRegistry!: SlotRegistry;
  @inject(EventBus) private eventBus!: EventBus;
  
  private extensions: IExtension[] = [];
  private contexts = new Map<string, IExtensionContext>();
  
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
  
  private createContext(ext: IExtension, editor: OrangeEditor): IExtensionContext {
    const slotRegistry = this.slotRegistry;
    const eventBus = this.eventBus;
    
    return {
      editor,
      
      defineSlot: (name: string, parent?: string) => {
        slotRegistry.defineSlot(name, parent);
      },
      
      registerSlot: (slotName: string, content: ISlotContent) => {
        slotRegistry.registerContent(slotName, content);
      },
      
      unregisterSlot: (slotName: string, contentId: string) => {
        slotRegistry.unregisterContent(slotName, contentId);
      },
      
      getService: <T>(id: string): T => {
        return editor.container.get<T>(id);
      },
      
      registerService: <T>(id: string, service: T): void => {
        if (!editor.container.isBound(id)) {
          editor.container.bind<T>(id).toConstantValue(service);
        }
      },
      
      on: (event: string, handler: Function) => {
        eventBus.on(event, handler);
      },
      
      off: (event: string, handler: Function) => {
        eventBus.off(event, handler);
      },
      
      emit: (event: string, data?: any) => {
        eventBus.emit(event, data);
      },
    };
  }
  
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
  
  private async activateAll(): Promise<void> {
    for (const ext of this.extensions) {
      if (ext.activate) {
        const context = this.contexts.get(ext.id)!;
        await ext.activate(context);
      }
    }
  }
}

// apps/web_builder/src/core/events/EventBus.ts
@injectable()
export class EventBus {
  private listeners = new Map<string, Set<Function>>();
  
  on(event: string, handler: Function): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(handler);
  }
  
  off(event: string, handler: Function): void {
    this.listeners.get(event)?.delete(handler);
  }
  
  once(event: string, handler: Function): void {
    const onceHandler = (...args: any[]) => {
      this.off(event, onceHandler);
      handler(...args);
    };
    this.on(event, onceHandler);
  }
  
  emit(event: string, data?: any): void {
    this.listeners.get(event)?.forEach(handler => {
      try {
        handler(data);
      } catch (error) {
        console.error(`[EventBus] Error in handler for ${event}:`, error);
      }
    });
    
    // 支持通配符
    const parts = event.split(':');
    for (let i = parts.length - 1; i > 0; i--) {
      const wildcard = parts.slice(0, i).join(':') + ':*';
      this.listeners.get(wildcard)?.forEach(handler => {
        try {
          handler(data, event);
        } catch (error) {
          console.error(`[EventBus] Error in wildcard handler for ${wildcard}:`, error);
        }
      });
    }
  }
  
  clear(): void {
    this.listeners.clear();
  }
}

// apps/web_builder/src/core/editor.ts
export interface EditorOptions {
  container: HTMLElement;
  extensions?: IExtension[];
  initialSchema?: ISchema;
}

@injectable()
export class OrangeEditor {
  private static _instances: OrangeEditor[] = [];
  private _options: EditorOptions;
  private _isMounted = false;
  
  readonly container = defaultContainer;
  
  @inject(SlotRegistry) readonly slotRegistry!: SlotRegistry;
  @inject(ExtensionLoader) readonly extensionLoader!: ExtensionLoader;
  @inject(EventBus) readonly eventBus!: EventBus;
  
  static getInstance(options?: EditorOptions): OrangeEditor {
    const instance = this._instances.pop() ?? new this(options);
    this._instances.push(instance);
    return instance;
  }
  
  constructor(options?: EditorOptions) {
    this._options = {
      ...options,
    };
  }
  
  async mount(): Promise<React.FC | null> {
    if (this._isMounted) return null;
    
    // 1. 定义核心插槽
    this.defineCoreSlots();
    
    // 2. 加载扩展
    await this.extensionLoader.load(this.getExtensions(), this);
    
    // 3. 返回 EditorView 组件
    this._isMounted = true;
    return EditorView;
  }
  
  unmount(): void {
    if (!this._isMounted) return;
    
    this.eventBus.emit('editor:unmount');
    this._isMounted = false;
  }
  
  private defineCoreSlots(): void {
    // Header slots
    this.slotRegistry.defineSlot('header');
    this.slotRegistry.defineSlot('header:left', 'header');
    this.slotRegistry.defineSlot('header:center', 'header');
    this.slotRegistry.defineSlot('header:right', 'header');
    
    // Left panel slots
    this.slotRegistry.defineSlot('left-panel');
    this.slotRegistry.defineSlot('left-panel:top', 'left-panel');
    this.slotRegistry.defineSlot('left-panel:content', 'left-panel');
    this.slotRegistry.defineSlot('left-panel:bottom', 'left-panel');
    
    // Center slots
    this.slotRegistry.defineSlot('center');
    this.slotRegistry.defineSlot('center:ruler:top', 'center');
    this.slotRegistry.defineSlot('center:ruler:left', 'center');
    this.slotRegistry.defineSlot('center:canvas', 'center');
    
    // Right panel slots
    this.slotRegistry.defineSlot('right-panel');
    this.slotRegistry.defineSlot('right-panel:top', 'right-panel');
    this.slotRegistry.defineSlot('right-panel:content', 'right-panel');
    this.slotRegistry.defineSlot('right-panel:bottom', 'right-panel');
    
    // Float slots
    this.slotRegistry.defineSlot('float');
    this.slotRegistry.defineSlot('float:modal', 'float');
    this.slotRegistry.defineSlot('float:context-menu', 'float');
    this.slotRegistry.defineSlot('float:tooltip', 'float');
  }
  
  private getExtensions(): IExtension[] {
    // 默认扩展 + 用户自定义扩展
    return [
      ...(this._options.extensions || []),
    ];
  }
}
```

### 验证方法

```bash
# 在 apps/web_builder 目录下
rushx type-check
rush build -t @orangehome/web_builder
rushx dev
```

### 验收标准

- [ ] 目录结构符合 Rush monorepo 规范
- [ ] SlotRegistry 能注册和查询插槽
- [ ] ExtensionLoader 能按依赖顺序加载扩展
- [ ] EventBus 事件收发正常
- [ ] OrangeEditor 能定义核心插槽
- [ ] 扩展能通过 context 注册插槽
- [ ] 无 TypeScript 错误
- [ ] 构建产物符合 Rush 规范

---

## 在 Cursor 中执行

```
请创建插槽化架构的基础文件。

前置: Rush monorepo 项目已初始化，Inversify 容器已配置。

路径: apps/web_builder/src/

任务:

1. 创建插槽系统:
   apps/web_builder/src/core/slots/types.ts:
   - ISlotContent 接口: id, component, order, weight, config
   - ISlot 接口: name, contents, parent
   
   apps/web_builder/src/core/slots/SlotRegistry.ts:
   - @injectable() 装饰
   - slots Map 存储所有插槽
   - defineSlot(name, parent?) 定义插槽
   - registerContent(slotName, content) 注册内容
   - unregisterContent(slotName, contentId) 注销内容
   - getContents(slotName) 获取插槽内容列表
   - hasSlot(name) 检查插槽是否存在

   apps/web_builder/src/core/slots/SlotRenderer.tsx:
   - React 组件，接收 slotName
   - 从 SlotRegistry 获取内容
   - 按 order 排序渲染
   - 支持 weight 布局（flex）

2. 创建扩展系统:
   apps/web_builder/src/core/extensions/types.ts:
   - IExtension 接口: id, name, version, dependencies, init, activate, deactivate, dispose
   - IExtensionContext 接口: editor, defineSlot, registerSlot, unregisterSlot, getService, registerService, on/off/emit
   
   apps/web_builder/src/core/extensions/ExtensionContext.ts:
   - 实现 IExtensionContext 接口
   - 封装 SlotRegistry, EventBus 调用
   
   apps/web_builder/src/core/extensions/ExtensionLoader.ts:
   - @injectable() 装饰
   - extensions 数组存储已加载扩展
   - contexts Map 存储扩展上下文
   - load(extensions, editor) 按依赖拓扑排序加载
   - sortByDependencies() 依赖排序（检测循环依赖）
   - createContext() 创建扩展上下文
   - activateAll() 激活所有扩展

3. 创建事件总线:
   apps/web_builder/src/core/events/EventBus.ts:
   - @injectable() 装饰
   - listeners Map 存储事件监听
   - on(event, handler) 订阅
   - off(event, handler) 取消订阅
   - once(event, handler) 一次性订阅
   - emit(event, data) 发布，支持通配符匹配
   - clear() 清空所有监听

4. 更新 OrangeEditor:
   apps/web_builder/src/core/editor.ts:
   - 注入 SlotRegistry, ExtensionLoader, EventBus
   - defineCoreSlots() 定义 header, left-panel, center, right-panel, float 及其子插槽
   - mount() 调用 defineCoreSlots() 和 extensionLoader.load()
   - 返回 EditorView 组件
   - unmount() 触发 editor:unmount 事件

5. 创建基础扩展占位:
   apps/web_builder/src/extensions/core/store/index.ts - Store 扩展占位
   apps/web_builder/src/extensions/ui/header/index.ts - Header UI 扩展占位
   apps/web_builder/src/extensions/ui/left-panel/index.ts - LeftPanel UI 扩展占位
   apps/web_builder/src/extensions/ui/right-panel/index.ts - RightPanel UI 扩展占位
   apps/web_builder/src/extensions/ui/center-canvas/index.ts - CenterCanvas UI 扩展占位
   apps/web_builder/src/extensions/features/component-panel/index.ts - 组件面板扩展占位
   apps/web_builder/src/extensions/features/layer-tree/index.ts - 图层树扩展占位
   apps/web_builder/src/extensions/features/properties-panel/index.ts - 属性面板扩展占位
   apps/web_builder/src/extensions/editing/select/index.ts - 选择扩展占位

6. 创建 EditorView 组件:
   apps/web_builder/src/core/components/EditorView.tsx:
   - 使用 Semi Design Layout 组件
   - 使用 SlotRenderer 渲染 header, left-panel, center, right-panel
   - 基础布局结构

7. 更新 apps/web_builder/src/index.ts:
   - 导出 OrangeEditor, SlotRegistry, ExtensionLoader, EventBus
   - 导出 IExtension, IExtensionContext, ISlotContent
   - 导出 schemaOperator（占位）

8. 创建基础工具:
   apps/web_builder/src/utils/id.ts - generateId() 使用 nanoid
   apps/web_builder/src/utils/clone.ts - deepClone()
   apps/web_builder/src/common/base/schemaOperator/index.ts - SchemaOperator 占位

验证:
1. cd apps/web_builder && rushx type-check (无错误)
2. rush build -t @orangehome/web_builder (成功)
3. 创建测试文件验证插槽注册:
   ```ts
   const registry = container.get(SlotRegistry);
   registry.defineSlot('test');
   registry.registerContent('test', { id: 'a', component: () => null, order: 1 });
   console.log(registry.getContents('test').length); // 应为 1
   ```

确保插槽系统和扩展系统架构正确，为后续功能扩展打好基础。
```

---

*由 GSD 生成 - Rush Monorepo 版本*
